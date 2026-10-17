"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LayoutTemplate } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NODE_COLORS, type CanvasShape } from "@/types/canvas";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates";

interface StarterTemplatesContextValue {
  openTemplates: () => void;
}

const StarterTemplatesContext =
  createContext<StarterTemplatesContextValue | null>(null);

interface StarterTemplatesProviderProps {
  children: ReactNode;
}

/**
 * Supplies the `openTemplates` action to descendants and renders the starter
 * templates modal, dispatching a `samaai:import-template` event on import.
 */
export function StarterTemplatesProvider({
  children,
}: StarterTemplatesProviderProps) {
  const [open, setOpen] = useState(false);

  const handleImport = useCallback((template: CanvasTemplate) => {
    window.dispatchEvent(
      new CustomEvent<CanvasTemplate>("samaai:import-template", {
        detail: template,
      }),
    );
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openTemplates: () => setOpen(true),
    }),
    [],
  );

  return (
    <StarterTemplatesContext.Provider value={value}>
      {children}
      <StarterTemplatesModal
        onImport={handleImport}
        onOpenChange={setOpen}
        open={open}
      />
    </StarterTemplatesContext.Provider>
  );
}

/** Returns the starter templates context, throwing when used outside `StarterTemplatesProvider`. */
export function useStarterTemplates() {
  const context = useContext(StarterTemplatesContext);
  if (!context) {
    throw new Error(
      "useStarterTemplates must be used within StarterTemplatesProvider.",
    );
  }
  return context;
}

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

/** Renders the dialog listing available canvas templates for the user to import. */
function StarterTemplatesModal({
  onImport,
  onOpenChange,
  open,
}: StarterTemplatesModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-4xl overflow-y-auto border-surface-border bg-surface text-copy-primary">
        <DialogHeader>
          <DialogTitle className="text-copy-primary">
            Starter templates
          </DialogTitle>
          <DialogDescription className="text-copy-muted">
            Replace the current canvas with a pre-built system design.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <article
              className="overflow-hidden rounded-2xl border border-surface-border bg-subtle"
              key={template.id}
            >
              <TemplatePreview template={template} />
              <div className="p-4">
                <h3 className="font-medium text-copy-primary">{template.name}</h3>
                <p className="mt-1 min-h-10 text-xs leading-5 text-copy-muted">
                  {template.description}
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => onImport(template)}
                  type="button"
                >
                  <LayoutTemplate />
                  Import template
                </Button>
              </div>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Renders a scaled SVG/HTML preview of a template's nodes and edges. */
function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const width = 280;
  const height = 150;
  const padding = 18;
  const bounds = getTemplateBounds(template);
  const scale = Math.min(
    (width - padding * 2) / bounds.width,
    (height - padding * 2) / bounds.height,
  );
  const offsetX = (width - bounds.width * scale) / 2 - bounds.minX * scale;
  const offsetY = (height - bounds.height * scale) / 2 - bounds.minY * scale;

  const pointFor = (nodeId: string) => {
    const node = template.nodes.find((item) => item.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const size = getNodeSize(node);
    return {
      x: (node.position.x + size.width / 2) * scale + offsetX,
      y: (node.position.y + size.height / 2) * scale + offsetY,
    };
  };

  return (
    <div
      aria-label={`${template.name} diagram preview`}
      className="relative h-[150px] overflow-hidden border-b border-surface-border bg-base"
      role="img"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`}>
        {template.edges.map((edge) => {
          const source = pointFor(edge.source);
          const target = pointFor(edge.target);
          return (
            <line
              key={edge.id}
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              x1={source.x}
              x2={target.x}
              y1={source.y}
              y2={target.y}
            />
          );
        })}
      </svg>
      {template.nodes.map((node) => {
        const size = getNodeSize(node);
        const color = NODE_COLORS[node.data.color as keyof typeof NODE_COLORS] ?? NODE_COLORS.neutral;
        return (
          <div
            className="absolute flex items-center justify-center overflow-hidden border text-center text-[8px] font-medium"
            key={node.id}
            style={{
              backgroundColor: color.fill,
              borderColor: color.text,
              borderRadius: getBorderRadius(node.data.shape),
              color: color.text,
              height: size.height * scale,
              left: node.position.x * scale + offsetX,
              width: size.width * scale,
              top: node.position.y * scale + offsetY,
              clipPath: getClipPath(node.data.shape),
            }}
          >
            <span className="truncate px-1">{node.data.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Returns a template node's rendered width and height, falling back to default dimensions. */
function getNodeSize(node: CanvasTemplate["nodes"][number]) {
  return {
    width: dimensionToNumber(node.style?.width, 180),
    height: dimensionToNumber(node.style?.height, 72),
  };
}

/** Coerces a style dimension value to a finite number, or returns the fallback. */
function dimensionToNumber(
  value: string | number | undefined,
  fallback: number,
) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : typeof value === "string" && Number.isFinite(Number(value))
      ? Number(value)
      : fallback;
}

/** Computes the bounding box enclosing all of a template's nodes. */
function getTemplateBounds(template: CanvasTemplate) {
  const positions = template.nodes.map((node) => {
    const size = getNodeSize(node);
    return {
      minX: node.position.x,
      minY: node.position.y,
      maxX: node.position.x + size.width,
      maxY: node.position.y + size.height,
    };
  });
  const minX = Math.min(...positions.map((item) => item.minX));
  const minY = Math.min(...positions.map((item) => item.minY));
  const maxX = Math.max(...positions.map((item) => item.maxX));
  const maxY = Math.max(...positions.map((item) => item.maxY));
  return { minX, minY, width: maxX - minX, height: maxY - minY };
}

/** Returns the CSS border radius used to approximate a shape in the preview. */
function getBorderRadius(shape: CanvasShape) {
  if (shape === "circle" || shape === "pill") return "999px";
  return shape === "cylinder" ? "12px" : "6px";
}

/** Returns the CSS clip-path used to approximate a shape in the preview. */
function getClipPath(shape: CanvasShape) {
  if (shape === "diamond") return "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)";
  if (shape === "hexagon") {
    return "polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%)";
  }
  return "none";
}
