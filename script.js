const root = document.documentElement;
const cursor = document.querySelector(".cursor");
const clickLayer = document.querySelector(".click-layer");
const thumbPreview = document.querySelector(".thumb-preview");
const thumbPreviewImage = thumbPreview?.querySelector("img");
const thumbPreviewTitle = thumbPreview?.querySelector("span");
const hoverTargets = document.querySelectorAll("a, button, .case-card, .service-grid article");
const revealTargets = document.querySelectorAll(".reveal, .case-card, .service-grid article, .capability-list li");
const cards = document.querySelectorAll(".tilt-card");
const counters = document.querySelectorAll("[data-count]");
const magneticTargets = document.querySelectorAll(".magnetic");
const projectLinks = document.querySelectorAll(".case-card[data-thumb]");

const formatNumber = (number) => new Intl.NumberFormat("en-US").format(number);

const updateScroll = () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  root.style.setProperty("--scroll", progress.toFixed(4));
};

updateScroll();
window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", updateScroll);

if (cursor) {
  window.addEventListener("pointermove", (event) => {
    cursor.classList.add("is-active");
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  hoverTargets.forEach((target) => {
    target.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
    target.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
  });
}

const makeClickEffect = (event) => {
  if (!clickLayer) return;

  document.body.classList.remove("is-clicking");
  window.requestAnimationFrame(() => document.body.classList.add("is-clicking"));

  ["click-burst", "ripple"].forEach((className) => {
    const element = document.createElement("span");
    element.className = className;
    element.style.left = `${event.clientX}px`;
    element.style.top = `${event.clientY}px`;
    clickLayer.appendChild(element);
    element.addEventListener("animationend", () => element.remove());
  });
};

window.addEventListener("pointerdown", makeClickEffect);
document.body.addEventListener("animationend", () => document.body.classList.remove("is-clicking"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      entry.target.animate(
        [
          { opacity: 0, transform: "translateY(34px) scale(.985)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 720, easing: "cubic-bezier(.22,.8,.24,1)", fill: "both" },
      );
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
);

revealTargets.forEach((target, index) => {
  target.style.animationDelay = `${Math.min(index * 35, 260)}ms`;
  revealObserver.observe(target);
});

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      const end = Number(target.dataset.count);
      const duration = 1100;
      const startTime = performance.now();

      const tick = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        target.textContent = formatNumber(Math.round(end * eased));

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
      countObserver.unobserve(target);
    });
  },
  { threshold: 0.7 },
);

counters.forEach((counter) => countObserver.observe(counter));

cards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -7;
    const rotateY = ((x / rect.width) - 0.5) * 7;

    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

if (thumbPreview && thumbPreviewImage && thumbPreviewTitle) {
  projectLinks.forEach((link) => {
    link.addEventListener("pointerenter", () => {
      thumbPreviewImage.src = link.dataset.thumb;
      thumbPreviewTitle.textContent = link.dataset.title || link.textContent.trim();
      thumbPreview.classList.add("is-visible");
    });

    link.addEventListener("pointermove", (event) => {
      const x = Math.min(window.innerWidth - 170, Math.max(170, event.clientX + 150));
      const y = Math.min(window.innerHeight - 130, Math.max(130, event.clientY - 70));
      thumbPreview.style.left = `${x}px`;
      thumbPreview.style.top = `${y}px`;
    });

    link.addEventListener("pointerleave", () => {
      thumbPreview.classList.remove("is-visible");
    });
  });
}

magneticTargets.forEach((target) => {
  target.addEventListener("pointermove", (event) => {
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    target.style.transform = `translate(${x * 0.16}px, ${y * 0.22}px)`;
  });

  target.addEventListener("pointerleave", () => {
    target.style.transform = "";
  });
});
