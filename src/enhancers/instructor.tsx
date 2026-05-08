import { createSignal, Match, onMount, Switch, type JSX } from "solid-js";
import { render } from "solid-js/web";
import type { Professor } from "@/utils/rmp";
import { createOverlay } from "@/utils/overlay";

const professorCache = new Map<string, Professor | null>();

function normalizeName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[,.\s]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function matchProfessor(
  searchName: string,
  professors: Professor[],
): Professor | null {
  const searchWords = normalizeName(searchName);
  for (const prof of professors) {
    const rmpWords = normalizeName(prof.name);
    const allMatch = searchWords.every((w) => rmpWords.includes(w));
    if (allMatch) return prof;
  }
  return null;
}

function ratingColor(rating: number): string {
  if (rating >= 4) return "#2a9d8f";
  if (rating >= 3) return "#e9c46a";
  if (rating >= 2) return "#f4a261";
  return "#e63946";
}

function ratingBgColor(rating: number): string {
  if (rating >= 4) return "#d4f0eb";
  if (rating >= 3) return "#fdf3d7";
  if (rating >= 2) return "#fde8d0";
  return "#fad4d7";
}

export interface InstructorData {
  profName: string;
}

export function extractInstructorData(
  td: HTMLTableCellElement,
): InstructorData | null {
  const profLink = td.querySelector("a");
  const profName = profLink?.textContent
    ?.trim()
    ?.replace(/\s*\(.*?\)\s*/g, "")
    .trim();
  if (!profName) return null;
  if (td.dataset.rmpEnhanced) return null;
  return { profName };
}

function InstructorOverlay(props: InstructorData): JSX.Element {
  const [prof, setProf] = createSignal<Professor | null | undefined>(undefined);

  onMount(async () => {
    const cached = professorCache.get(props.profName);
    if (cached !== undefined) {
      setProf(cached);
      return;
    }

    try {
      const result = await browser.runtime.sendMessage({
        type: "rmp:searchProfessors",
        name: props.profName,
      });
      const match =
        result?.professors?.length > 0
          ? matchProfessor(props.profName, result.professors)
          : null;
      professorCache.set(props.profName, match);
      setProf(match);
    } catch {
      professorCache.set(props.profName, null);
      setProf(null);
    }
  });

  return (
    <Switch>
      <Match when={prof() === undefined}>
        <span class="font-mono text-[11px] flex items-center px-1.5 text-gray-400">
          ...
        </span>
      </Match>
      <Match when={prof() === null || prof()!.overall_rating == null}>
        <span class="font-mono text-[11px] flex items-center px-1.5 text-gray-400">
          {props.profName}
        </span>
      </Match>
      <Match when={prof()}>
        {(p) => (
          <a
            href={`https://www.ratemyprofessors.com/professor/${p().id}`}
            target="_blank"
            rel="noopener noreferrer"
            class="pointer-events-auto flex items-center gap-1.5 w-full h-full no-underline cursor-pointer"
          >
            <span
              class="font-mono font-bold text-[12px] leading-none flex items-center justify-center aspect-square h-8"
              style={{
                color: ratingColor(p().overall_rating!),
                "background-color": ratingBgColor(p().overall_rating!),
              }}
            >
              {p().overall_rating!.toFixed(1)}
            </span>
            <span class="text-[11px] text-gray-700 truncate">{p().name}</span>
          </a>
        )}
      </Match>
    </Switch>
  );
}

export function enhanceInstructor(td: HTMLTableCellElement): void {
  const data = extractInstructorData(td);
  if (!data) return;
  td.dataset.rmpEnhanced = "pending";

  const overlay = createOverlay(td);
  if (!overlay) return;
  overlay.style.display = "flex";
  overlay.style.alignItems = "stretch";

  render(() => <InstructorOverlay {...data} />, overlay);
}
