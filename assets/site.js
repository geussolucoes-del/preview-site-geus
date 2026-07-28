const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeMenu = () => {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
  mobileNav.classList.remove("is-open");
  header?.classList.remove("menu-visible");
  document.body.classList.remove("menu-open");
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  mobileNav?.classList.toggle("is-open", !isOpen);
  header?.classList.toggle("menu-visible", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 1080) closeMenu();
});
updateHeader();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".reveal");
const revealVisibleElements = () => {
  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight * 0.94 && rect.bottom > 0;
    if (isVisible) element.classList.add("is-visible");
  });
};

const alignHashTarget = () => {
  const id = window.location.hash.slice(1);
  if (!id) return;

  const target = document.getElementById(decodeURIComponent(id));
  if (!target) return;

  target.scrollIntoView({ block: "start" });
  updateHeader();
  revealVisibleElements();
};

const scheduleHashAlignment = () => {
  requestAnimationFrame(() => {
    alignHashTarget();
    window.setTimeout(alignHashTarget, 280);
  });
};

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.13, rootMargin: "0px 0px -40px" },
  );

  revealElements.forEach((element) => observer.observe(element));
  requestAnimationFrame(revealVisibleElements);
  window.addEventListener("load", scheduleHashAlignment);
  window.addEventListener("hashchange", scheduleHashAlignment);
}
