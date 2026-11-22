const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setUpClips() {
  const clips = [];
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const clip = clips.find((item) => item.video === entry.target);
      clip.visible = entry.isIntersecting;
      refresh(clip);
    }
  }, { threshold: 0.35 });

  for (const video of document.querySelectorAll("[data-clip]")) {
    const toggle = video.parentElement.querySelector(".clip-toggle");
    const clip = { video, toggle, visible: false, stopped: reducedMotion.matches };
    clips.push(clip);
    label(clip);
    toggle.addEventListener("click", () => {
      clip.stopped = !clip.stopped;
      label(clip);
      refresh(clip);
    });
    observer.observe(video);
  }
}

function label(clip) {
  clip.toggle.textContent = clip.stopped ? clip.toggle.dataset.play : clip.toggle.dataset.pause;
}

function refresh(clip) {
  if (clip.visible && !clip.stopped) {
    clip.video.play().catch(() => {});
  } else {
    clip.video.pause();
  }
}

function setUpTrailerLinks() {
  const trailer = document.querySelector(".trailer-video");
  for (const link of document.querySelectorAll("[data-play-trailer]")) {
    link.addEventListener("click", () => {
      trailer.play().catch(() => {});
    });
  }
}

async function raiseCrew() {
  const crew = document.querySelector(".crew");
  if (!crew) {
    return;
  }

  const pictures = [...crew.querySelectorAll("img")].map((image) => image.decode().catch(() => {}));
  await Promise.all(pictures);
  requestAnimationFrame(() => crew.classList.add("is-up"));
}

async function start() {
  setUpTrailerLinks();
  await window.siteLanguage?.ready;
  setUpClips();
  raiseCrew();
}

start();
