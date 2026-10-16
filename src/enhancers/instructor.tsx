import { createSignal, onMount, Show, type Accessor, type JSX } from "solid-js";
import { render } from "solid-js/web";
import type { Professor } from "@/utils/rmp";
import { schoolNodeId, GMU_SCHOOL_LEGACY_ID } from "@/utils/rmp/ids";
import { createOverlay } from "@/utils/overlay";
import { Carousel } from "@/utils/carousel";
import { tooltip } from "@/utils/tooltip";
import { matchProfessorName } from "@/utils/names";

const professorCache = new Map<string, Promise<Professor | null>>();

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

interface Instructor {
  name: string;
  primary: boolean;
}

interface Data {
  instructors: Instructor[];
}

interface Entry extends Instructor {
  prof: Accessor<Professor | null | undefined>;
}

interface ResolvedEntry extends Instructor {
  prof: Professor | null | undefined;
}

// "(Primary)" is a text node between the instructor's link and the next <br>.
function isPrimary(link: Element): boolean {
  let text = "";
  for (let node = link.nextSibling; node; node = node.nextSibling) {
    if (node.nodeName === "BR" || node.nodeName === "A") break;
    text += node.textContent ?? "";
  }
  return /\(Primary\)/i.test(text);
}

function extractData(td: HTMLTableCellElement): Data | null {
  if (td.dataset.rmpEnhanced) return null;

  const instructors: Instructor[] = [];
  for (const link of td.querySelectorAll("a")) {
    const name = link.textContent?.replace(/\s*\(.*?\)\s*/g, "").trim();
    if (name) instructors.push({ name, primary: isPrimary(link) });
  }
  if (instructors.length === 0) return null;

  // Show the primary instructor first.
  instructors.sort((a, b) => Number(b.primary) - Number(a.primary));
  return { instructors };
}

function fetchProfessor(name: string): Promise<Professor | null> {
  let pending = professorCache.get(name);
  if (!pending) {
    pending = browser.runtime
      .sendMessage({ type: "rmp:searchProfessors", name })
      .then((result) =>
        result?.professors?.length > 0
          ? matchProfessor(name, result.professors)
          : null,
      )
      .catch(() => null);
    professorCache.set(name, pending);
  }
  return pending;
}

function useProfessor(name: string): Accessor<Professor | null | undefined> {
  const [prof, setProf] = createSignal<Professor | null | undefined>(undefined);
  onMount(() => {
    fetchProfessor(name).then(setProf);
  });
  return prof;
}

function ratedProfessor(prof: Professor | null | undefined): Professor | null {
  return prof && prof.overall_rating != null ? prof : null;
}

function rmpUrl(name: string, prof: Professor | null | undefined): string {
  const rated = ratedProfessor(prof);
  return rated
    ? `https://www.ratemyprofessors.com/professor/${rated.id}`
    : `https://www.ratemyprofessors.com/search/professors?q=${encodeURIComponent(name)}&sid=${schoolNodeId(GMU_SCHOOL_LEGACY_ID)}`;
}

const PRIMARY_TAG_CLASS =
  "shrink-0 text-[9px] font-semibold uppercase tracking-wide leading-none px-1 py-0.5 rounded-sm border border-gray-300 bg-gray-100 text-gray-600";

function PrimaryTag(): JSX.Element {
  return <span class={PRIMARY_TAG_CLASS}>Primary</span>;
}

function PrimaryBadge(): JSX.Element {
  return (
    <span
      class={`${PRIMARY_TAG_CLASS} ml-auto mr-1`}
      role="img"
      aria-label="Primary instructor"
    >
      P
    </span>
  );
}

function ProfessorDetails(props: { prof: Professor }): JSX.Element {
  const p = props.prof;
  return (
    <>
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
    </>
  );
}

function TooltipEntry(props: {
  entry: ResolvedEntry;
  multi: boolean;
}): JSX.Element {
  const e = props.entry;
  const rated = ratedProfessor(e.prof);
  return (
    <div class="flex flex-col gap-1 min-w-45">
      <div class="flex items-center justify-between gap-2">
        <span class="font-bold text-sm">{rated?.name ?? e.name}</span>
        <Show when={props.multi && e.primary}>
          <PrimaryTag />
        </Show>
      </div>
      {rated ? (
        <ProfessorDetails prof={rated} />
      ) : (
        <span class="text-xs text-gray-500">
          {e.prof === undefined
            ? "loading..."
            : props.multi
              ? "no ratings on ratemyprofessors.com"
              : "click to search in ratemyprofessors.com"}
        </span>
      )}
    </div>
  );
}

function Tooltip(props: { entries: ResolvedEntry[] }): JSX.Element {
  const multi = props.entries.length > 1;
  const rows = 3;
  const cols = Math.ceil(props.entries.length / rows);

  return (
    <div
      class="bg-white border border-gray-400 p-3"
      style={{
        display: "grid",
        "grid-template-rows": `repeat(${Math.min(props.entries.length, rows)}, auto)`,
        "grid-auto-flow": "column",
        "grid-template-columns": `repeat(${cols}, 1fr)`,
        gap: "6px 12px",
      }}
    >
      {props.entries.map((entry, i) => (
        <div
          style={{
            "border-top": i % rows !== 0 ? "1px solid #e5e7eb" : undefined,
            "padding-top": i % rows !== 0 ? "8px" : undefined,
          }}
        >
          <TooltipEntry entry={entry} multi={multi} />
        </div>
      ))}
    </div>
  );
}

function ProfessorRow(props: { entry: Entry; multi: boolean }): JSX.Element {
  const e = props.entry;
  return (
    <Show
      when={e.prof() !== undefined}
      fallback={
        <span class="font-mono text-[11px] flex items-center h-full px-1.5 text-gray-400">
          ...
        </span>
      }
    >
      <a
        href={rmpUrl(e.name, e.prof())}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 w-full h-full no-underline"
      >
        <Show
          when={ratedProfessor(e.prof())}
          fallback={
            <span class="font-mono font-bold text-[11px] leading-none flex items-center justify-center h-full w-8 bg-gray-100 text-gray-400 min-w-8">
              N/A
            </span>
          }
        >
          {(p) => (
            <span
              class="font-mono font-bold text-[12px] leading-none flex items-center justify-center h-full w-8 min-w-8"
              style={{
                color: ratingColor(p().overall_rating!),
                "background-color": ratingBgColor(p().overall_rating!),
              }}
            >
              {p().overall_rating!.toFixed(1)}
            </span>
          )}
        </Show>
        <span
          class="text-[11px] truncate"
          classList={{
            "text-gray-700": !!ratedProfessor(e.prof()),
            "text-gray-400": !ratedProfessor(e.prof()),
          }}
        >
          {e.name}
        </span>
        <Show when={props.multi && e.primary}>
          <PrimaryBadge />
        </Show>
      </a>
    </Show>
  );
}

function overlay(props: Data): JSX.Element {
  const entries: Entry[] = props.instructors.map((instructor) => ({
    ...instructor,
    prof: useProfessor(instructor.name),
  }));
  const multi = entries.length > 1;

  return (
    <div
      class="pointer-events-auto flex items-center w-full h-full cursor-pointer"
      use:tooltip={{
        // Snapshot the signals so the detached tooltip doesn't subscribe to them.
        content: (
          <Tooltip
            entries={entries.map((entry) => ({ ...entry, prof: entry.prof() }))}
          />
        ),
        position: "left",
      }}
    >
      {multi ? (
        <Carousel>
          {entries.map((entry) => (
            <ProfessorRow entry={entry} multi />
          ))}
        </Carousel>
      ) : (
        <ProfessorRow entry={entries[0]!} multi={false} />
      )}
    </div>
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

  // Hide the original links, <br>s and "(Primary)" text so multiple
  // instructors don't stretch the row past its fixed height.
  for (const node of Array.from(td.childNodes)) {
    if (node === container) continue;
    if (node instanceof HTMLElement) {
      node.style.display = "none";
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const hidden = document.createElement("span");
      hidden.style.display = "none";
      node.replaceWith(hidden);
      hidden.appendChild(node);
    }
  }
}
