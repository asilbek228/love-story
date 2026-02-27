const modal = document.getElementById("welcomeModal");
const openStoryBtn = document.getElementById("openStoryBtn");
const closeModalBtn = document.getElementById("closeModal");
const heroTimelineBtn = document.getElementById("heroTimelineBtn");
const timelineSection = document.getElementById("timelineSection");

// Background music (low volume + resume across pages)
const MUSIC_STORAGE_KEY = "love_story_music_state_v1";
const MUSIC_UNLOCK_KEY = "love_story_music_unlocked_v1";
const MUSIC_ENABLED_KEY = "love_story_music_enabled_v1";
const bgMusic = new Audio("music/love.mp3");
bgMusic.loop = true;
bgMusic.preload = "auto";
bgMusic.volume = 0.1;
let musicStateRestored = false;
let musicSaveIntervalId = null;

function getSavedMusicState() {
  try {
    return JSON.parse(sessionStorage.getItem(MUSIC_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveMusicState() {
  if (!musicStateRestored) return;
  try {
    sessionStorage.setItem(
      MUSIC_STORAGE_KEY,
      JSON.stringify({
        time: bgMusic.currentTime || 0,
        playing: !bgMusic.paused,
        volume: bgMusic.volume
      })
    );
  } catch {
    // Ignore storage errors.
  }
}

function tryPlayMusic() {
  if (localStorage.getItem(MUSIC_ENABLED_KEY) === "0") return;
  bgMusic.play().catch(() => {
    // Autoplay can be blocked; user interaction fallback handles this.
  });
}

function isMusicEnabled() {
  return localStorage.getItem(MUSIC_ENABLED_KEY) !== "0";
}

function setMusicEnabled(enabled) {
  localStorage.setItem(MUSIC_ENABLED_KEY, enabled ? "1" : "0");
}

function updateMusicButton(button) {
  if (!button) return;
  const enabled = isMusicEnabled();
  button.textContent = enabled ? "Музыка: Вкл" : "Музыка: Выкл";
  button.setAttribute("aria-pressed", enabled ? "true" : "false");
}

const savedState = getSavedMusicState();
if (typeof savedState.volume === "number") {
  bgMusic.volume = Math.min(0.15, Math.max(0.03, savedState.volume));
}

bgMusic.addEventListener("loadedmetadata", () => {
  if (typeof savedState.time === "number" && Number.isFinite(savedState.time)) {
    bgMusic.currentTime = Math.max(0, Math.min(savedState.time, Math.max(0, bgMusic.duration - 0.25)));
  }
  musicStateRestored = true;
  if (!musicSaveIntervalId) {
    musicSaveIntervalId = setInterval(saveMusicState, 1000);
  }
  if (isMusicEnabled() && (savedState.playing || sessionStorage.getItem(MUSIC_UNLOCK_KEY) === "1")) {
    tryPlayMusic();
  }
});

const unlockMusic = () => {
  sessionStorage.setItem(MUSIC_UNLOCK_KEY, "1");
  if (isMusicEnabled()) {
    tryPlayMusic();
  }
};

["click", "touchstart", "keydown"].forEach((eventName) => {
  document.addEventListener(eventName, unlockMusic, { once: true });
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveMusicState();
  }
});
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (link) {
    saveMusicState();
  }
});
window.addEventListener("beforeunload", saveMusicState);
window.addEventListener("pagehide", saveMusicState);

const musicToggleBtn = document.createElement("button");
musicToggleBtn.className = "music-toggle";
musicToggleBtn.type = "button";
musicToggleBtn.setAttribute("aria-label", "Переключить музыку");
updateMusicButton(musicToggleBtn);
musicToggleBtn.addEventListener("click", () => {
  const enableNow = !isMusicEnabled();
  setMusicEnabled(enableNow);
  if (enableNow) {
    sessionStorage.setItem(MUSIC_UNLOCK_KEY, "1");
    tryPlayMusic();
  } else {
    bgMusic.pause();
    saveMusicState();
  }
  updateMusicButton(musicToggleBtn);
});
document.body.appendChild(musicToggleBtn);

function closeModal() {
  if (modal) {
    modal.classList.add("hidden");
  }
}

function scrollToTimeline() {
  if (timelineSection) {
    timelineSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function openTimelinePage() {
  window.location.href = "timeline.html#timelineSection";
}

if (openStoryBtn) {
  openStoryBtn.addEventListener("click", () => {
    closeModal();
    setTimeout(openTimelinePage, 220);
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
}

if (heroTimelineBtn) {
  heroTimelineBtn.addEventListener("click", openTimelinePage);
}

const heroImages = document.querySelectorAll(".hero-photo img");
heroImages.forEach((img) => {
  img.addEventListener("error", () => {
    const frame = img.closest(".hero-photo");
    if (frame) frame.classList.add("photo-empty");
  });
});

// Reveal timeline cards on scroll
const items = document.querySelectorAll(".timeline-item");

if ("IntersectionObserver" in window) {
  items.forEach((item) => item.classList.add("reveal-init"));

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("show");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  items.forEach((item) => observer.observe(item));
}
