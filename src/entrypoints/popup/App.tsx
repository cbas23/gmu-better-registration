const REPOSITORY_URL = "https://github.com/cbas23/gmu-better-registration";
const CONTACT_EMAIL = "contact@cbas23.me";

function App() {
  return (
    <main class="popup">
      <section class="overview" aria-labelledby="popup-title">
        <header class="brand">
          <img class="logo" src="/icon/48.png" alt="" width="48" height="48" />
          <h1 id="popup-title">
            Better GMU
            <br />
            Registration
          </h1>
        </header>

        <p class="description">
          A simpler way to browse classes in Patriot Web.
        </p>
      </section>

      <div class="feature-section">
        <ul class="features">
          <li>RateMyProfessors ratings</li>
          <li>Compact, easier-to-read tables</li>
          <li>Clear meeting times and seat counts</li>
        </ul>
      </div>

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
        <span class="made-by">
          Made by{" "}
          <a
            href="https://github.com/cbas23"
            target="_blank"
            rel="noopener noreferrer"
          >
            cbas23
          </a>
        </span>
        <span class="made-by">
          Contact me{" "}
          <a class="contact-link" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </span>
      </nav>
    </main>
  );
}

export default App;
