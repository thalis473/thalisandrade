import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MAX_MESSAGE_LENGTH,
  buildWhatsAppUrl,
  composeMessage,
  sanitizeText,
  validateContact,
} from "../js/whatsapp-url.js";

test("sanitizeText strips control characters, collapses spaces and truncates", () => {
  assert.equal(sanitizeText("  a\u0000  b \t c ", 50), "a b c");
  assert.equal(sanitizeText("x".repeat(MAX_MESSAGE_LENGTH + 5), MAX_MESSAGE_LENGTH).length, MAX_MESSAGE_LENGTH);
});

test("validateContact requires name and message", () => {
  assert.deepEqual(validateContact({ name: " ", message: "oi" }), { name: false, message: true });
  assert.deepEqual(validateContact({ name: "Ana", message: "oi" }), { name: true, message: true });
});

test("composeMessage uses the selected language", () => {
  const input = { name: "Ana", topic: "Site", message: "Preciso de um site" };
  assert.match(composeMessage(input, "pt"), /^Olá, Thalis! Meu nome é Ana\./);
  assert.match(composeMessage(input, "en"), /^Hi, Thalis! My name is Ana\./);
  assert.match(composeMessage(input, "xx"), /^Olá/);
});

test("buildWhatsAppUrl encodes the text safely", () => {
  const url = buildWhatsAppUrl("5521979757714", "oi & tchau?\nok");
  assert.equal(url, "https://wa.me/5521979757714?text=oi%20%26%20tchau%3F%0Aok");
});

test("buildWhatsAppUrl rejects an invalid number", () => {
  assert.throws(() => buildWhatsAppUrl("abc", "oi"), RangeError);
  assert.throws(() => buildWhatsAppUrl("5521/../x", "oi"), RangeError);
});
