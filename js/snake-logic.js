export const GRID_SIZE = 20;
export const POINTS_PER_FOOD = 10;
export const STATUS = Object.freeze({
  READY: "ready",
  RUNNING: "running",
  PAUSED: "paused",
  GAME_OVER: "game-over",
  WON: "won",
});
export const DIRECTION_VECTORS = Object.freeze({
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
});

const OPPOSITE_DIRECTION = Object.freeze({ up: "down", down: "up", left: "right", right: "left" });
const INITIAL_LENGTH = 3;

function isSamePosition(first, second) {
  return first.x === second.x && first.y === second.y;
}

function listFreeCells(snake) {
  const cells = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) cells.push({ x, y });
  }
  return cells.filter((cell) => !snake.some((part) => isSamePosition(part, cell)));
}

export function placeFood(snake, random) {
  const freeCells = listFreeCells(snake);
  if (freeCells.length === 0) return null;
  return freeCells[Math.floor(random() * freeCells.length)];
}

function createInitialSnake() {
  const middle = Math.floor(GRID_SIZE / 2);
  return Array.from({ length: INITIAL_LENGTH }, (_, index) => ({ x: middle - index, y: middle }));
}

export function createInitialState(random) {
  const snake = createInitialSnake();
  return {
    snake,
    direction: "right",
    nextDirection: "right",
    food: placeFood(snake, random),
    score: 0,
    status: STATUS.READY,
  };
}

export function queueDirection(state, directionName) {
  const isValid = directionName in DIRECTION_VECTORS;
  if (!isValid || OPPOSITE_DIRECTION[state.direction] === directionName) return state;
  return { ...state, nextDirection: directionName };
}

function isOutsideGrid({ x, y }) {
  return x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE;
}

function hitsBody(head, snake) {
  return snake.slice(0, -1).some((part) => isSamePosition(part, head));
}

function moveHead(head, directionName) {
  const vector = DIRECTION_VECTORS[directionName];
  return { x: head.x + vector.x, y: head.y + vector.y };
}

function advance(state, head, random) {
  const ateFood = state.food !== null && isSamePosition(head, state.food);
  const grownSnake = [head, ...state.snake];
  const snake = ateFood ? grownSnake : grownSnake.slice(0, -1);
  const food = ateFood ? placeFood(snake, random) : state.food;
  const score = state.score + (ateFood ? POINTS_PER_FOOD : 0);
  const status = food === null ? STATUS.WON : state.status;
  return { ...state, snake, food, score, status, direction: state.nextDirection };
}

export function stepGame(state, random) {
  if (state.status !== STATUS.RUNNING) return state;
  const head = moveHead(state.snake[0], state.nextDirection);
  if (isOutsideGrid(head) || hitsBody(head, state.snake)) {
    return { ...state, status: STATUS.GAME_OVER };
  }
  return advance(state, head, random);
}
