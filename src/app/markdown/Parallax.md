# 2.5D Camera Dolly & Parallax Algorithm Implementation Guide

This document details the mathematical framework for simulating a 3D camera dolly, zoom, and rotation within a 2D rendering environment (Canvas, DOM, SVG, etc.).

## 1. Core Concepts & Definitions

To mimic a camera flying toward a target, we manipulate the 2D coordinates of all objects in the scene relative to the viewport center.

### Variables
*   **$C$ (Viewport Center):** The coordinates of the center of the user's screen $(W/2, H/2)$.
*   **$T$ (Target Object):** The object being focused on.
    *   $T_{pos}$: Original world position $(x, y)$.
    *   $T_{rot}$: Original rotation (degrees).
    *   $T_{zoom}$: The scale factor the camera should zoom to (e.g., 2.5x).
*   **$O$ (Other Object):** A foreground/background object being manipulated.
    *   $O_{pos}$: Original world position $(x, y)$.
    *   $O_{depth}$: Z-axis multiplier.
        *   $Depth < 1$: Background (Moves slower than target).
        *   $Depth = 1$: Focal Plane (Moves with target).
        *   $Depth > 1$: Foreground (Moves faster than target).

---

## 2. Phase 1: Focusing (The Dolly In)

When a target is selected, we calculate the destination transform for every other object ($O$) in the scene.

### Step 1: Vector Calculation (Relative Position)
Determine the vector from the **Target** to the **Other Object**. This ignores screen coordinates and establishes their relationship in "World Space."

$$V_x = O_{pos}.x - T_{pos}.x$$
$$V_y = O_{pos}.y - T_{pos}.y$$

### Step 2: Radial Expansion (The Dolly Effect)
As a camera moves closer to a specific point, objects do not just translate linearly; they expand outwards radially from the focus point. Objects closer to the camera ($Depth > 1$) expand faster.

Calculate the **Expansion Factor** ($E$):

$$E = 1 + (T_{zoom} - 1) \times O_{depth}$$

*Example:* If Target Zoom is 2.0 (2x) and Object Depth is 1.5 (Foreground):
$E = 1 + (1) \times 1.5 = 2.5$. The object moves 2.5x further away from the focal point.

Apply this to find the **Unrotated Screen Position** ($P_{raw}$):

$$P_{raw}.x = C.x + (V_x \times E)$$
$$P_{raw}.y = C.y + (V_y \times E)$$

### Step 3: Orbital Rotation (The "Spinning World")
Since the camera rotates to align the Target to $0\degree$, the rest of the world must counter-rotate around the Viewport Center.

Calculate the rotation angle $\theta$ (in radians):
$$\theta = (-T_{rot} \times \pi) / 180$$

Apply the 2D Rotation Matrix around Center $C$:

$$P_{final}.x = C.x + (P_{raw}.x - C.x)\cos(\theta) - (P_{raw}.y - C.y)\sin(\theta)$$
$$P_{final}.y = C.y + (P_{raw}.x - C.x)\sin(\theta) + (P_{raw}.y - C.y)\cos(\theta)$$

### Step 4: Local Transformation
The object itself must scale up and counter-rotate to maintain its orientation relative to the world.

*   **Final Scale:** $S_{final} = S_{original} \times E$
*   **Final Rotation:** $R_{final} = R_{original} - T_{rot}$
*   **Final Opacity:** If $Depth > 1$ and the object is moving off-screen, interpolate Opacity to 0.

---

## 3. Phase 2: Unfocusing (The Return Arc)

Standard linear interpolation (tweening $x/y$) causes objects to cut across the screen in a straight line, breaking the "spinning world" illusion. We must animate along an **Arc**.

### The "Pivot Trick" Logic
Instead of calculating a Bezier curve for the $(x,y)$ path, we manipulate the **Transformation Pivot (Anchor Point)**.

### Step 1: Shift Pivot to Viewport Center
We temporarily move the object's rotational origin to the Viewport Center ($C$).

Calculate the offset required to place the object at its "Home" position ($O_{pos}$) relative to $C$:

$$Offset_x = C.x - O_{pos}.x + LocalCenter.x$$
$$Offset_y = C.y - O_{pos}.y + LocalCenter.y$$

### Step 2: Set Initial "Deep" State
Before the animation starts, snap the object to the state calculated in Phase 1 (The Parallax State).
*   **Position:** $C.x, C.y$ (Object is anchored to screen center).
*   **Offset:** The calculated offsets from Step 1.
*   **Rotation:** $R_{original} - T_{rot}$
*   **Scale:** $S_{original} \times E$
*   **Opacity:** 0

### Step 3: Animate Rotation
Tween the properties back to their original values:
*   **Rotation** $\rightarrow$ $R_{original}$
*   **Scale** $\rightarrow$ $S_{original}$
*   **Opacity** $\rightarrow$ 1

*Result:* Because the pivot is at the screen center, tweening the rotation causes the object to swing in a perfect arc back to its home position.

### Step 4: Cleanup (Critical)
When the animation finishes, you **must** reset the coordinates to standard local space to ensure mouse interactions (hover, click) work correctly on the object itself.

*   Set $x, y$ back to $O_{pos}$.
*   Set Pivot/Offset back to local center.

---

## 4. Implementation Guards

### Race Conditions (The "Veer")
If the `FocusedObject` ID updates before the `TargetCoordinates` are calculated, the math will use $(0,0)$ or stale coordinates, causing the object to move toward the center before snapping to the correct path.

**Logic Guard:**

```
if (isFocused && !TargetCoordinates) {
   // STOP. Do not start animation.
   // Wait for data to populate.
   return;
}
```

### The "Foreground Clutter" Fix
Foreground objects ($Depth > 1$) can scale up massively (e.g., 5x) and block the view as they move off-screen.

**Logic:**
If calculating Phase 1 (Focusing), apply a `MovementMultiplier` to the vector length.
$$MovementMultiplier = ExpansionFactor \times 1.2$$
This ensures the object translates away faster than it scales up, clearing the viewport.