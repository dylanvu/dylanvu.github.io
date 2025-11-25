# 2.5D Camera Dolly & Parallax Algorithm Implementation Guide

This document details the mathematical framework and implementation strategy for simulating a 3D camera dolly, zoom, and rotation within a 2D rendering environment (Konva/Canvas).

## 1. Core Concepts & Definitions

To mimic a camera flying toward a target, we manipulate the 2D coordinates of all objects in the scene relative to a "Moving Origin."

### Variables
*   **$C$ (Window Center):** The fixed center coordinates of the viewport $(W/2, H/2)$.
*   **$T$ (Target Object):** The star/constellation being focused on.
    *   $T_{home}$: Original world position $(x, y)$.
    *   $T_{rot}$: Original rotation (degrees).
    *   $T_{zoom}$: The scale factor the camera should zoom to (e.g., 2.5x).
*   **$O$ (Other Object):** A neighbor or foreground object being manipulated.
    *   $O_{pos}$: Original world position $(x, y)$.
    *   $O_{depth}$: Z-axis multiplier.
        *   $Depth \approx 3.5$: Standard Background.
        *   $Depth > 5.0$: Foreground (Polaris).
*   **$p$ (Progress):** A value from $0.0$ to $1.0$ representing the camera's travel percentage.
    *   $p=0$: Camera is at "Home" (World View).
    *   $p=1$: Camera is at "Target" (Deep Space View).

---

## 2. The Unified Camera Model

Previous attempts using linear tweening (flat movement) or pivot-point manipulation (snapping issues) failed. The solution is a **Unified Parametric Function** that drives Position, Scale, and Rotation simultaneously based on $p$.

### Step 1: The Moving Origin
In a real 3D camera move, the perspective shifts. In 2D, we simulate this by sliding the "World Center" from the Target's original position to the Screen Center.

$$Origin_x(p) = T_{home}.x + (C.x - T_{home}.x) \times p$$
$$Origin_y(p) = T_{home}.y + (C.y - T_{home}.y) \times p$$

### Step 2: Radial Expansion (Dolly Zoom)
As the camera moves closer, objects expand outward radially from the center. The expansion is non-linear based on depth.

$$E_{factor} = 1 + (T_{zoom} - 1) \times O_{depth}$$
$$CurrentScale(p) = 1 + (E_{factor} - 1) \times p$$

### Step 3: Rigid Body Rotation (Camera Roll)
The camera rotates to align the target to $0\degree$. To simulate this, the entire world must counter-rotate around the Moving Origin.

$$RotationOffset(p) = T_{rot} \times p$$

### Step 4: The Vector Transform
We calculate the vector from the **Target** to the **Object**, scale it, rotate it, and apply it to the **Moving Origin**.

1.  **Base Vector:**
    $$V_x = O_{pos}.x - T_{home}.x$$
    $$V_y = O_{pos}.y - T_{home}.y$$

2.  **Scale Vector:**
    $$V'_x = V_x \times CurrentScale(p)$$
    $$V'_y = V_y \times CurrentScale(p)$$

3.  **Rotate Vector (2D Rotation Matrix):**
    $$\theta = (-RotationOffset(p) \times \pi) / 180$$
    $$Final_x = Origin_x(p) + (V'_x \cos\theta - V'_y \sin\theta)$$
    $$Final_y = Origin_y(p) + (V'_x \sin\theta + V'_y \cos\theta)$$

---

## 3. Solving Artifacts (Stutter & Flash)

Mathematical precision is not enough; React render cycles introduce visual artifacts. We solve these using **State Locking** and **Layout Effects**.

### 1. The "Unfocus Flash"
*   **Problem:** When unfocusing, React renders the component with its default props (Home Position) for one frame before the animation starts, causing a visual flash.
*   **Solution:**
    *   We use `useLayoutEffect` (synchronous) instead of `useEffect`.
    *   We manually calculate the transform at $p=1$ (Deep Space).
    *   We force-apply these coordinates to the DOM node *immediately* before the browser paints.
    *   We set `opacity: 0` initially, then fade in, ensuring no jumps are visible.

### 2. The "Return Trip" Jitter
*   **Problem:** If the `Target` coordinates shift slightly (e.g., due to window resizing or floating point math) while focused, the return animation calculates a different path than the entry animation, causing a jump.
*   **Solution:** **Geometry Locking.**
    *   When an object enters the "Focused" state, we capture the exact world coordinates of the Target into a `ref`.
    *   When Unfocusing, we ignore the current live data and use the **Locked Data** to calculate the return path.
    *   This guarantees $ExitPath \equiv EntryPath$.

### 3. The "Unified Driver" Pattern
Instead of tweening `x` and `y` properties directly (which results in linear movement), we tween a custom attribute `animProgress`.

```
// Konva Tween Config
{
  node: groupRef.current,
  duration: 0.5,
  animProgress: 1, // We tween this abstract number from 0 to 1
  onUpdate: () => {
    // We manually call the math function every frame
    const p = node.getAttr('animProgress');
    const state = calculateParallaxTransform(p, ...lockedData);
    
    // And apply the result
    node.setAttrs(state);
  }
}
```
This forces the object to follow the calculated arc perfectly.

---

## 4. Implementation Guards

### Race Conditions
If `parallaxFocusData` is missing (e.g., on first load), the math will return $(0,0)$.
**Guard:**
```
if (!parallaxFocusData || !focusedConstellation) return null;
```

### Foreground Physics (Polaris)
Foreground objects need to move faster than the background to create depth.
**Logic:**
We pass a `depth` parameter to the hook.
*   Standard Constellations: `depth = 3.5`
*   Polaris (Foreground): `depth = 6.0`

This multiplier dramatically increases `ExpansionFactor`, causing the object to fly off-screen faster, simulating extreme proximity to the camera.