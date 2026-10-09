fix the drag and drop functionality. 


DRAG AND DROP ISSUES:

- Canvas nodes from the node panel cannot be dragged and dropped onto the canvas. Investigate and fix the full drag-and-drop pipeline:
- Confirm that draggable nodes and shapes  in the node panel have the correct draggable attribute and onDragStart handler that sets the node type in dataTransfer
- Confirm that the canvas has onDragOver (with preventDefault to allow dropping) and onDrop handlers wired up correctly
- Ensure the drop handler reads the node type from dataTransfer, calculates the correct canvas coordinates accounting for pan offset and zoom scale, and creates a new node at the dropped position
- Check that no parent element is intercepting or blocking the drag events before they reach the canvas


After documenting all issues fix all of the above so that:

Nodes and shapes can be dragged from the node panel and dropped onto the canvas correctly.