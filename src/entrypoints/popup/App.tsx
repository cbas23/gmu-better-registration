import { For } from "solid-js";

const FEATURES = [
  {
    icon: "★",
    title: "Professor Ratings",
    desc: "RateMyProfessors ratings inline",
  },
  {
    icon: "⏱",
    title: "Meeting Times",
    desc: "Formatted time & location display",
  },
  {
    icon: "📊",
    title: "Status Badges",
    desc: "Color-coded enrollment status",
  },
  {
    icon: "🏷",
    title: "Attributes & Notes",
    desc: "Course attributes and section notes",
  },
  {
    icon: "🔗",
    title: "Linked Sections",
    desc: "Linked lab/discussion indicators",
  },
  {
    icon: "📋",
    title: "Schedule Types",
    desc: "Schedule type labels",
  },
];

function App() {
  return (
    <div class="w-80 p-5 bg-zinc-900 text-zinc-100 font-sans">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600 text-white font-bold text-lg">
          GMU
        </div>
        <div>
          <h1 class="text-base font-bold leading-tight">Better Registration</h1>
          <p class="text-xs text-zinc-400">RateMyProfessors for Patriot Web</p>
        </div>
      </div>

      <p class="text-sm text-zinc-300 mb-4 leading-relaxed">
        Enhances GMU's course registration page with professor ratings,
        difficulty scores, and more directly from RateMyProfessors.
      </p>

      <p class="text-sm text-sky-200 mb-4 leading-relaxed">
        * This is a <span class="font-bold">BETA</span> build of this extension
      </p>

      <div class="grid grid-cols-2 gap-2 mb-4">
        <For each={FEATURES}>
          {(f) => (
            <div class="flex items-start gap-2 p-2 rounded-md bg-zinc-800 border border-zinc-700">
              <span class="text-base leading-none mt-0.5">{f.icon}</span>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-zinc-200 leading-tight">
                  {f.title}
                </p>
                <p class="text-[10px] text-zinc-500 leading-tight">{f.desc}</p>
              </div>
            </div>
          )}
        </For>
      </div>

      <p class="text-[10px] text-zinc-600 text-center mt-3">
        Data sourced from RateMyProfessors
      </p>
    </div>
  );
}

export default App;
