import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GRID_COLUMNS,
  GRID_ROWS,
  POINTS_PER_FOOD,
  STATUS,
  createInitialState,
  placeFood,
  queueDirection,
  stepGame,
} from "../js/snake-logic.js";

const alwaysFirst = () => 0;
const running = (overrides = {}) => ({ ...createInitialState(alwaysFirst), status: STATUS.RUNNING, ...overrides });

test("initial state is ready with a 3-cell snake and food off the snake", () => {
  const state = createInitialState(alwaysFirst);
  assert.equal(state.status, STATUS.READY);
  assert.equal(state.snake.length, 3);
  assert.ok(!state.snake.some((part) => part.x === state.food.x && part.y === state.food.y));
});

test("stepGame does nothing unless running", () => {
  const state = createInitialState(alwaysFirst);
  assert.equal(stepGame(state, alwaysFirst), state);
});

test("snake moves one cell in its direction", () => {
  const state = running();
  const next = stepGame(state, alwaysFirst);
  assert.equal(next.snake[0].x, state.snake[0].x + 1);
  assert.equal(next.snake.length, state.snake.length);
});

test("cannot reverse into itself", () => {
  const state = running();
  assert.equal(queueDirection(state, "left"), state);
  assert.equal(queueDirection(state, "up").nextDirection, "up");
  assert.equal(queueDirection(state, "nonsense"), state);
});

test("eating food grows the snake and scores", () => {
  const base = running();
  const head = base.snake[0];
  const state = { ...base, food: { x: head.x + 1, y: head.y } };
  const next = stepGame(state, alwaysFirst);
  assert.equal(next.snake.length, base.snake.length + 1);
  assert.equal(next.score, POINTS_PER_FOOD);
});

test("hitting a wall ends the game", () => {
  const state = running({ snake: [{ x: GRID_COLUMNS - 1, y: 0 }, { x: GRID_COLUMNS - 2, y: 0 }], food: { x: 0, y: 5 } });
  assert.equal(stepGame(state, alwaysFirst).status, STATUS.GAME_OVER);
});

test("hitting its own body ends the game", () => {
  const snake = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 }];
  const state = running({ snake, direction: "up", nextDirection: "left", food: { x: 0, y: 0 } });
  assert.equal(stepGame(state, alwaysFirst).status, STATUS.GAME_OVER);
});

test("moving into the cell the tail just left is allowed", () => {
  const snake = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }];
  const state = running({ snake, direction: "left", nextDirection: "down", food: { x: 0, y: 0 } });
  assert.notEqual(stepGame(state, alwaysFirst).status, STATUS.GAME_OVER);
});

test("placeFood returns null when the board is full", () => {
  const fullBoard = Array.from({ length: GRID_COLUMNS * GRID_ROWS }, (_, index) => ({
    x: index % GRID_COLUMNS,
    y: Math.floor(index / GRID_COLUMNS),
  }));
  assert.equal(placeFood(fullBoard, alwaysFirst), null);
});
