import { createSignal, Match, onMount, Show, Switch, type JSX } from "solid-js";
import { render } from "solid-js/web";
import type { Professor } from "@/utils/rmp";
import { schoolNodeId, GMU_SCHOOL_LEGACY_ID } from "@/utils/rmp/ids";
import { createOverlay } from "@/utils/overlay";
import { tooltip } from "@/utils/tooltip";
import { matchProfessorName } from "@/utils/names";

const professorCache = new Map<string, Professor | null>();

function matchProfessor(
  searchName: string,
  professors: Professor[],
): Professor | null {
  for (const prof of professors) {
    if (matchProfessorName(searchName, prof.name)) return prof;
  }
  return null;
}

function ratingColor(rating: number): string {
  if (rating === 0) return "#9ca3af";
  if (rating >= 4) return "#1f7a70";
  if (rating >= 3) return "#b89a3a";
  if (rating >= 2) return "#d4842a";
  return "#c43340";
}

function ratingBgColor(rating: number): string {
  if (rating === 0) return "#f3f4f6";
  if (rating >= 4) return "#d4f0eb";
  if (rating >= 3) return "#fdf3d7";
  if (rating >= 2) return "#fde8d0";
  return "#fad4d7";
}

function difficultyColor(difficulty: number): string {
  if (difficulty === 0) return "#9ca3af";
  if (difficulty <= 2) return "#1f7a70";
  if (difficulty <= 3) return "#b89a3a";
  if (difficulty <= 4) return "#d4842a";
  return "#c43340";
}

function takeAgainColor(percent: number): string {
  if (percent === -1) return "#9ca3af";
  if (percent >= 80) return "#1f7a70";
  if (percent >= 60) return "#b89a3a";
  if (percent >= 40) return "#d4842a";
  return "#c43340";
}

interface Data {
  profName: string;
}

function extractData(td: HTMLTableCellElement): Data | null {
  const profLink = td.querySelector("a");
  const profName = profLink?.textContent
    ?.trim()
    ?.replace(/\s*\(.*?\)\s*/g, "")
    .trim();
  if (!profName) return null;
  if (td.dataset.rmpEnhanced) return null;
  return { profName };
}

function Tooltip(props: { prof: Professor }): JSX.Element {
  const p = props.prof;
  return (
    <div class="flex flex-col bg-white border border-gray-400 p-3 gap-2 min-w-45">
      <span class="font-bold text-sm">{p.name}</span>
      <Show when={p.department}>
        <span class="text-xs text-gray-400">{p.department}</span>
      </Show>
      <div class="flex flex-col gap-1 mt-1">
        <Show when={p.overall_rating != null}>
          <div class="flex justify-between text-xs">
            <span class="text-gray-600">Overall Rating</span>
            <span class="font-mono">
              <span
                class="font-bold px-1.5 py-1 rounded-sm"
                style={{
                  color: ratingColor(p.overall_rating!),
                  "background-color": ratingBgColor(p.overall_rating!),
                }}
              >
                {p.overall_rating!.toFixed(1)}
              </span>
              <span class="text-gray-500"> / 5</span>
            </span>
          </div>
        </Show>
        <Show when={p.level_of_difficulty != null}>
          <div class="flex justify-between text-xs">
            <span class="text-gray-600">Difficulty</span>
            <span class="font-mono">
              <span
                class="font-bold"
                style={{ color: difficultyColor(p.level_of_difficulty!) }}
              >
                {p.level_of_difficulty!.toFixed(1)}
              </span>
              <span class="text-gray-500"> / 5</span>
            </span>
          </div>
        </Show>
        <Show when={p.percent_take_again != null}>
          <div class="flex justify-between text-xs">
            <span class="text-gray-600">Would Take Again</span>
            <span class="font-mono">
              <span
                class="font-bold"
                style={{ color: takeAgainColor(p.percent_take_again!) }}
              >
                {p.percent_take_again === -1
                  ? "-"
                  : p.percent_take_again!.toFixed(0)}
              </span>
              <span class="text-gray-500">%</span>
            </span>
          </div>
        </Show>
        <Show when={p.num_ratings != null}>
          <div class="flex justify-between text-xs">
            <span class="text-gray-600">Total Ratings</span>
            <span class="font-mono">{p.num_ratings}</span>
          </div>
        </Show>
      </div>
    </div>
  );
}

function NullTooltip(props: { profName: string }): JSX.Element {
  return (
    <div class="flex flex-col bg-white border border-gray-400 p-3 gap-1 min-w-45">
      <span class="font-bold text-sm">{props.profName}</span>
      <span class="text-xs text-gray-500">
        click to search in ratemyprofessors.com
      </span>
    </div>
  );
}

function overlay(props: Data): JSX.Element {
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
        <div
          class="pointer-events-auto flex items-center gap-1.5 w-full h-full cursor-pointer"
          use:tooltip={{
            content: <NullTooltip profName={props.profName} />,
            position: "left",
          }}
        >
          <a
            href={`https://www.ratemyprofessors.com/search/professors?q=${encodeURIComponent(props.profName)}&sid=${schoolNodeId(GMU_SCHOOL_LEGACY_ID)}`}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 w-full h-full no-underline"
          >
            <span class="font-mono font-bold text-[11px] leading-none flex items-center justify-center h-full w-8 bg-gray-100 text-gray-400 min-w-8">
              N/A
            </span>
            <span class="text-[11px] text-gray-400 truncate">
              {props.profName}
            </span>
          </a>
        </div>
      </Match>
      <Match when={prof()}>
        {(p) => (
          <div
            class="pointer-events-auto flex items-center gap-1.5 w-full h-full cursor-pointer"
            use:tooltip={{
              content: <Tooltip prof={p()} />,
              position: "left",
            }}
          >
            <a
              href={`https://www.ratemyprofessors.com/professor/${p().id}`}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 w-full h-full no-underline"
            >
              <span
                class="font-mono font-bold text-[12px] leading-none flex items-center justify-center h-full w-8 min-w-8"
                style={{
                  color: ratingColor(p().overall_rating!),
                  "background-color": ratingBgColor(p().overall_rating!),
                }}
              >
                {p().overall_rating!.toFixed(1)}
              </span>
              <span class="text-[11px] text-gray-700 truncate">
                {props.profName}
              </span>
            </a>
          </div>
        )}
      </Match>
    </Switch>
  );
}

export default function enhancer(td: HTMLTableCellElement): void {
  const data = extractData(td);
  if (!data) return;
  td.dataset.rmpEnhanced = "pending";

  const container = createOverlay(td);
  if (!container) return;
  container.style.display = "flex";
  container.style.alignItems = "stretch";

  render(() => overlay(data), container);
}
