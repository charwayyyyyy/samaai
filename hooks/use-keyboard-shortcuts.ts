import { useEffect } from "react";
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";

interface KeyboardShortcutHandlers {
  undo: () => void;
  redo: () => void;
}

/** Returns true when the event target is an input, textarea, select, or other editable element. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

/**
 * Binds window-level keyboard shortcuts for zooming the given React Flow instance
 * and for undo/redo, ignoring key presses while an editable element is focused.
 */
export function useKeyboardShortcuts<
  NodeType extends Node,
  EdgeType extends Edge,
>(
  reactFlow: ReactFlowInstance<NodeType, EdgeType>,
  { undo, redo }: KeyboardShortcutHandlers,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        reactFlow.zoomIn({ duration: 180 });
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        reactFlow.zoomOut({ duration: 180 });
        return;
      }

      if (!event.metaKey && !event.ctrlKey) return;

      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlow, redo, undo]);
}
