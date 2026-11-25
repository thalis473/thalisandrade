import { MESSAGES } from "./messages.js";
import { readStoredValue, writeStoredValue } from "./storage.js";
import { TRANSLATIONS_EN } from "./translations-en.js";

export const LANGUAGES = Object.freeze({ PT: "pt", EN: "en" });
export const LANGUAGE_CHANGED_EVENT = "languagechange";

const LANGUAGE_STORAGE_KEY = "site-language";
const PORTUGUESE_PREFIX = "pt";
const HTML_LANG = Object.freeze({ pt: "pt-BR", en: "en" });
const TRANSLATED_ATTRIBUTES = Object.freeze([
  { name: "aria-label", selector: "[data-i18n-aria-label]", datasetKey: "i18nAriaLabel" },
  { name: "alt", selector: "[data-i18n-alt]", datasetKey: "i18nAlt" },
]);

const originalAttributes = new WeakMap();
let currentLanguage = LANGUAGES.PT;

export function detectInitialLanguage(storedValue, browserLanguage) {
  if (Object.values(LANGUAGES).includes(storedValue)) return storedValue;
  const isPortuguese = String(browserLanguage ?? "").toLowerCase().startsWith(PORTUGUESE_PREFIX);
  return isPortuguese ? LANGUAGES.PT : LANGUAGES.EN;
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export function translate(messageKey) {
  return MESSAGES[currentLanguage][messageKey];
}

function translateTextElements(language) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.dataset.originalText ??= element.textContent;
    const translated = TRANSLATIONS_EN[element.dataset.i18n];
    const useEnglish = language === LANGUAGES.EN && translated;
    element.textContent = useEnglish ? translated : element.dataset.originalText;
  });
}

function translateAttribute(language, { name, selector, datasetKey }) {
  document.querySelectorAll(selector).forEach((element) => {
    const originals = originalAttributes.get(element) ?? {};
    originals[name] ??= element.getAttribute(name);
    originalAttributes.set(element, originals);
    const translated = TRANSLATIONS_EN[element.dataset[datasetKey]];
    element.setAttribute(name, language === LANGUAGES.EN && translated ? translated : originals[name]);
  });
}

function translateMetadata(language) {
  const description = document.querySelector('meta[name="description"]');
  document.documentElement.dataset.originalTitle ??= document.title;
  description.dataset.originalContent ??= description.content;
  const isEnglish = language === LANGUAGES.EN;
  document.title = isEnglish ? TRANSLATIONS_EN["meta.title"] : document.documentElement.dataset.originalTitle;
  description.content = isEnglish ? TRANSLATIONS_EN["meta.description"] : description.dataset.originalContent;
}

export function applyLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = HTML_LANG[language];
  translateTextElements(language);
  TRANSLATED_ATTRIBUTES.forEach((attribute) => translateAttribute(language, attribute));
  translateMetadata(language);
  document.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: language }));
}

export function initLanguage() {
  const stored = readStoredValue(LANGUAGE_STORAGE_KEY);
  applyLanguage(detectInitialLanguage(stored, navigator.language));
}

export function toggleLanguage() {
  const nextLanguage = currentLanguage === LANGUAGES.PT ? LANGUAGES.EN : LANGUAGES.PT;
  applyLanguage(nextLanguage);
  writeStoredValue(LANGUAGE_STORAGE_KEY, nextLanguage);
}
