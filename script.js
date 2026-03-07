const modal = document.getElementById("welcomeModal");
const openStoryBtn = document.getElementById("openStoryBtn");
const closeModalBtn = document.getElementById("closeModal");
const heroTimelineBtn = document.getElementById("heroTimelineBtn");
const heroSection = document.getElementById("hero");
const timelineSection = document.getElementById("timelineSection");
const lightbox = document.getElementById("photoLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxTitle");
const lightboxCloseBtn = document.getElementById("lightboxClose");
const lightboxPrevBtn = document.getElementById("lightboxPrev");
const lightboxNextBtn = document.getElementById("lightboxNext");
const loveCounter = document.getElementById("loveCounter");
const decorLayer = document.querySelector(".decor");
const welcomeTitlePart1 = document.getElementById("welcomeTitlePart1");
const welcomeTitlePart2 = document.getElementById("welcomeTitlePart2");
const welcomeText = document.getElementById("welcomeText");

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

function scrollToHero() {
  if (heroSection) {
    heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function openTimelinePage() {
  window.location.href = "timeline.html#timelineSection";
}

if (welcomeTitlePart1 && welcomeTitlePart2 && welcomeText && openStoryBtn) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    welcomeTitlePart1.classList.add("is-visible");
    welcomeTitlePart2.classList.add("is-visible");
    welcomeText.classList.add("is-visible");
    openStoryBtn.classList.add("is-visible");
  } else {
    setTimeout(() => {
      welcomeTitlePart1.classList.add("is-visible");
      setTimeout(() => {
        welcomeTitlePart2.classList.add("is-visible");
        setTimeout(() => {
          welcomeText.classList.add("is-visible");
          setTimeout(() => {
            openStoryBtn.classList.add("is-visible");
          }, 2000);
        }, 2000);
      }, 2000);
    }, 120);
  }
}

function formatLoveDuration(startDate, endDate) {
  const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `Мы вместе: ${days} дней ${hours} часов ${minutes} минут ${seconds} секунд`;
}

if (loveCounter) {
  const loveStartDate = new Date("2024-03-08T00:00:00");
  const renderLoveCounter = () => {
    loveCounter.textContent = formatLoveDuration(loveStartDate, new Date());
  };
  renderLoveCounter();
  setInterval(renderLoveCounter, 1000);
}

if (decorLayer) {
  for (let i = 0; i < 16; i += 1) {
    const heart = document.createElement("span");
    heart.className = "fall-heart";
    heart.textContent = Math.random() > 0.2 ? "❤" : "✦";
    heart.style.setProperty("--left", `${Math.random() * 100}%`);
    heart.style.setProperty("--dur", `${7 + Math.random() * 7}s`);
    heart.style.setProperty("--delay", `${-Math.random() * 12}s`);
    heart.style.setProperty("--size", `${16 + Math.random() * 16}px`);
    decorLayer.appendChild(heart);
  }
}

if (window.matchMedia("(pointer:fine)").matches) {
  const heartCursor = document.createElement("div");
  heartCursor.className = "heart-cursor";
  heartCursor.setAttribute("aria-hidden", "true");
  heartCursor.textContent = "❤";
  document.body.appendChild(heartCursor);
  document.body.classList.add("heart-cursor-enabled");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  const animateCursor = () => {
    currentX += (mouseX - currentX) * 0.22;
    currentY += (mouseY - currentY) * 0.22;
    heartCursor.style.transform = `translate3d(${currentX - 10}px, ${currentY - 12}px, 0)`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();
}

if (openStoryBtn) {
  openStoryBtn.addEventListener("click", () => {
    if (heroSection) {
      scrollToHero();
      return;
    }
    window.location.href = "love-tree.html";
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
const heroFrames = document.querySelectorAll(".hero-photo");

heroFrames.forEach((frame) => {
  // Give each photo a unique smooth wandering path.
  const rand = (min, max) => Math.random() * (max - min) + min;
  frame.style.setProperty("--wander-dur", `${rand(5.2, 8.4).toFixed(2)}s`);
  frame.style.setProperty("--dx1", `${rand(-30, 30).toFixed(1)}px`);
  frame.style.setProperty("--dy1", `${rand(-28, 14).toFixed(1)}px`);
  frame.style.setProperty("--dx2", `${rand(-32, 32).toFixed(1)}px`);
  frame.style.setProperty("--dy2", `${rand(-12, 30).toFixed(1)}px`);
  frame.style.setProperty("--dx3", `${rand(-26, 26).toFixed(1)}px`);
  frame.style.setProperty("--dy3", `${rand(-18, 24).toFixed(1)}px`);
  frame.style.setProperty("--dr1", `${rand(-2.8, 2.8).toFixed(2)}deg`);
  frame.style.setProperty("--dr2", `${rand(-3.2, 3.2).toFixed(2)}deg`);
  frame.style.setProperty("--dr3", `${rand(-2.6, 2.6).toFixed(2)}deg`);
});

heroImages.forEach((img) => {
  img.addEventListener("error", () => {
    const frame = img.closest(".hero-photo");
    if (frame) frame.classList.add("photo-empty");
  });
});

let activePhotoIndex = 0;

function renderLightbox(index) {
  if (!lightbox || !lightboxImage || !heroImages.length) return;
  activePhotoIndex = (index + heroImages.length) % heroImages.length;
  const currentImage = heroImages[activePhotoIndex];
  lightboxImage.src = currentImage.currentSrc || currentImage.src;
  lightboxImage.alt = currentImage.alt;
  if (lightboxCaption) {
    lightboxCaption.textContent = currentImage.alt || `Фото ${activePhotoIndex + 1}`;
  }
}

function openLightbox(index) {
  if (!lightbox) return;
  renderLightbox(index);
  lightbox.classList.remove("hidden");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.add("hidden");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
}

function showNextPhoto(step) {
  renderLightbox(activePhotoIndex + step);
}

heroImages.forEach((img, index) => {
  const frame = img.closest(".hero-photo");
  if (!frame) return;

  frame.setAttribute("role", "button");
  frame.setAttribute("tabindex", "0");
  frame.setAttribute("aria-label", `Открыть ${img.alt.toLowerCase()}`);

  frame.addEventListener("click", () => openLightbox(index));
  frame.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(index);
    }
  });
});

if (lightboxCloseBtn) {
  lightboxCloseBtn.addEventListener("click", closeLightbox);
}

if (lightboxPrevBtn) {
  lightboxPrevBtn.addEventListener("click", () => showNextPhoto(-1));
}

if (lightboxNextBtn) {
  lightboxNextBtn.addEventListener("click", () => showNextPhoto(1));
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.hasAttribute("data-lightbox-close")) {
      closeLightbox();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (!lightbox || lightbox.classList.contains("hidden")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showNextPhoto(-1);
  if (event.key === "ArrowRight") showNextPhoto(1);
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
