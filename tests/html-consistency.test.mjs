import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { detectInitialLanguage } from "../js/i18n.js";
import { MESSAGES } from "../js/messages.js";
import { TRANSLATIONS_EN } from "../js/translations-en.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const jsSources = ["main", "snake-game", "contact-form"].map((name) =>
  readFileSync(new URL(`../js/${name}.js`, import.meta.url), "utf8"),
);

function collect(pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

test("every data-i18n key used in the HTML has an English translation", () => {
  const keys = collect(/data-i18n(?:-alt|-aria-label)?="([^"]+)"/g);
  const missing = keys.filter((key) => !(key in TRANSLATIONS_EN));
  assert.deepEqual(missing, []);
});

test("every English translation is used somewhere in the HTML", () => {
  const used = new Set(collect(/data-i18n(?:-alt|-aria-label)?="([^"]+)"/g));
  const metadataKeys = ["meta.title", "meta.description"];
  const unused = Object.keys(TRANSLATIONS_EN).filter((key) => !used.has(key) && !metadataKeys.includes(key));
  assert.deepEqual(unused, []);
});

test("Portuguese and English dynamic messages have the same keys", () => {
  assert.deepEqual(Object.keys(MESSAGES.pt).sort(), Object.keys(MESSAGES.en).sort());
});

test("every element id referenced by the scripts exists in the HTML", () => {
  const referenced = jsSources.flatMap((source) => [...source.matchAll(/["'`]#([\w-]+)["'`]/g)].map((m) => m[1]));
  const ids = new Set(collect(/\sid="([^"]+)"/g));
  const missing = [...new Set(referenced)].filter((id) => !ids.has(id));
  assert.deepEqual(missing, []);
});

test("the page contains no old social networks or personal documents", () => {
  assert.doesNotMatch(html, /instagram|twitter|facebook|x\.com|\.pdf/i);
});

test("the page has no inline scripts, inline styles or inline event handlers", () => {
  assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)[^>]*>/i);
  assert.doesNotMatch(html, /\sstyle=|\son\w+=/i);
});

test("language detection prefers a stored choice, then the browser language", () => {
  assert.equal(detectInitialLanguage("en", "pt-BR"), "en");
  assert.equal(detectInitialLanguage(null, "pt-BR"), "pt");
  assert.equal(detectInitialLanguage(null, "fr-FR"), "en");
  assert.equal(detectInitialLanguage("zz", undefined), "en");
});
