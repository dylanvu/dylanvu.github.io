import json
import random
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Load the image
image = cv2.imread('us_outline.png', cv2.IMREAD_GRAYSCALE)

# Threshold the image (black-and-white)
_, thresh = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY_INV)

# Optional: Close gaps (helps with broken outlines)
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

# Find contours
contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)

# Select the largest contour (assuming it's the main object)
largest_contour = max(contours, key=cv2.contourArea)

# Convert to simple (x, y) points
points = largest_contour.squeeze()  # shape: (N, 2)

# Optional: Subsample points for smoother tracing
step = 5  # pick every 5th point
points_sampled = points[::step]

# ====== Combined Visualization ======
fig, axs = plt.subplots(1, 4, figsize=(20, 5))

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

# 4. Sampled Points for Tracing
axs[3].imshow(image, cmap='gray')
axs[3].plot(points[:, 0], points[:, 1], 'r-', linewidth=0.5, alpha=0.5)
axs[3].scatter(points_sampled[:, 0], points_sampled[:, 1], c='blue', s=10)
axs[3].set_title("Sampled Points")
axs[3].axis('off')

plt.tight_layout()
plt.show()

# Create JSON-friendly list
points_json = [
    {"x": int(p[0]), "y": int(p[1]), "size": random.randint(3, 5)}
    for p in points_sampled
]

# Save to file
with open("outline_points.json", "w") as f:
    json.dump(points_json, f, indent=4)

print(f"Saved {len(points_json)} points to outline_points.json")