export function preventLongPressProps() {
  return {
    onContextMenu: (event) => event.preventDefault(),
    onDragStart: (event) => event.preventDefault()
  }
}
