import { Window, type KeyboardEventProps } from "skia-canvas";
import { Vec2 } from "vec2";

const window = new Window(800, 600, {
  background: "black",
});
const { canvas } = window;
const ctx = canvas.getContext("2d");
window.open();

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function rand01() {
  return Math.random() < 0.5 ? 0 : 1;
}

class Score {
  left = 0;
  right = 0;

  draw() {
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "end";
    ctx.fillText(this.left.toString(), canvas.width / 2 - 20, 50);
    ctx.textAlign = "start";
    ctx.fillText(this.right.toString(), canvas.width / 2 + 20, 50);
  }
}

class Paddle {
  public up = false;
  public down = false;

  get velocity() {
    return (this.down ? 5 : 0) - (this.up ? 5 : 0);
  }

  constructor(
    public position: Vec2,
    public width: number,
    public height: number,
  ) {}

  tick() {
    this.position.y += this.velocity;
    if (this.position.y < 0) {
      this.position.y = 0;
    } else if (this.position.y + this.height > canvas.height) {
      this.position.y = canvas.height - this.height;
    }
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Ball {
  public velocity: Vec2 = new Vec2(0, 0);

  constructor(
    public position: Vec2,
    public radius: number,
    public paddles: Paddle[] = [],
    public score: Score,
  ) {
    this.reset();
  }

  reset() {
    this.position = new Vec2(canvas.width / 2, canvas.height / 2);
    const angle = random(-Math.PI / 4, Math.PI / 4) + (rand01() ? Math.PI : 0);
    const speed = 7;
    this.velocity = new Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  // paddleHeight between 0 and 1, where 0 is the top of the paddle and 1 is the bottom
  bounce(paddleHeight: number) {
    const angle = ((paddleHeight - 0.5) * Math.PI) / 2; // -45 to 45 degrees
    const speed = this.velocity.length() + 0.5; // Increase speed slightly on each hit
    this.velocity.x = Math.cos(angle) * speed * (this.velocity.x > 0 ? -1 : 1);
    this.velocity.y = Math.sin(angle) * speed;
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  tick() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (
      this.position.y - this.radius < 0 ||
      this.position.y + this.radius > canvas.height
    ) {
      this.velocity.y *= -1;
    }

    for (const paddle of this.paddles) {
      if (
        this.position.x - this.radius < paddle.position.x + paddle.width &&
        this.position.x + this.radius > paddle.position.x &&
        this.position.y + this.radius > paddle.position.y &&
        this.position.y - this.radius < paddle.position.y + paddle.height
      ) {
        const paddleHeight =
          (this.position.y - paddle.position.y) / paddle.height;
        this.bounce(paddleHeight);
        break;
      }
    }

    if (
      this.position.x - this.radius < 0 ||
      this.position.x + this.radius > canvas.width
    ) {
      if (this.position.x < canvas.width / 2) {
        this.score.right++;
      } else {
        this.score.left++;
      }
      this.reset();
    }
  }
}

const leftPaddle = new Paddle(new Vec2(50, 250), 10, 100);
const rightPaddle = new Paddle(new Vec2(740, 250), 10, 100);
const score = new Score();
const ball = new Ball(new Vec2(400, 300), 10, [leftPaddle, rightPaddle], score);

let prevTime = performance.now();
let timeAccumulator = 0;
const tickTime = 1000 / 60; // 60 FPS

function gameLoop() {
  const currentTime = performance.now();
  const deltaTime = currentTime - prevTime;
  timeAccumulator += deltaTime;

  while (timeAccumulator >= tickTime) {
    leftPaddle.tick();
    rightPaddle.tick();
    ball.tick();
    timeAccumulator -= tickTime;
  }

  prevTime = currentTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  leftPaddle.draw();
  rightPaddle.draw();
  ball.draw();
  score.draw();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
}

function handleKeyDown(event: KeyboardEventProps) {
  switch (event.code) {
    case "KeyW":
      leftPaddle.up = true;
      break;
    case "KeyS":
      leftPaddle.down = true;
      break;
    case "ArrowUp":
      rightPaddle.up = true;
      break;
    case "ArrowDown":
      rightPaddle.down = true;
      break;
  }
}

function handleKeyUp(event: KeyboardEventProps) {
  switch (event.code) {
    case "KeyW":
      leftPaddle.up = false;
      break;
    case "KeyS":
      leftPaddle.down = false;
      break;
    case "ArrowUp":
      rightPaddle.up = false;
      break;
    case "ArrowDown":
      rightPaddle.down = false;
      break;
  }
}

window.on("keyup", handleKeyUp);
window.on("keydown", handleKeyDown);
window.on("frame", gameLoop);
