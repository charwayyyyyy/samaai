import type { Edge, Node } from "@xyflow/react";

export const NODE_COLORS = {
  neutral: { fill: "#1f1f1f", text: "#ededed" },
  blue: { fill: "#10233d", text: "#52a8ff" },
  purple: { fill: "#2e1938", text: "#bf7af0" },
  orange: { fill: "#331b00", text: "#ff990a" },
  red: { fill: "#3c1618", text: "#ff6166" },
  pink: { fill: "#3a1726", text: "#f75f8f" },
  green: { fill: "#0f2e18", text: "#62c073" },
  teal: { fill: "#062822", text: "#0ac7b4" },
} as const;

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type CanvasShape = (typeof NODE_SHAPES)[number];

export interface CanvasShapeSize {
  width: number;
  height: number;
}

export interface CanvasShapeDragPayload {
  type: "canvasNode";
  shape: CanvasShape;
  size: CanvasShapeSize;
}

export const DEFAULT_NODE_SIZES: Record<CanvasShape, CanvasShapeSize> = {
  rectangle: { width: 180, height: 72 },
  diamond: { width: 192, height: 96 },
  circle: { width: 96, height: 96 },
  pill: { width: 180, height: 64 },
  cylinder: { width: 168, height: 96 },
  hexagon: { width: 176, height: 88 },
};

export type CanvasNodeData = {
  label: string;
  color: string;
  shape: CanvasShape;
};

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string;
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">;
