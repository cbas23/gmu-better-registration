import { For } from "solid-js";

const BENEFITS = [
  {
    icon: "rmp",
    title: "See Professor Ratings",
    description: "Professor ratings from RateMyProfessors, built right in.",
  },
  {
    icon: "compact",
    title: "Compact Tables",
    description: "See and compare more information at a glance.",
  },
  {
    icon: "visuals",
    title: "Better Visuals",
    description: "Focus on the details that matter most.",
  },
] as const;

const REPOSITORY_URL = "https://github.com/cbas23/REPOSITORY";

function BenefitIcon(props: { type: (typeof BENEFITS)[number]["icon"] }) {
  if (props.type === "rmp") {
    return (
      <svg class="rmp-mark" viewBox="0 0 24 24">
        <path
          class="rmp-bubble"
          d="M4.25 4.5H19.75V16.25H11L6.5 20V16.25H4.25V4.5Z"
        />
        <text x="12" y="12.25" text-anchor="middle">
          RMP
        </text>
      </svg>
    );
  }

  if (props.type === "compact") {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M4 4L9 9M9 5V9H5M20 4L15 9M15 5V9H19M4 20L9 15M5 15H9V19M20 20L15 15M15 19V15H19" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <path d="M2.75 12S6.15 6.75 12 6.75 21.25 12 21.25 12 17.85 17.25 12 17.25 2.75 12 2.75 12Z" />
      <circle cx="12" cy="12" r="2.35" />
    </svg>
  );
}

function App() {
  return (
    <main class="popup-shell">
      <section class="hero">
        <div class="hero-glow hero-glow-one" />
        <div class="hero-glow hero-glow-two" />

        <header class="brand-row">
          <div class="border-3 rounded-[9px] bg-amber-50">
            <img
              class="logo"
              src="/icon/icon.svg"
              alt="Better GMU Registration logo"
            />
          </div>

          <div class="brand-copy">
            <p class="eyebrow">Made for Mason</p>
            <p class="brand-name">Better GMU Registration</p>
          </div>

          <span class="beta-badge">Beta</span>
        </header>

        <div class="hero-copy">
          <p class="hero-kicker">A Better Registration Experience</p>
          <h1>Make Registration Easier</h1>
        </div>
      </section>

      <section class="content">
        <div class="benefit-list">
          <For each={BENEFITS}>
            {(benefit) => (
              <article class="benefit">
                <div class="benefit-icon" aria-hidden="true">
                  <BenefitIcon type={benefit.icon} />
                </div>
                <div>
                  <h2>{benefit.title}</h2>
                  <p>{benefit.description}</p>
                </div>
              </article>
            )}
          </For>
        </div>

        <footer class="popup-footer">
          <div class="credit-row">
            <span>
              Built by{" "}
              <a
                href="https://github.com/cbas23"
                target="_blank"
                rel="noreferrer"
              >
                cbas23
              </a>
            </span>

            <span class="credit-divider" aria-hidden="true" />

            <a
              class="repository-link"
              href={REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.25 5.75H5.75V18.25H18.25V15.75M12 5.75H18.25V12M18 6L10 14" />
              </svg>
              Repository
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default App;
