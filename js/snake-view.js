import { GRID_SIZE } from "./snake-logic.js";

const CELL_GAP_PX = 2;
const FOOD_RADIUS_RATIO = 0.35;
const GRID_LINE_ALPHA = 0.06;
const GLOW_BLUR_PX = 12;

function readPalette(canvas) {
  const styles = getComputedStyle(canvas);
  const read = (name) => styles.getPropertyValue(name).trim();
  return { background: read("--bg"), snake: read("--cyan"), head: read("--lime"), food: read("--magenta") };
}

function drawBackground(context, canvas, palette, cellSize) {
  context.shadowBlur = 0;
  context.fillStyle = palette.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = `rgba(255, 255, 255, ${GRID_LINE_ALPHA})`;
  for (let index = 1; index < GRID_SIZE; index += 1) {
    context.strokeRect(index * cellSize, 0, 0, canvas.height);
    context.strokeRect(0, index * cellSize, canvas.width, 0);
  }
}

function drawCell(context, position, cellSize, color) {
  context.fillStyle = color;
  context.shadowColor = color;
  context.shadowBlur = GLOW_BLUR_PX;
  const size = cellSize - CELL_GAP_PX;
  context.fillRect(position.x * cellSize + CELL_GAP_PX / 2, position.y * cellSize + CELL_GAP_PX / 2, size, size);
}

function drawFood(context, food, cellSize, color) {
  if (food === null) return;
  context.fillStyle = color;
  context.shadowColor = color;
  context.shadowBlur = GLOW_BLUR_PX;
  context.beginPath();
  context.arc((food.x + 0.5) * cellSize, (food.y + 0.5) * cellSize, cellSize * FOOD_RADIUS_RATIO, 0, Math.PI * 2);
  context.fill();
}

export function createRenderer(canvas) {
  const context = canvas.getContext("2d");
  const cellSize = canvas.width / GRID_SIZE;
  const palette = readPalette(canvas);
  return {
    draw(state) {
      drawBackground(context, canvas, palette, cellSize);
      drawFood(context, state.food, cellSize, palette.food);
      state.snake.forEach((part, index) => drawCell(context, part, cellSize, index === 0 ? palette.head : palette.snake));
    },
  };
}
