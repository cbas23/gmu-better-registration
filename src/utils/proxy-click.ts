const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, summary, [role='button'], [contenteditable='true']";

/**
 * Forward clicks from one element to another.
 *
 * The source event is stopped before calling `target.click()` so delegated
 * handlers do not receive both the overlay click and the proxied click.
 * Native controls nested inside the source keep their own click behavior.
 */
export function proxyClick(source: HTMLElement, target: HTMLElement): () => void {
  let isProxying = false;

  const handleClick = (event: MouseEvent) => {
    if (isProxying || event.defaultPrevented) return;

    const clickedElement =
      event.target instanceof Element ? event.target : null;
    const interactiveElement = clickedElement?.closest(INTERACTIVE_SELECTOR);

    if (
      interactiveElement &&
      interactiveElement !== source &&
      source.contains(interactiveElement)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    isProxying = true;
    try {
      target.click();
    } finally {
      isProxying = false;
    }
  };

  source.addEventListener("click", handleClick);

  return () => source.removeEventListener("click", handleClick);
}
