const REPOSITORY_URL = "https://github.com/cbas23/gmu-better-registration";
const AUTHOR_URL = "https://github.com/cbas23";
const CONTACT_EMAIL = "contact@cbas23.me";

const FEATURES = [
  "RateMyProfessors ratings",
  "Compact, easier-to-read tables",
  "Clear meeting times and seat counts",
];

function App() {
  const version = browser.runtime.getManifest().version;

  return (
    <main class="popup">
      <header class="overview">
        <div class="brand">
          <span class="logo">
            <img src="/icon/128.png" alt="" width="128" height="128" />
          </span>
          <div class="brand-text">
            <h1>Better GMU Registration</h1>
            <span class="version">v{version}</span>
          </div>
        </div>

        <p class="description">
          A simpler way to browse classes in Patriot Web.
        </p>
      </header>

      <section class="feature-section" aria-label="Features">
        <ul class="features">
          {FEATURES.map((feature) => (
            <li>{feature}</li>
          ))}
        </ul>
      </section>

      <footer class="footer">
        <nav class="links" aria-label="Project links">
          <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>
          <a
            href={`${REPOSITORY_URL}/blob/main/SECURITY.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy policy
          </a>
        </nav>

        <dl class="meta">
          <div>
            <dt>Made by</dt>
            <dd>
              <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">
                cbas23
              </a>
            </dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </dd>
          </div>
        </dl>
      </footer>
    </main>
  );
}

export default App;
