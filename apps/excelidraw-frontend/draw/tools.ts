export type Tools =  "select" | "text" | "circle" | "rect" | "pencil" | "line" | "eraser" | "arrow" | "diamond"|"Hand"| "resize";

export type TextBox = {
  type: "text";
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  textAlign: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
  strokeColor?: string;
  strokeWidth?: number;
};