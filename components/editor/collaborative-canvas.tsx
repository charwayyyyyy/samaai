"use client";

import {
  Component,
  useRef,
  type ErrorInfo,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  RectangleHorizontal,
  Square,
} from "lucide-react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

import {
  DEFAULT_NODE_SIZES,
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeData,
  type CanvasShape,
  type CanvasShapeDragPayload,
} from "@/types/canvas";

interface CollaborativeCanvasProps {
  roomId: string;
}

interface CanvasErrorBoundaryProps {
  children: ReactNode;
}

interface CanvasErrorBoundaryState {
  error: Error | null;
}

class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): CanvasErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Liveblocks canvas connection failed.", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full items-center justify-center bg-base px-6 text-center">
          <div>
            <h1 className="text-lg font-semibold text-copy-primary">
              Canvas unavailable
            </h1>
            <p className="mt-2 max-w-md text-sm text-copy-muted">
              The collaborative canvas could not connect. Refresh the page and
              try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function CanvasLoading() {
  return (
    <div className="flex h-full items-center justify-center bg-base text-sm text-copy-muted">
      Loading collaborative canvas...
    </div>
  );
}

function CanvasNodeView({ data, selected }: NodeProps<CanvasNode>) {
  const color = NODE_COLORS[data.color as keyof typeof NODE_COLORS] ?? NODE_COLORS.neutral;

  return (
    <div
      className={`group relative flex h-full w-full items-center justify-center px-4 py-3 text-center shadow-lg transition ${
        selected ? "ring-2 ring-brand ring-offset-2 ring-offset-base" : ""
      }`}
      data-shape={data.shape}
      style={{ color: color.text }}
    >
      <ShapeVisual shape={data.shape} fill={color.fill} stroke={color.text} />
      <Handle className="!h-2 !w-2 !border-0 !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100" position={Position.Top} type="target" />
      <Handle className="!h-2 !w-2 !border-0 !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100" position={Position.Right} type="source" />
      <Handle className="!h-2 !w-2 !border-0 !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100" position={Position.Bottom} type="source" />
      <Handle className="!h-2 !w-2 !border-0 !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100" position={Position.Left} type="target" />
      <span className="relative z-10 block truncate">{data.label}</span>
    </div>
  );
}

interface ShapeVisualProps {
  shape: CanvasShape;
  fill: string;
  stroke: string;
}

function ShapeVisual({ shape, fill, stroke }: ShapeVisualProps) {
  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 border ${
          shape === "circle"
            ? "rounded-full"
            : shape === "pill"
              ? "rounded-full"
              : "rounded-xl"
        }`}
        style={{ backgroundColor: fill, borderColor: stroke }}
      />
    );
  }

  const pathByShape: Record<Exclude<CanvasShape, "rectangle" | "pill" | "circle">, string> = {
    diamond: "M 50 2 L 98 50 L 50 98 L 2 50 Z",
    cylinder: "M 2 14 C 2 4 98 4 98 14 V 86 C 98 96 2 96 2 86 Z",
    hexagon: "M 24 2 H 76 L 98 50 L 76 98 H 24 L 2 50 Z",
  };

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path
        d={pathByShape[shape]}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      {shape === "cylinder" && (
        <path
          d="M 2 14 C 2 24 98 24 98 14"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

const nodeTypes = { canvasNode: CanvasNodeView };

const SHAPE_PAYLOAD_TYPE = "application/x-samaai-shape";
const NODE_PAYLOAD_TYPE = "application/x-samaai-node";

const shapeIcons: Record<CanvasShape, typeof Square> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: RectangleHorizontal,
  cylinder: Cylinder,
  hexagon: Hexagon,
};

function createCanvasNode(
  position: { x: number; y: number },
  payload: CanvasShapeDragPayload,
  counter: number,
): CanvasNode {
  return {
    id: `${payload.shape}-${Date.now()}-${counter}`,
    type: "canvasNode",
    position,
    style: payload.size,
    data: {
      label: "",
      color: "neutral",
      shape: payload.shape,
    },
  };
}

function ShapePanel() {
  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    shape: CanvasShape,
  ) => {
    const payload: CanvasShapeDragPayload = {
      type: "canvasNode",
      shape,
      size: DEFAULT_NODE_SIZES[shape],
    };
    event.dataTransfer.setData(SHAPE_PAYLOAD_TYPE, JSON.stringify(payload));
    event.dataTransfer.setData(NODE_PAYLOAD_TYPE, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      aria-label="Shape toolbar"
      className="pointer-events-auto absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-2 shadow-xl backdrop-blur"
      style={{ bottom: 16, left: "50%", transform: "translateX(-50%)" }}
    >
      {NODE_SHAPES.map((shape) => {
        const Icon = shapeIcons[shape];
        return (
          <button
            aria-label={`Drag ${shape} onto the canvas`}
            className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition hover:bg-accent-dim hover:text-brand active:cursor-grabbing"
            draggable
            key={shape}
            onDragStart={(event) => handleDragStart(event, shape)}
            title={shape}
            type="button"
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

function FlowCanvasContent() {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const nodeCounter = useRef(0);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const addNode = (
    position: { x: number; y: number },
    payload: CanvasShapeDragPayload,
  ) => {
    nodeCounter.current += 1;
    onNodesChange([
      {
        type: "add",
        item: createCanvasNode(position, payload, nodeCounter.current),
      },
    ]);
  };

  const isShapeDragPayload = (
    value: unknown,
  ): value is CanvasShapeDragPayload => {
    if (!value || typeof value !== "object") return false;
    const payload = value as Partial<CanvasShapeDragPayload>;
    return (
      payload.type === "canvasNode" &&
      typeof payload.shape === "string" &&
      NODE_SHAPES.includes(payload.shape as CanvasShape) &&
      !!payload.size &&
      typeof payload.size.width === "number" &&
      Number.isFinite(payload.size.width) &&
      typeof payload.size.height === "number" &&
      Number.isFinite(payload.size.height) &&
      payload.size.width > 0 &&
      payload.size.height > 0
    );
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const rawPayload =
      event.dataTransfer.getData(NODE_PAYLOAD_TYPE) ||
      event.dataTransfer.getData(SHAPE_PAYLOAD_TYPE);
    if (!rawPayload) return;

    try {
      const value: unknown = JSON.parse(rawPayload);
      if (!isShapeDragPayload(value)) return;
      const payload = value;
      addNode(
        reactFlow.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
        payload,
      );
    } catch {
      return;
    }
  };

  return (
    <div
      className="relative h-full min-h-0 w-full"
      onDragOverCapture={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDropCapture={handleDrop}
    >
      <ReactFlow
        className="h-full w-full"
        colorMode="dark"
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed, color: "var(--text-secondary)" },
          style: { stroke: "var(--text-secondary)", strokeWidth: 1.5 },
        }}
        edges={edges}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onDelete={onDelete}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onPaneClick={(event: MouseEvent) => {
          if (event.detail === 2) {
            addNode(
              reactFlow.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
              }),
              {
                shape: "rectangle",
                type: "canvasNode",
                size: DEFAULT_NODE_SIZES.rectangle,
              },
            );
          }
        }}
        panOnScroll
        selectionOnDrag
      >
      <Panel className="!m-3 flex items-center gap-2 rounded-xl border border-surface-border bg-surface/95 p-2 shadow-xl" position="top-left">
        <button
          className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-base transition hover:opacity-90"
          onClick={() =>
            addNode(
              { x: 80 + nodes.length * 24, y: 80 + nodes.length * 24 },
              {
                type: "canvasNode",
                shape: "rectangle",
                size: DEFAULT_NODE_SIZES.rectangle,
              },
            )
          }
          type="button"
        >
          Add component
        </button>
        <span className="hidden text-xs text-copy-muted sm:inline">
          Double-click the canvas to add
        </span>
      </Panel>
      <Controls className="!m-3 !overflow-hidden !rounded-xl !border-surface-border !bg-surface [&>button]:!border-surface-border [&>button]:!bg-surface [&>button]:!fill-copy-primary" />
      <MiniMap
        className="!m-3 !overflow-hidden !rounded-xl !border-surface-border !bg-surface"
        nodeColor={(node) => {
          const data = node.data as CanvasNodeData;
          return NODE_COLORS[data.color as keyof typeof NODE_COLORS]?.fill ?? NODE_COLORS.neutral.fill;
        }}
        pannable
        style={{ backgroundColor: "var(--bg-surface)" }}
        zoomable
      />
      <Background
        color="var(--border-subtle)"
        gap={18}
        size={1}
        variant={BackgroundVariant.Dots}
      />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent />
    </ReactFlowProvider>
  );
}

export function CollaborativeCanvas({ roomId }: CollaborativeCanvasProps) {
  return (
    <div
      className="relative h-full min-h-0 w-full bg-base"
      style={{ height: "100%" }}
    >
      <CanvasErrorBoundary>
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
          <RoomProvider
            id={roomId}
            initialPresence={{ cursor: null, isThinking: false }}
          >
            <ClientSideSuspense fallback={<CanvasLoading />}>
              <FlowCanvas />
            </ClientSideSuspense>
          </RoomProvider>
        </LiveblocksProvider>
      </CanvasErrorBoundary>
    </div>
  );
}
