import json
import random
import cv2
import numpy as np
import matplotlib.pyplot as plt
from math import hypot

# -------------------------
# Parameters you can tune:
# -------------------------
IMAGE_PATH = "us_outline.png"
STEP = 5         # subsample every STEP-th contour point (helps reduce noise before RDP)
EPS = 2.5        # RDP epsilon (distance tolerance). Increase => fewer points.
# -------------------------

# Load the image (grayscale)
image = cv2.imread(IMAGE_PATH, cv2.IMREAD_GRAYSCALE)
if image is None:
    raise FileNotFoundError(f"Could not open image at '{IMAGE_PATH}'")

# Threshold the image (black-and-white)
_, thresh = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY_INV)

# Optional: Close gaps (helps with broken outlines)
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

# Find contours
contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)

# Select the largest contour (assuming it's the main object)
if not contours:
    raise RuntimeError("No contours found in the image.")
largest_contour = max(contours, key=cv2.contourArea)

# Convert to simple (x, y) points
points = largest_contour.squeeze()  # shape: (N, 2)
if points.ndim != 2 or points.shape[1] != 2:
    # If contour had only one point or weird shape, ensure it's (N,2)
    points = np.atleast_2d(points)

# Optional: Subsample points for smoother tracing
points_sampled = points[::STEP]

# Create JSON-friendly list (we'll use this as "original sampled" with sizes)
points_json = [
    {"x": int(p[0]), "y": int(p[1]), "size": random.randint(3, 5)}
    for p in points_sampled
]

# -------------------------
# Ramer–Douglas–Peucker
# -------------------------
def point_line_distance(pt, start, end):
    """
    Distance from point pt to the line segment start->end.
    pt, start, end are (x, y) tuples or lists.
    """
    x0, y0 = pt
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return hypot(x0 - x1, y0 - y1)
    t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx*dx + dy*dy)
    if t < 0.0:
        # nearest to start
        return hypot(x0 - x1, y0 - y1)
    elif t > 1.0:
        # nearest to end
        return hypot(x0 - x2, y0 - y2)
    projx = x1 + t * dx
    projy = y1 + t * dy
    return hypot(x0 - projx, y0 - projy)

def rdp(points_xy, eps):
    """
    Classic recursive Ramer–Douglas–Peucker implementation.
    points_xy: list of (x, y) tuples
    eps: tolerance (float)
    Returns simplified list of (x, y) tuples (endpoints preserved).
    """
    if len(points_xy) < 3:
        return points_xy[:]
    start = points_xy[0]
    end = points_xy[-1]
    max_dist = 0.0
    index = -1
    # find farthest point from segment (start, end)
    for i in range(1, len(points_xy) - 1):
        d = point_line_distance(points_xy[i], start, end)
        if d > max_dist:
            max_dist = d
            index = i
    if max_dist > eps:
        # recursive split
        left = rdp(points_xy[:index+1], eps)
        right = rdp(points_xy[index:], eps)
        # combine (avoid duplicating the middle point)
        return left[:-1] + right
    else:
        # everything approximated by the segment [start, end]
        return [start, end]

# Run RDP on the sampled points
xy_sampled = [(p["x"], p["y"]) for p in points_json]
simplified_xy = rdp(xy_sampled, EPS)

# Make sure endpoints preserved (just in case)
if simplified_xy[0] != xy_sampled[0]:
    simplified_xy.insert(0, xy_sampled[0])
if simplified_xy[-1] != xy_sampled[-1]:
    simplified_xy.append(xy_sampled[-1])

# Reattach size: choose size from nearest sampled point for each simplified coordinate
def nearest_size(pt, sampled_points):
    min_d = float("inf")
    chosen_size = sampled_points[0]["size"]
    px, py = pt
    for s in sampled_points:
        d = hypot(px - s["x"], py - s["y"])
        if d < min_d:
            min_d = d
            chosen_size = s["size"]
    return chosen_size

simplified_points = [
    {"x": int(x), "y": int(y), "size": int(nearest_size((x,y), points_json))}
    for x,y in simplified_xy
]

# Save sampled and simplified JSON to files
with open("outline_points.json", "w") as f:
    json.dump(points_json, f, indent=4)

with open("simplified_outline_points.json", "w") as f:
    json.dump(simplified_points, f, indent=4)

print(f"Saved {len(points_json)} sampled points to outline_points.json")
print(f"Saved {len(simplified_points)} simplified points to simplified_outline_points.json (EPS={EPS})")

# -------------------------
# Visualization (4-pane)
# -------------------------
fig, axs = plt.subplots(1, 4, figsize=(22, 6))

# 1. Original Image
axs[0].imshow(image, cmap='gray')
axs[0].set_title("Original Image")
axs[0].axis('off')

# 2. Binary Mask after Threshold + Closing
axs[1].imshow(closed, cmap='gray')
axs[1].set_title("Binary Mask")
axs[1].axis('off')

# 3. Full Contour Overlay
axs[2].imshow(image, cmap='gray')
axs[2].plot(points[:, 0], points[:, 1], 'r-', linewidth=1)
axs[2].set_title("Full Contour")
axs[2].axis('off')

# 4. Sampled and Simplified Points for Tracing
axs[3].imshow(image, cmap='gray')
# draw sampled polyline (thin, semi-transparent)
sx = [p["x"] for p in points_json] + [points_json[0]["x"]]
sy = [p["y"] for p in points_json] + [points_json[0]["y"]]
axs[3].plot(sx, sy, linewidth=0.8, alpha=0.4)

# draw simplified polyline (markers show vertices)
simp_x = [p["x"] for p in simplified_points] + [simplified_points[0]["x"]]
simp_y = [p["y"] for p in simplified_points] + [simplified_points[0]["y"]]
axs[3].plot(simp_x, simp_y, marker='o', linewidth=1.5)
axs[3].set_title("Sampled (thin) + Simplified (markers)")
axs[3].axis('off')

plt.tight_layout()
plt.show()

# End of script
