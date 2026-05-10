export function removeTooltip(td: HTMLTableCellElement) {
  td.onmouseenter = () => {
    const tooltipOriginal = td.getAttribute("aria-describedby");
    if (tooltipOriginal) {
      const tooltipElement = document.getElementById(tooltipOriginal);
      tooltipElement?.remove();
    }
  };
}

export function clearTitle(td: HTMLTableCellElement) {
  td.title = "";
}
