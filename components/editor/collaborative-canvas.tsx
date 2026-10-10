"use client";

import {
  Component,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useState,
  createContext,
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
  Minus,
  Maximize2,
  Plus,
  Redo2,
  Square,
  Undo2,
} from "lucide-react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  ConnectionMode,
  ConnectionLineType,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  MiniMap,
  NodeResizer,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
  type NodeProps,
} from "@xyflow/react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
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
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import {
  useStarterTemplates,
} from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

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

interface CanvasNodeEditingContextValue {
  updateLabel: (nodeId: string, label: string) => void;
  updateColor: (nodeId: string, color: keyof typeof NODE_COLORS) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
}

const CanvasNodeEditingContext =
  createContext<CanvasNodeEditingContextValue | null>(null);

/** Renders a canvas edge with a double-click-to-edit label and a smooth-step path. */
function CanvasEdgeView({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  markerEnd,
  selected,
}: EdgeProps<CanvasEdge>) {
  const editing = useContext(CanvasNodeEditingContext);
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data?.label ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
    offset: 20,
  });
  const label = data?.label ?? "";

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const finishEditing = () => {
    const nextLabel = draftLabel.trim();
    if (nextLabel !== label) {
      editing?.updateEdgeLabel(id, nextLabel);
    }
    setIsEditing(false);
  };

  return (
    <>
      <BaseEdge
        interactionWidth={24}
        markerEnd={markerEnd}
        path={edgePath}
        style={{
          stroke: "var(--text-secondary)",
          strokeLinecap: "round",
          strokeOpacity: selected ? 1 : 0.62,
          strokeWidth: selected ? 2 : 1.5,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className={`nodrag nopan absolute pointer-events-auto ${
            selected && !label ? "text-copy-muted/70" : ""
          }`}
          onDoubleClick={(event) => {
            event.stopPropagation();
            setDraftLabel(label);
            setIsEditing(true);
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          style={{
            left: labelX,
            top: labelY,
            transform: "translate(-50%, -50%)",
          }}
        >
          {isEditing ? (
            <input
              aria-label="Edit edge label"
              className="h-6 rounded-full border border-brand bg-surface px-2 text-center text-xs text-copy-primary outline-none"
              onBlur={finishEditing}
              onChange={(event) => setDraftLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                  event.preventDefault();
                  finishEditing();
                }
              }}
              ref={inputRef}
              style={{ width: `${Math.max(6, draftLabel.length + 2)}ch` }}
              value={draftLabel}
            />
          ) : label ? (
            <span className="rounded-full border border-surface-border bg-surface/95 px-2 py-1 text-xs text-copy-secondary shadow-sm">
              {label}
            </span>
          ) : selected ? (
            <span className="rounded-full border border-surface-border/70 bg-surface/80 px-2 py-1 text-[10px]">
              Double-click to label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

/** Renders a canvas node's shape and label, supporting double-click editing and a color toolbar when selected. */
function CanvasNodeView({ id, data, selected }: NodeProps<CanvasNode>) {
  const color = NODE_COLORS[data.color as keyof typeof NODE_COLORS] ?? NODE_COLORS.neutral;
  const editing = useContext(CanvasNodeEditingContext);
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [isEditing]);

  const finishEditing = () => {
    const nextLabel = draftLabel.trim();
    if (nextLabel !== data.label) {
      editing?.updateLabel(id, nextLabel);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative flex h-full w-full items-center justify-center px-4 py-3 text-center shadow-lg transition ${
        selected ? "ring-2 ring-brand ring-offset-2 ring-offset-base" : ""
      }`}
      data-shape={data.shape}
      style={{ color: color.text }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setDraftLabel(data.label);
        setIsEditing(true);
      }}
    >
      {selected && editing && (
        <NodeColorToolbar
          activeColor={data.color}
          onColorChange={(color) => editing.updateColor(id, color)}
        />
      )}
      <NodeResizer
        color="var(--accent-primary)"
        handleStyle={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--accent-primary)",
          borderRadius: 3,
          height: 7,
          width: 7,
        }}
        isVisible={selected}
        lineStyle={{ borderColor: "var(--accent-primary)", opacity: 0.65 }}
        minHeight={48}
        minWidth={80}
      />
      <ShapeVisual
        shape={data.shape}
        fill={color.fill}
        selected={selected}
        stroke={color.text}
      />
      <Handle className="!h-2 !w-2 !border-0 !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100" position={Position.Top} type="target" />
      <Handle className="!h-2 !w-2 !border-0 !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100" position={Position.Right} type="source" />
      <Handle className="!h-2 !w-2 !border-0 !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100" position={Position.Bottom} type="source" />
      <Handle className="!h-2 !w-2 !border-0 !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100" position={Position.Left} type="target" />
      {isEditing ? (
        <textarea
          aria-label="Edit node label"
          className="nodrag nowheel relative z-10 h-8 w-full resize-none overflow-hidden rounded-md border border-brand bg-base/90 px-2 py-1 text-center text-sm text-copy-primary outline-none"
          onBlur={finishEditing}
          onChange={(event) => setDraftLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setDraftLabel(data.label);
              setIsEditing(false);
            }
          }}
          onPointerDown={(event) => event.stopPropagation()}
          ref={textareaRef}
          rows={1}
          value={draftLabel}
        />
      ) : (
        <span className="relative z-10 block truncate text-sm">
          {data.label || (
            <span className="text-copy-muted/70">Double-click to label</span>
          )}
        </span>
      )}
    </div>
  );
}

interface NodeColorToolbarProps {
  activeColor: string;
  onColorChange: (color: keyof typeof NODE_COLORS) => void;
}

/** Renders the floating swatch toolbar used to change a selected node's color. */
function NodeColorToolbar({
  activeColor,
  onColorChange,
}: NodeColorToolbarProps) {
  return (
    <div
      aria-label="Node colors"
      className="nodrag nowheel absolute bottom-full left-1/2 z-30 mb-2 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-surface-border bg-surface/95 p-1.5 shadow-xl backdrop-blur"
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {Object.entries(NODE_COLORS).map(([name, colors]) => {
        const color = name as keyof typeof NODE_COLORS;
        const isActive = activeColor === color;

        return (
          <button
            aria-label={`Use ${color} node color`}
            aria-pressed={isActive}
            className={`h-5 w-5 rounded-full border transition ${
              isActive
                ? "scale-110 border-copy-primary ring-2 ring-brand/70 ring-offset-1 ring-offset-surface"
                : "border-surface-border hover:scale-110"
            }`}
            key={color}
            onClick={(event) => {
              event.stopPropagation();
              onColorChange(color);
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.boxShadow = `0 0 0 3px ${colors.text}33`;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.boxShadow = "";
            }}
            style={{
              backgroundColor: colors.fill,
              borderColor: isActive ? colors.text : undefined,
            }}
            title={color}
            type="button"
          />
        );
      })}
    </div>
  );
}

interface ShapeVisualProps {
  shape: CanvasShape;
  fill: string;
  stroke: string;
  selected?: boolean;
}

/** Renders the fill/stroke visual for a node's shape, dimming it when not selected. */
function ShapeVisual({ shape, fill, selected = false, stroke }: ShapeVisualProps) {
  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 border transition ${
          shape === "circle"
            ? "rounded-full"
            : shape === "pill"
              ? "rounded-full"
              : "rounded-xl"
        }`}
        style={{
          backgroundColor: fill,
          borderColor: stroke,
          opacity: selected ? 1 : 0.86,
        }}
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
        strokeOpacity={selected ? 1 : 0.86}
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
const edgeTypes = { canvasEdge: CanvasEdgeView };

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

interface ShapePreview {
  shape: CanvasShape;
  size: CanvasShapeDragPayload["size"];
  position: { x: number; y: number };
}

interface ShapePanelProps {
  onDragPreviewChange: (
    preview: Omit<ShapePreview, "position"> | null,
    position?: { x: number; y: number },
  ) => void;
}

/** Renders the draggable shape toolbar used to add new nodes to the canvas. */
function ShapePanel({ onDragPreviewChange }: ShapePanelProps) {
  /** Attaches the drag payload for a shape and notifies the drag preview of its start position. */
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
    onDragPreviewChange(payload, {
      x: event.clientX + 12,
      y: event.clientY + 12,
    });
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
            onDrag={(event) => {
              if (event.clientX > 0 || event.clientY > 0) {
                onDragPreviewChange(
                  {
                    shape,
                    size: DEFAULT_NODE_SIZES[shape],
                  },
                  { x: event.clientX + 12, y: event.clientY + 12 },
                );
              }
            }}
            onDragStart={(event) => handleDragStart(event, shape)}
            onDragEnd={() => onDragPreviewChange(null)}
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

interface CanvasControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/** Renders the floating zoom, fit-view, undo, and redo controls for the canvas. */
function CanvasControls({
  canRedo,
  canUndo,
  onFitView,
  onRedo,
  onUndo,
  onZoomIn,
  onZoomOut,
}: CanvasControlsProps) {
  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-lg text-copy-secondary transition hover:bg-accent-dim hover:text-brand disabled:cursor-not-allowed disabled:opacity-35";

  return (
    <div
      aria-label="Canvas controls"
      className="pointer-events-auto absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-xl backdrop-blur"
    >
      <div aria-label="Zoom controls" className="flex items-center gap-1">
        <button
          aria-label="Zoom out"
          className={buttonClass}
          onClick={onZoomOut}
          title="Zoom out"
          type="button"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          aria-label="Fit canvas view"
          className={buttonClass}
          onClick={onFitView}
          title="Fit view"
          type="button"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          aria-label="Zoom in"
          className={buttonClass}
          onClick={onZoomIn}
          title="Zoom in"
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mx-1 h-5 w-px bg-surface-border" />
      <div aria-label="History controls" className="flex items-center gap-1">
        <button
          aria-label="Undo"
          className={buttonClass}
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo"
          type="button"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          aria-label="Redo"
          className={buttonClass}
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo"
          type="button"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Renders the React Flow canvas with node/edge editing, drag-and-drop shape creation,
 * starter template import, keyboard shortcuts, and undo/redo controls.
 */
function FlowCanvasContent() {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  useStarterTemplates();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  useKeyboardShortcuts(reactFlow, { redo, undo });
  const nodeCounter = useRef(0);
  const fitAfterImport = useRef(false);
  const [shapePreview, setShapePreview] = useState<ShapePreview | null>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  /** Clears the canvas and populates it with the given starter template's nodes and edges. */
  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      onDelete({ nodes, edges });
      nodeCounter.current = template.nodes.length;
      fitAfterImport.current = true;
      window.setTimeout(() => {
        template.nodes.forEach((node) => {
          onNodesChange([
            {
              type: "add",
              item: {
                ...node,
                data: { ...node.data },
                position: { ...node.position },
                style: node.style ? { ...node.style } : undefined,
              },
            },
          ]);
        });
        template.edges.forEach((edge) => {
          onEdgesChange([
            {
              type: "add",
              item: { ...edge, data: edge.data ? { ...edge.data } : {} },
            },
          ]);
        });
      }, 0);
    },
    [edges, nodes, onDelete, onEdgesChange, onNodesChange],
  );

  useEffect(() => {
    const handleTemplateImport = (event: Event) => {
      const template = (event as CustomEvent<CanvasTemplate>).detail;
      if (template) importTemplate(template);
    };

    window.addEventListener("samaai:import-template", handleTemplateImport);
    return () =>
      window.removeEventListener("samaai:import-template", handleTemplateImport);
  }, [importTemplate]);

  useEffect(() => {
    if (!fitAfterImport.current || nodes.length === 0) return;
    fitAfterImport.current = false;
    requestAnimationFrame(() => {
      reactFlow.fitView({ duration: 180, padding: 0.2 });
    });
  }, [nodes, reactFlow]);

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

  /** Updates a node's label, no-op if the node no longer exists. */
  const updateNodeLabel = (nodeId: string, label: string) => {
    const node = reactFlow.getNode(nodeId);
    if (!node) return;

    onNodesChange([
      {
        type: "replace",
        id: nodeId,
        item: {
          ...node,
          data: {
            ...node.data,
            label,
          },
        },
      },
    ]);
  };

  /** Updates a node's color, no-op if the node no longer exists. */
  const updateNodeColor = (
    nodeId: string,
    color: keyof typeof NODE_COLORS,
  ) => {
    const node = reactFlow.getNode(nodeId);
    if (!node) return;

    onNodesChange([
      {
        type: "replace",
        id: nodeId,
        item: {
          ...node,
          data: {
            ...node.data,
            color,
          },
        },
      },
    ]);
  };

  /** Updates an edge's label, no-op if the edge no longer exists. */
  const updateEdgeLabel = (edgeId: string, label: string) => {
    const edge = reactFlow.getEdge(edgeId);
    if (!edge) return;

    onEdgesChange([
      {
        type: "replace",
        id: edgeId,
        item: {
          ...edge,
          data: {
            ...edge.data,
            label,
          },
        },
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

  /** Handles dropping a dragged shape payload onto the canvas, adding a node and clearing the preview. */
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShapePreview(null);
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

  useEffect(() => {
    if (!shapePreview) return;

    const handleWindowDragOver = (event: globalThis.DragEvent) => {
      setShapePreview((current) =>
        current
          ? {
              ...current,
              position: { x: event.clientX + 12, y: event.clientY + 12 },
            }
          : null,
      );
    };
    const clearPreview = () => setShapePreview(null);

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragend", clearPreview);
    window.addEventListener("drop", clearPreview);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragend", clearPreview);
      window.removeEventListener("drop", clearPreview);
    };
  }, [shapePreview]);

  return (
    <div
      className="relative h-full min-h-0 w-full"
      onDragOverCapture={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDropCapture={handleDrop}
    >
      <CanvasNodeEditingContext.Provider
        value={{
          updateColor: updateNodeColor,
          updateEdgeLabel,
          updateLabel: updateNodeLabel,
        }}
      >
        <ReactFlow
          className="h-full w-full"
          colorMode="dark"
          connectionMode={ConnectionMode.Loose}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{
            animated: false,
            type: "canvasEdge",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "var(--text-secondary)",
            },
          }}
          edges={edges}
          edgeTypes={edgeTypes}
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
      </CanvasNodeEditingContext.Provider>
      <CanvasControls
        canRedo={canRedo}
        canUndo={canUndo}
        onFitView={() => reactFlow.fitView({ duration: 180, padding: 0.2 })}
        onRedo={redo}
        onUndo={undo}
        onZoomIn={() => reactFlow.zoomIn({ duration: 180 })}
        onZoomOut={() => reactFlow.zoomOut({ duration: 180 })}
      />
      <ShapePanel
        onDragPreviewChange={(preview, position) => {
          setShapePreview(
            preview && position
              ? { ...preview, position }
              : null,
          );
        }}
      />
      {shapePreview && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 opacity-70"
          style={{
            height: shapePreview.size.height,
            left: shapePreview.position.x,
            top: shapePreview.position.y,
            width: shapePreview.size.width,
          }}
        >
          <ShapeVisual
            fill={NODE_COLORS.neutral.fill}
            shape={shapePreview.shape}
            stroke={NODE_COLORS.neutral.text}
          />
        </div>
      )}
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
