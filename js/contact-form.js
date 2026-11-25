import { SITE_CONFIG } from "./config.js";
import { getCurrentLanguage, translate } from "./i18n.js";
import { buildWhatsAppUrl, composeMessage, validateContact } from "./whatsapp-url.js";

function readFields(form) {
  const topicOption = form.elements.topic.selectedOptions[0];
  return {
    name: form.elements.name.value,
    topic: topicOption ? topicOption.textContent : "",
    message: form.elements.message.value,
  };
}

function showValidation(form, validity) {
  form.elements.name.setAttribute("aria-invalid", String(!validity.name));
  form.elements.message.setAttribute("aria-invalid", String(!validity.message));
  const status = form.querySelector("#contact-status");
  if (!validity.name) status.textContent = translate("formNameRequired");
  else if (!validity.message) status.textContent = translate("formMessageRequired");
  else status.textContent = translate("formOpening");
}

function openInNewTab(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
}

function submitContact(form) {
  const fields = readFields(form);
  const validity = validateContact(fields);
  showValidation(form, validity);
  if (!validity.name || !validity.message) return;
  const text = composeMessage(fields, getCurrentLanguage());
  openInNewTab(buildWhatsAppUrl(SITE_CONFIG.whatsappNumber, text));
}

export function initContactForm(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitContact(form);
  });
}
