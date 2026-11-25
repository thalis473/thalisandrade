import { LANGUAGE_CHANGED_EVENT, translate } from "./i18n.js";
import { bindDirectionButtons, bindKeyboard, bindSwipe } from "./snake-controls.js";
import { POINTS_PER_FOOD, STATUS, createInitialState, queueDirection, stepGame } from "./snake-logic.js";
import { createRenderer } from "./snake-view.js";
import { readStoredValue, writeStoredValue } from "./storage.js";

const BEST_SCORE_KEY = "snake-best-score";
const BASE_TICK_MS = 140;
const MIN_TICK_MS = 70;
const TICK_STEP_MS = 4;
const VISIBLE_RATIO = 0.3;
const STATUS_MESSAGE_KEY = Object.freeze({
  [STATUS.READY]: "gameReady",
  [STATUS.RUNNING]: "gameRunning",
  [STATUS.PAUSED]: "gamePaused",
  [STATUS.GAME_OVER]: "gameOver",
  [STATUS.WON]: "gameWon",
});
const TOGGLE_LABEL_KEY = Object.freeze({
  [STATUS.READY]: "buttonStart",
  [STATUS.RUNNING]: "buttonPause",
  [STATUS.PAUSED]: "buttonResume",
  [STATUS.GAME_OVER]: "buttonAgain",
  [STATUS.WON]: "buttonAgain",
});

function readBestScore() {
  const stored = Number.parseInt(readStoredValue(BEST_SCORE_KEY) ?? "", 10);
  return Number.isFinite(stored) && stored > 0 ? stored : 0;
}

export class SnakeGame {
  constructor(panel) {
    this.panel = panel;
    this.canvas = panel.querySelector("#snake-canvas");
    this.elements = {
      score: panel.querySelector("#snake-score"),
      best: panel.querySelector("#snake-best"),
      status: panel.querySelector("#snake-status"),
      toggle: panel.querySelector("#snake-toggle"),
    };
    this.renderer = createRenderer(this.canvas);
    this.bestScore = readBestScore();
    this.timer = null;
    this.reset();
    this.bindEvents();
  }

  reset() {
    this.stopTimer();
    this.state = createInitialState(Math.random);
    this.render();
  }

  bindEvents() {
    bindKeyboard(this.panel, { onDirection: (name) => this.steer(name), onToggle: () => this.toggle() });
    bindSwipe(this.canvas, (name) => this.steer(name));
    bindDirectionButtons(this.panel, (name) => this.steer(name));
    this.panel.querySelector("#snake-toggle").addEventListener("click", () => this.toggle());
    this.panel.querySelector("#snake-restart").addEventListener("click", () => this.reset());
    document.addEventListener(LANGUAGE_CHANGED_EVENT, () => this.renderHud());
    document.addEventListener("visibilitychange", () => document.hidden && this.pause());
    new IntersectionObserver(([entry]) => entry.isIntersecting || this.pause(), { threshold: VISIBLE_RATIO }).observe(this.panel);
  }

  steer(directionName) {
    if (this.state.status === STATUS.READY) this.resume();
    if (this.state.status !== STATUS.RUNNING) return;
    this.state = queueDirection(this.state, directionName);
  }

  toggle() {
    const { status } = this.state;
    if (status === STATUS.RUNNING) this.pause();
    else if (status === STATUS.PAUSED || status === STATUS.READY) this.resume();
    else this.reset();
  }

  resume() {
    this.state = { ...this.state, status: STATUS.RUNNING };
    this.render();
    this.scheduleTick();
  }

  pause() {
    if (this.state.status !== STATUS.RUNNING) return;
    this.stopTimer();
    this.state = { ...this.state, status: STATUS.PAUSED };
    this.render();
  }

  scheduleTick() {
    const speedUps = this.state.score / POINTS_PER_FOOD;
    const delay = Math.max(MIN_TICK_MS, BASE_TICK_MS - speedUps * TICK_STEP_MS);
    this.timer = setTimeout(() => this.tick(), delay);
  }

  tick() {
    this.state = stepGame(this.state, Math.random);
    this.updateBestScore();
    this.render();
    if (this.state.status === STATUS.RUNNING) this.scheduleTick();
  }

  updateBestScore() {
    if (this.state.score <= this.bestScore) return;
    this.bestScore = this.state.score;
    writeStoredValue(BEST_SCORE_KEY, this.bestScore);
  }

  stopTimer() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  render() {
    this.renderer.draw(this.state);
    this.renderHud();
  }

  renderHud() {
    const { score, status } = this.state;
    this.elements.score.textContent = String(score);
    this.elements.best.textContent = String(this.bestScore);
    this.elements.status.textContent = translate(STATUS_MESSAGE_KEY[status]);
    this.elements.toggle.textContent = translate(TOGGLE_LABEL_KEY[status]);
  }
}
