const KEY_TO_DIRECTION = Object.freeze({
  arrowup: "up", w: "up",
  arrowdown: "down", s: "down",
  arrowleft: "left", a: "left",
  arrowright: "right", d: "right",
});
const TOGGLE_KEYS = Object.freeze([" ", "enter"]);
const SWIPE_THRESHOLD_PX = 24;

function isButtonActivation(event, key) {
  return TOGGLE_KEYS.includes(key) && event.target.closest("button") !== null;
}

export function bindKeyboard(target, { onDirection, onToggle }) {
  target.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const direction = KEY_TO_DIRECTION[key];
    if (isButtonActivation(event, key)) return;
    if (direction) onDirection(direction);
    else if (TOGGLE_KEYS.includes(key)) onToggle();
    else return;
    event.preventDefault();
  });
}

function resolveSwipe(deltaX, deltaY) {
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SWIPE_THRESHOLD_PX) return null;
  if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX > 0 ? "right" : "left";
  return deltaY > 0 ? "down" : "up";
}

export function bindSwipe(canvas, onDirection) {
  let start = null;
  canvas.addEventListener("pointerdown", (event) => {
    start = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("pointerup", (event) => {
    const direction = start && resolveSwipe(event.clientX - start.x, event.clientY - start.y);
    start = null;
    if (direction) onDirection(direction);
  });
}

export function bindDirectionButtons(root, onDirection) {
  root.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => onDirection(button.dataset.direction));
  });
}
