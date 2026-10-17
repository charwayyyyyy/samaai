import {
  DEFAULT_NODE_SIZES,
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type CanvasShape,
} from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

type TemplateNodeOptions = {
  id: string;
  label: string;
  x: number;
  y: number;
  shape: CanvasShape;
  color: keyof typeof NODE_COLORS;
};

/** Builds a canvas node for a starter template from the given position, shape, and color. */
function templateNode({
  id,
  label,
  x,
  y,
  shape,
  color,
}: TemplateNodeOptions): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    style: DEFAULT_NODE_SIZES[shape],
    data: { label, color, shape },
  };
}

/** Builds a canvas edge connecting two template nodes, with an optional label. */
function templateEdge(
  id: string,
  source: string,
  target: string,
  label?: string,
): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: label ? { label } : {},
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "A gateway routes requests to independently deployable services backed by shared infrastructure.",
    nodes: [
      templateNode({
        id: "micro-gateway",
        label: "API Gateway",
        x: 40,
        y: 150,
        shape: "hexagon",
        color: "blue",
      }),
      templateNode({
        id: "micro-users",
        label: "Users Service",
        x: 300,
        y: 40,
        shape: "pill",
        color: "purple",
      }),
      templateNode({
        id: "micro-orders",
        label: "Orders Service",
        x: 300,
        y: 180,
        shape: "pill",
        color: "orange",
      }),
      templateNode({
        id: "micro-database",
        label: "Data Store",
        x: 590,
        y: 110,
        shape: "cylinder",
        color: "green",
      }),
    ],
    edges: [
      templateEdge("micro-gateway-users", "micro-gateway", "micro-users"),
      templateEdge("micro-gateway-orders", "micro-gateway", "micro-orders"),
      templateEdge("micro-users-data", "micro-users", "micro-database"),
      templateEdge("micro-orders-data", "micro-orders", "micro-database"),
    ],
  },
  {
    id: "ci-cd-pipeline",
    name: "CI/CD Pipeline",
    description: "Code moves from a commit through automated checks and deployment environments.",
    nodes: [
      templateNode({
        id: "pipeline-commit",
        label: "Commit",
        x: 30,
        y: 120,
        shape: "circle",
        color: "teal",
      }),
      templateNode({
        id: "pipeline-build",
        label: "Build",
        x: 220,
        y: 120,
        shape: "pill",
        color: "blue",
      }),
      templateNode({
        id: "pipeline-test",
        label: "Test",
        x: 430,
        y: 120,
        shape: "diamond",
        color: "orange",
      }),
      templateNode({
        id: "pipeline-production",
        label: "Production",
        x: 680,
        y: 120,
        shape: "hexagon",
        color: "green",
      }),
    ],
    edges: [
      templateEdge("pipeline-commit-build", "pipeline-commit", "pipeline-build"),
      templateEdge("pipeline-build-test", "pipeline-build", "pipeline-test"),
      templateEdge(
        "pipeline-test-production",
        "pipeline-test",
        "pipeline-production",
        "Deploy",
      ),
    ],
  },
  {
    id: "event-driven",
    name: "Event-driven system",
    description: "Producers publish events to a broker that fans out work to asynchronous consumers.",
    nodes: [
      templateNode({
        id: "event-producer",
        label: "Producer",
        x: 30,
        y: 150,
        shape: "pill",
        color: "purple",
      }),
      templateNode({
        id: "event-broker",
        label: "Event Bus",
        x: 300,
        y: 150,
        shape: "cylinder",
        color: "orange",
      }),
      templateNode({
        id: "event-worker",
        label: "Worker",
        x: 590,
        y: 50,
        shape: "rectangle",
        color: "blue",
      }),
      templateNode({
        id: "event-notifier",
        label: "Notifier",
        x: 590,
        y: 250,
        shape: "rectangle",
        color: "teal",
      }),
    ],
    edges: [
      templateEdge("event-producer-broker", "event-producer", "event-broker", "Publish"),
      templateEdge("event-broker-worker", "event-broker", "event-worker"),
      templateEdge("event-broker-notifier", "event-broker", "event-notifier"),
    ],
  },
];
