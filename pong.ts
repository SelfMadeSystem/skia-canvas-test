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

type AiConfig = {
  predict: boolean;
  center: boolean;
  edge: number | null;
};

class Paddle {
  public prevPosition: Vec2;
  public up = false;
  public down = false;

  get velocity() {
    return (this.down ? 5 : 0) - (this.up ? 5 : 0);
  }

  get centerY() {
    return this.position.y + this.height / 2;
  }

  get topY() {
    return this.position.y;
  }

  get bottomY() {
    return this.position.y + this.height;
  }

  constructor(
    public position: Vec2,
    public width: number,
    public height: number,
    public ai: AiConfig | null = null,
  ) {
    this.prevPosition = position.clone();
  }

  intersecting(ball: Ball) {
    // Swept AABB collision detection
    const nextPos = ball.position.add(ball.velocity);
    const closestX = Math.max(
      this.position.x,
      Math.min(nextPos.x, this.position.x + this.width),
    );
    const closestY = Math.max(
      this.position.y,
      Math.min(nextPos.y, this.position.y + this.height),
    );
    const distanceX = nextPos.x - closestX;
    const distanceY = nextPos.y - closestY;
    return (
      distanceX * distanceX + distanceY * distanceY < ball.radius * ball.radius
    );
  }

  goToPos(posY: number, edge: number | null = null) {
    if (edge !== null) {
      if (posY < this.topY + edge) {
        this.up = true;
        this.down = false;
      } else if (posY > this.bottomY - edge) {
        this.up = false;
        this.down = true;
      } else {
        this.up = false;
        this.down = false;
      }
    } else {
      if (Math.abs(posY - this.centerY) < 10) {
        this.up = false;
        this.down = false;
      } else if (posY < this.centerY) {
        this.up = true;
        this.down = false;
      } else {
        this.up = false;
        this.down = true;
      }
    }
  }

  goToBall(edge: number | null) {
    this.goToPos(ball.position.y, edge);
  }

  goToCenter() {
    this.goToPos(canvas.height / 2);
  }

  getEdgeX() {
    if (this.position.x < canvas.width / 2) {
      return this.position.x + this.width;
    } else {
      return this.position.x;
    }
  }

  goToPredicted(edge: number | null) {
    const predictedY = ball.getPredictedY(this.getEdgeX());
    this.goToPos(predictedY, edge);
  }

  tickAi() {
    if (!this.ai) return;

    if (this.ai.center && ball.goingAwayFrom(this.position.x)) {
      this.goToCenter();
    } else if (this.ai.predict) {
      this.goToPredicted(this.ai.edge);
    } else {
      this.goToBall(this.ai.edge);
    }
  }

  tick() {
    this.prevPosition = this.position.clone();
    if (this.ai) {
      this.tickAi();
    }
    this.position.y += this.velocity;
    if (this.topY < 0) {
      this.position.y = 0;
    } else if (this.bottomY > canvas.height) {
      this.position.y = canvas.height - this.height;
    }
  }

  draw(partialTick: number) {
    ctx.fillStyle = "white";
    const pos = this.prevPosition.lerp(this.position, partialTick);
    ctx.fillRect(pos.x, pos.y, this.width, this.height);
  }
}

class Ball {
  public velocity: Vec2 = new Vec2(0, 0);
  public prevPosition: Vec2 = new Vec2(0, 0);

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
    this.prevPosition = this.position.clone();
    const angle = random(-Math.PI / 4, Math.PI / 4) + (rand01() * Math.PI);
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

  goingAwayFrom(x: number) {
    return (
      (this.velocity.x < 0 && this.position.x < x) ||
      (this.velocity.x > 0 && this.position.x > x)
    );
  }

  goingTowards(x: number) {
    return !this.goingAwayFrom(x);
  }

  getPredictedY(destX: number) {
    const ticksToWall = (destX - this.position.x) / this.velocity.x;

    let { x, y } = this.position;
    let velX = this.velocity.x;
    let velY = this.velocity.y;

    for (let i = 0; i < ticksToWall; i++) {
      x += velX;
      y += velY;

      if (y - this.radius < 0) {
        y = this.radius;
        velY *= -1;
      } else if (y + this.radius > canvas.height) {
        y = canvas.height - this.radius;
        velY *= -1;
      }
    }

    return y;
  }

  draw(partialTick: number) {
    const pos = this.prevPosition.lerp(this.position, partialTick);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  tick() {
    this.prevPosition = this.position.clone();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y - this.radius < 0) {
      this.position.y = this.radius;
      this.velocity.y *= -1;
    }
    if (this.position.y + this.radius > canvas.height) {
      this.position.y = canvas.height - this.radius;
      this.velocity.y *= -1;
    }

    for (const paddle of this.paddles) {
      if (paddle.intersecting(this) && this.goingTowards(paddle.position.x)) {
        const paddleHeight =
          (this.position.y - paddle.position.y) / paddle.height;
        this.bounce(paddleHeight);
        return;
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

const leftPaddle = new Paddle(new Vec2(50, 250), 10, 100, {
  predict: true,
  center: true,
  edge: 15,
});
const rightPaddle = new Paddle(new Vec2(740, 250), 10, 100);
const score = new Score();
const ball = new Ball(new Vec2(400, 300), 10, [leftPaddle, rightPaddle], score);

let prevTime = performance.now();
let timeAccumulator = 0;
const tickTime = 1000 / 60;
const superTickTime = tickTime / 10;

let superSpeed = false;

function gameLoop() {
  const currentTime = performance.now();
  const deltaTime = currentTime - prevTime;
  timeAccumulator += deltaTime;

  const tTime = superSpeed ? superTickTime : tickTime;

  while (timeAccumulator >= tTime) {
    leftPaddle.tick();
    rightPaddle.tick();
    ball.tick();
    timeAccumulator -= tTime;
  }

  const partialTick = timeAccumulator / tTime;

  prevTime = currentTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  leftPaddle.draw(partialTick);
  rightPaddle.draw(partialTick);
  ball.draw(partialTick);
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
    case "Space":
      superSpeed = !superSpeed;
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
window.on("close", () => {
  process.exit(0);
});
