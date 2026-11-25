export const MAX_NAME_LENGTH = 80;
export const MAX_MESSAGE_LENGTH = 1000;

const WHATSAPP_BASE_URL = "https://wa.me/";
const PHONE_PATTERN = /^\d{10,15}$/;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B-\u001F\u007F]/g;
const REPEATED_SPACES = /[^\S\n]+/g;

export const MESSAGE_TEMPLATES = Object.freeze({
  pt: { greeting: "Olá, Thalis! Meu nome é {name}.", topic: "Assunto: {topic}" },
  en: { greeting: "Hi, Thalis! My name is {name}.", topic: "Topic: {topic}" },
});

export function sanitizeText(value, maxLength) {
  return String(value ?? "")
    .replace(CONTROL_CHARACTERS, "")
    .replace(REPEATED_SPACES, " ")
    .trim()
    .slice(0, maxLength);
}

export function validateContact({ name, message }) {
  return {
    name: sanitizeText(name, MAX_NAME_LENGTH).length > 0,
    message: sanitizeText(message, MAX_MESSAGE_LENGTH).length > 0,
  };
}

export function composeMessage({ name, topic, message }, language) {
  const template = MESSAGE_TEMPLATES[language] ?? MESSAGE_TEMPLATES.pt;
  const greeting = template.greeting.replace("{name}", sanitizeText(name, MAX_NAME_LENGTH));
  const topicLine = template.topic.replace("{topic}", sanitizeText(topic, MAX_NAME_LENGTH));
  return [greeting, topicLine, "", sanitizeText(message, MAX_MESSAGE_LENGTH)].join("\n");
}

export function buildWhatsAppUrl(phoneNumber, text) {
  if (!PHONE_PATTERN.test(phoneNumber)) {
    throw new RangeError("Invalid WhatsApp number in site configuration.");
  }
  return `${WHATSAPP_BASE_URL}${phoneNumber}?text=${encodeURIComponent(text)}`;
}
