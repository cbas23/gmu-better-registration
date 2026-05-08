export function createVerticalCarousel(
  elements: HTMLElement[],
  intervalMs: number = 3000,
): HTMLElement {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.overflow = "hidden";
  container.style.position = "relative";

  const track = document.createElement("div");
  track.style.display = "flex";
  track.style.flexDirection = "column";
  track.style.transition = "transform 0.4s ease";
  track.style.height = "100%";
  track.style.width = "100%";

  const total = elements.length;

  if (total === 0) {
    container.appendChild(track);
    return container;
  }

  for (const el of elements) {
    const slide = document.createElement("div");
    slide.style.flex = "0 0 100%";
    slide.style.height = "100%";
    slide.style.width = "100%";
    slide.style.display = "flex";
    slide.style.backgroundColor = "#2a7a64";
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.width = "100%";
    clone.style.height = "100%";
    slide.appendChild(clone);
    track.appendChild(slide);
  }

  container.appendChild(track);

  let index = 0;

  const timer = setInterval(() => {
    index = (index + 1) % total;
    track.style.transform = `translateY(-${index * 100}%)`;
  }, intervalMs);

  const observer = new MutationObserver(() => {
    if (!container.isConnected) {
      clearInterval(timer);
      observer.disconnect();
    }
  });

  observer.observe(container.parentElement ?? container, {
    childList: true,
    subtree: true,
  });

  return container;
}
