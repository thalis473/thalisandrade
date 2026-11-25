import { SITE_CONFIG } from "./config.js";
import { initContactForm } from "./contact-form.js";
import { initLanguage, toggleLanguage } from "./i18n.js";
import { SnakeGame } from "./snake-game.js";

const LINK_BUILDERS = Object.freeze({
  whatsapp: () => `https://wa.me/${SITE_CONFIG.whatsappNumber}`,
  linkedin: () => SITE_CONFIG.linkedinUrl,
  github: () => SITE_CONFIG.githubUrl,
  email: () => (SITE_CONFIG.email ? `mailto:${SITE_CONFIG.email}` : ""),
});

function fillLinks() {
  document.querySelectorAll("[data-link]").forEach((link) => {
    const href = LINK_BUILDERS[link.dataset.link]?.() ?? "";
    if (href) link.href = href;
    else link.hidden = true;
  });
}

function initMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#menu");
  const setOpen = (isOpen) => {
    menu.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  };
  toggle.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
  menu.addEventListener("click", (event) => event.target.closest("a") && setOpen(false));
}

function start() {
  initLanguage();
  fillLinks();
  initMenu();
  document.querySelector("#lang-toggle").addEventListener("click", toggleLanguage);
  document.querySelector("#year").textContent = String(new Date().getFullYear());
  initContactForm(document.querySelector("#contact-form"));
  new SnakeGame(document.querySelector("#snake-panel"));
}

start();
