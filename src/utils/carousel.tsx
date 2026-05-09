import { createSignal, onMount, onCleanup, children, type JSX } from "solid-js";

export interface CarouselProps {
  children: JSX.Element;
  interval?: number;
}

export function Carousel(props: CarouselProps): JSX.Element {
  const [index, setIndex] = createSignal(0);
  const resolved = children(() => props.children);
  const items = () => resolved.toArray();

  onMount(() => {
    const count = items().length;
    if (count <= 1) return;

    const ms = props.interval ?? 3000;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items().length);
    }, ms);

    onCleanup(() => clearInterval(id));
  });

  return (
    <div class="overflow-hidden w-full h-full relative">
      <div
        class="flex flex-col transition-transform duration-300 ease-in-out h-full"
        style={{ transform: `translateY(-${index() * 100}%)` }}
      >
        {items().map((child) => (
          <div class="min-h-full w-full shrink-0">{child}</div>
        ))}
      </div>
    </div>
  );
}
