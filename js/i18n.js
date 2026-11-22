(() => {
  const languages = ["en", "fr", "de", "es"];
  const storageKey = "language";
  const root = document.documentElement;
  const folder = new URL("../locales/", document.currentScript.src);

  root.classList.add("js");

  function remembered() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function remember(code) {
    try {
      localStorage.setItem(storageKey, code);
    } catch (error) {
    }
  }

  function choose() {
    const asked = new URLSearchParams(location.search).get("lang");
    if (languages.includes(asked)) {
      remember(asked);
      return asked;
    }

    const saved = remembered();
    if (languages.includes(saved)) {
      return saved;
    }

    for (const tag of navigator.languages || [navigator.language]) {
      const code = String(tag).toLowerCase().split("-")[0];
      if (languages.includes(code)) {
        return code;
      }
    }

    return "en";
  }

  function apply(strings) {
    for (const element of document.querySelectorAll("[data-i18n]")) {
      const text = strings[element.dataset.i18n];
      if (text === undefined) {
        continue;
      }

      if (element.tagName === "TITLE") {
        document.title = text;
      } else {
        element.innerHTML = text;
      }
    }

    for (const element of document.querySelectorAll("[data-i18n-attr]")) {
      for (const pair of element.dataset.i18nAttr.split(";")) {
        const [name, key] = pair.split(":").map((part) => part.trim());
        if (strings[key] !== undefined) {
          element.setAttribute(name, strings[key]);
        }
      }
    }
  }

  function markCurrent(code) {
    for (const link of document.querySelectorAll("[data-language]")) {
      if (link.dataset.language === code) {
        link.setAttribute("aria-current", "true");
      }
    }
  }

  const code = choose();
  const parsed = new Promise((resolve) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    } else {
      resolve();
    }
  });

  if (code === "en") {
    window.siteLanguage = { code, ready: parsed.then(() => markCurrent(code)) };
    return;
  }

  root.classList.add("translating");
  const ready = new Promise((resolve) => {
    const reveal = () => {
      root.classList.remove("translating");
      resolve();
    };
    const fallback = setTimeout(reveal, 3000);
    const strings = fetch(new URL(`${code}.json`, folder)).then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} for ${code}.json`);
      }
      return response.json();
    });

    Promise.all([strings, parsed])
      .then(([loaded]) => {
        apply(loaded);
        root.lang = code;
      })
      .catch((error) => console.warn("Translation not loaded:", error))
      .finally(() => {
        markCurrent(code);
        clearTimeout(fallback);
        reveal();
      });
  });

  window.siteLanguage = { code, ready };
})();
