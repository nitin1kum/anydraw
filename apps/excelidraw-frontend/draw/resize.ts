// resize.ts
// ResizeTool manages resizing a selected shape via handles (8 handles).
// It provides hit-testing for handles, draw preview, and resize math for rectangles, diamonds & circles.

import type { StoredShape, Shape } from "./Game";

type HandleName = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export class ResizeTool {
  private activeHandle: HandleName | null = null;
  private startPointer: { x: number; y: number } | null = null;
  private originalShape: Shape | null = null;
  private selectedId: string | null = null;
  private handleSize = 12; // pixels: the drawn square handle is handleSize x handleSize

  // compute bounding box for a shape (x,y,w,h)
  private bbox(shape: Shape) {
    if (shape.type === "rect") {
      return { x: shape.x, y: shape.y, w: shape.width, h: shape.height };
    } else if (shape.type === "circle") {
      const r = Math.abs(shape.radius);
      return { x: shape.centerX - r, y: shape.centerY - r, w: 2 * r, h: 2 * r };
    } else if (shape.type === "diamond") {
      return { x: shape.centerX - shape.width / 2, y: shape.centerY - shape.height / 2, w: shape.width, h: shape.height };
    } else if (shape.type === "text") {
      return { x: shape.x, y: shape.y, w: shape.width, h: shape.height };
    } else if (shape.type === "line" || shape.type === "arrow") {
      const x1 = (shape as any).startX, y1 = (shape as any).startY, x2 = (shape as any).endX, y2 = (shape as any).endY;
      const x = Math.min(x1, x2), y = Math.min(y1, y2);
      return { x, y, w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
    } else if (shape.type === "pencil") {
      const path = shape.path || [];
      if (path.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
      let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
      for (const p of path) {
        minx = Math.min(minx, p[0]);
        maxx = Math.max(maxx, p[0]);
        miny = Math.min(miny, p[1]);
        maxy = Math.max(maxy, p[1]);
      }
      return { x: minx, y: miny, w: maxx - minx, h: maxy - miny };
    }
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  // compute handle centers for bbox
  private handlesFor(bbox: { x: number; y: number; w: number; h: number }) {
    const cx = bbox.x + bbox.w / 2;
    const cy = bbox.y + bbox.h / 2;
    return {
      nw: { x: bbox.x, y: bbox.y },
      n: { x: cx, y: bbox.y },
      ne: { x: bbox.x + bbox.w, y: bbox.y },
      e: { x: bbox.x + bbox.w, y: cy },
      se: { x: bbox.x + bbox.w, y: bbox.y + bbox.h },
      s: { x: cx, y: bbox.y + bbox.h },
      sw: { x: bbox.x, y: bbox.y + bbox.h },
      w: { x: bbox.x, y: cy },
    };
  }

  // returns which handle (if any) contains point (x,y)
  hitTestHandles(x: number, y: number, shape: Shape): HandleName | null {
    const bbox = this.bbox(shape);
    const handles = this.handlesFor(bbox);
    const half = this.handleSize / 2;
    for (const k of Object.keys(handles) as HandleName[]) {
      const h = handles[k];
      if (Math.abs(x - h.x) <= half && Math.abs(y - h.y) <= half) return k;
    }
    return null;
  }

  startResize(id: string, shape: Shape, pointerX: number, pointerY: number, handle: HandleName) {
    this.activeHandle = handle;
    this.startPointer = { x: pointerX, y: pointerY };
    // deep clone original shape to allow non-destructive preview edits
    this.originalShape = JSON.parse(JSON.stringify(shape));
    this.selectedId = id;
  }

  // Utility: given original bbox and an active handle, compute new bbox after dx/dy
  private computeNewBBoxFromHandle(origBBox: { x: number; y: number; w: number; h: number }, handle: HandleName, dx: number, dy: number) {
    let left = origBBox.x;
    let top = origBBox.y;
    let right = origBBox.x + origBBox.w;
    let bottom = origBBox.y + origBBox.h;

    switch (handle) {
      case "nw":
        left += dx; top += dy; break;
      case "n":
        top += dy; break;
      case "ne":
        right += dx; top += dy; break;
      case "e":
        right += dx; break;
      case "se":
        right += dx; bottom += dy; break;
      case "s":
        bottom += dy; break;
      case "sw":
        left += dx; bottom += dy; break;
      case "w":
        left += dx; break;
    }

    // enforce min size
    const minSize = 6;
    if (right - left < minSize) {
      // clamp by adjusting the side that moved
      if (handle === "nw" || handle === "w" || handle === "sw") {
        left = right - minSize;
      } else {
        right = left + minSize;
      }
    }
    if (bottom - top < minSize) {
      if (handle === "nw" || handle === "n" || handle === "ne") {
        top = bottom - minSize;
      } else {
        bottom = top + minSize;
      }
    }

    return { x: left, y: top, w: right - left, h: bottom - top };
  }

  // apply delta pointer movement to original shape and return new shape (modified copy)
  applyResize(pointerX: number, pointerY: number): Shape | null {
    if (!this.activeHandle || !this.startPointer || !this.originalShape) return null;
    const dx = pointerX - this.startPointer.x;
    const dy = pointerY - this.startPointer.y;
    const s = JSON.parse(JSON.stringify(this.originalShape)) as Shape;

    // Common helper: original bbox
    const origBBox = this.bbox(this.originalShape);

    if (s.type === "rect") {
      const newBBox = this.computeNewBBoxFromHandle(origBBox, this.activeHandle, dx, dy);
      s.x = newBBox.x;
      s.y = newBBox.y;
      s.width = Math.max(6, newBBox.w);
      s.height = Math.max(6, newBBox.h);
      return s;
    } else if (s.type === "circle") {
      // For circles, treat them as a bounding square; preserve circular aspect.
      const newBBox = this.computeNewBBoxFromHandle(origBBox, this.activeHandle, dx, dy);

      // Use the larger of new width/height to keep a true circle (not ellipse).
      const size = Math.max(newBBox.w, newBBox.h, 6);
      // Center equals bbox center
      const cx = newBBox.x + newBBox.w / 2;
      const cy = newBBox.y + newBBox.h / 2;
      s.centerX = cx;
      s.centerY = cy;
      s.radius = Math.max(3, size / 2);
      return s;
    } else if (s.type === "diamond") {
      // Diamonds represented by center + width/height
      // Compute new bbox and update center/width/height accordingly.
      const newBBox = this.computeNewBBoxFromHandle(origBBox, this.activeHandle, dx, dy);
      s.width = Math.max(6, newBBox.w);
      s.height = Math.max(6, newBBox.h);
      s.centerX = newBBox.x + newBBox.w / 2;
      s.centerY = newBBox.y + newBBox.h / 2;
      return s;
    } else if (s.type === "line" || s.type === "arrow") {
      // Move the endpoint corresponding to the handle side (left handles -> start, right handles -> end)
      // We'll choose based on which endpoint is closer to the handle's side in the orig bbox.
      const leftHandles = new Set<HandleName>(["nw", "w", "sw"]);
      const rightHandles = new Set<HandleName>(["ne", "e", "se"]);
      if (leftHandles.has(this.activeHandle)) {
        (s as any).startX += dx;
        (s as any).startY += dy;
      } else if (rightHandles.has(this.activeHandle)) {
        (s as any).endX += dx;
        (s as any).endY += dy;
      } else {
        // For top/bottom handles, move the closer endpoint (choose based on y)
        const startY = (this.originalShape as any).startY;
        const endY = (this.originalShape as any).endY;
        if (Math.abs(startY - origBBox.y) < Math.abs(endY - origBBox.y)) {
          (s as any).startX += dx; (s as any).startY += dy;
        } else {
          (s as any).endX += dx; (s as any).endY += dy;
        }
      }
      return s;
   } else if (s.type === "text") {
        const newBBox = this.computeNewBBoxFromHandle(origBBox, this.activeHandle, dx, dy);
        s.x = newBBox.x;
        s.y = newBBox.y;
        s.width = Math.max(30, newBBox.w);
        if (  this.activeHandle === "n" || this.activeHandle === "s" ||
              this.activeHandle === "nw" || this.activeHandle === "ne" ||
              this.activeHandle === "sw" || this.activeHandle === "se"
            ) {
              const scaleY = newBBox.h / origBBox.h;
              const newFontSize = Math.max(8, (s.fontSize || 16) * scaleY);
              s.fontSize = newFontSize;
            }
                  // auto-expand height: recompute from text wrapping
        if(s.text){
        const ctx = document.createElement("canvas").getContext("2d")!;
        ctx.font = `${s.fontSize}px ${s.fontFamily}`;
        const words = s.text.split(/\s+/);
        const lines: string[] = [];
        let currentLine = "";
        for (const word of words) {
          const testLine = currentLine ? currentLine + " " + word : word;
          if (ctx.measureText(testLine).width > s.width && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeightPx = (s.fontSize || 12) * (s.lineHeight || 1.2);
        s.height = lines.length * lineHeightPx;
      } else{
        s.height = Math.max(20, newBBox.h);
      }
        return s;
      } else if (s.type === "pencil") {
      // Two reasonable options:
      // 1) simple translate (what older code did) -> safe, predictable
      // 2) scale about bbox center -> more powerful but can distort stroke widths and requires re-sampling
      //
      // We'll implement a center-based scale for corner/edge handles to make resizing feel like other shapes.
      // But to keep it conservative, if bbox has zero size we fallback to translate.

      const origW = origBBox.w || 1;
      const origH = origBBox.h || 1;
      const newBBox = this.computeNewBBoxFromHandle(origBBox, this.activeHandle, dx, dy);
      const scaleX = newBBox.w / origW;
      const scaleY = newBBox.h / origH;
      const cx = origBBox.x + origBBox.w / 2;
      const cy = origBBox.y + origBBox.h / 2;

      // Apply scale and translate so center remains at new center
      const newCx = newBBox.x + newBBox.w / 2;
      const newCy = newBBox.y + newBBox.h / 2;
      const translateX = newCx - cx * scaleX + (scaleX - 1) * cx * 0; // simplified
      const translateY = newCy - cy * scaleY + (scaleY - 1) * cy * 0;

      // Map each path point: scale about original center and then shift to new center
      const newPath = (s.path || []).map((p) => {
        const sx = ((p[0] - cx) * scaleX) + newCx;
        const sy = ((p[1] - cy) * scaleY) + newCy;
        return [sx, sy] as [number, number];
      });
      s.path = newPath;
      return s;
    }
    return null;
  }

  drawHandles(ctx: CanvasRenderingContext2D, shape: Shape) {
    const bbox = this.bbox(shape);
    const handles = this.handlesFor(bbox);
    ctx.save();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    const half = this.handleSize / 2;
    for (const k of Object.keys(handles) as HandleName[]) {
      const h = handles[k];
      ctx.beginPath();
      ctx.rect(h.x - half, h.y - half, this.handleSize, this.handleSize);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  }

  // called to finish resize (clear state)
  finishResize() {
    this.activeHandle = null;
    this.startPointer = null;
    this.originalShape = null;
    this.selectedId = null;
  }

  isResizing() {
    return this.activeHandle !== null;
  }

  getSelectedId() { return this.selectedId; }
  setSelectedId(id: string | null) { this.selectedId = id; }
}
