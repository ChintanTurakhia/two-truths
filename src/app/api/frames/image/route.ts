import { NextRequest, NextResponse } from "next/server";
import { decodeState } from "../../../../../lib/frames";
import { GameState } from "../../../../../lib/types";
import { createCanvas, CanvasRenderingContext2D } from "canvas";

// Set up canvas dimensions
const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND_COLOR = "#1e293b"; // Slate 800
const TEXT_COLOR = "#f8fafc"; // Slate 50
const ACCENT_COLOR = "#3b82f6"; // Blue 500

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Get state from query parameter
    const url = new URL(req.url);
    const stateParam = url.searchParams.get("state");

    // Default state if none provided
    let state: GameState = { currentView: "welcome" };

    if (stateParam) {
      try {
        state = decodeState(stateParam);
      } catch (error) {
        console.error("Error decoding state:", error);
      }
    }

    // Generate image based on state
    const imageBuffer = await generateImage(state);

    // Return the image
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Error generating image:", error);

    // Return a fallback image or error
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // Fill background
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Add error text
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Error generating image", WIDTH / 2, HEIGHT / 2);

    return new NextResponse(canvas.toBuffer(), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  }
}

async function generateImage(state: GameState): Promise<Buffer> {
  // Create canvas
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Fill background
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Add border
  ctx.strokeStyle = ACCENT_COLOR;
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);

  // Add title
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Two Truths and a Lie", WIDTH / 2, 100);

  // Add content based on state
  switch (state.currentView) {
    case "welcome":
      drawWelcomeScreen(ctx);
      break;

    case "auth":
      drawAuthScreen(ctx);
      break;

    case "create":
      drawCreateScreen(ctx);
      break;

    case "play":
      drawPlayScreen(ctx, state);
      break;

    case "result":
      drawResultScreen(ctx, state);
      break;

    case "leaderboard":
      drawLeaderboardScreen(ctx);
      break;

    default:
      drawWelcomeScreen(ctx);
  }

  // Return the image buffer
  return canvas.toBuffer();
}

function drawWelcomeScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Play the classic game with your Farcaster friends!",
    WIDTH / 2,
    200
  );

  ctx.font = "30px Arial";
  ctx.fillText("Sign in with Farcaster to get started", WIDTH / 2, 300);

  // Draw decorative elements
  drawDecorations(ctx);
}

function drawAuthScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Authenticating with Farcaster...", WIDTH / 2, 300);
}

function drawCreateScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Create Your Statements", WIDTH / 2, 200);

  ctx.font = "30px Arial";
  ctx.fillText(
    "Enter 2 truths and 1 lie separated by | (pipe character)",
    WIDTH / 2,
    280
  );

  ctx.font = "italic 25px Arial";
  ctx.fillText(
    "Example: I can speak 3 languages|I've been to Japan|I have a pet tiger",
    WIDTH / 2,
    330
  );

  // Draw input field representation
  ctx.strokeStyle = TEXT_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(WIDTH / 4, 380, WIDTH / 2, 60);
}

function drawPlayScreen(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Which one is the lie?", WIDTH / 2, 200);

  if (state.statements && state.statements.length > 0) {
    // Draw the statements
    ctx.font = "30px Arial";
    ctx.textAlign = "left";

    const statements = state.statements;
    const startY = 280;
    const spacing = 80;

    for (let i = 0; i < statements.length; i++) {
      // Draw button-like background
      ctx.fillStyle = ACCENT_COLOR;
      ctx.fillRect(
        WIDTH / 4 - 20,
        startY + i * spacing - 30,
        WIDTH / 2 + 40,
        60
      );

      // Draw statement text
      ctx.fillStyle = TEXT_COLOR;
      ctx.fillText(
        `${i + 1}. ${statements[i].text}`,
        WIDTH / 4,
        startY + i * spacing
      );
    }
  } else {
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Loading statements...", WIDTH / 2, 300);
  }
}

function drawResultScreen(ctx: CanvasRenderingContext2D, state: GameState) {
  if (state.lastGuess) {
    if (state.lastGuess.isCorrect) {
      // Correct guess
      ctx.fillStyle = "#10b981"; // Green
      ctx.font = "bold 60px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Correct! 🎉", WIDTH / 2, 200);

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "40px Arial";
      ctx.fillText(
        `You earned ${state.lastGuess.pointsEarned} points!`,
        WIDTH / 2,
        280
      );

      if (state.user) {
        ctx.font = "30px Arial";
        ctx.fillText(
          `Your total: ${state.user.totalPoints} points`,
          WIDTH / 2,
          340
        );
      }
    } else {
      // Wrong guess
      ctx.fillStyle = "#ef4444"; // Red
      ctx.font = "bold 60px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Wrong! 😢", WIDTH / 2, 200);

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "40px Arial";
      ctx.fillText("Better luck next time!", WIDTH / 2, 280);
    }
  } else {
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Something went wrong...", WIDTH / 2, 300);
  }
}

function drawLeaderboardScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Leaderboard", WIDTH / 2, 200);

  // Draw trophy icon
  ctx.fillStyle = "#fbbf24"; // Amber
  drawTrophy(ctx, WIDTH / 2, 300, 100);
}

function drawDecorations(ctx: CanvasRenderingContext2D) {
  // Draw some decorative elements
  ctx.fillStyle = ACCENT_COLOR;

  // Top left decoration
  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, Math.PI * 2);
  ctx.fill();

  // Bottom right decoration
  ctx.beginPath();
  ctx.arc(WIDTH - 100, HEIGHT - 100, 50, 0, Math.PI * 2);
  ctx.fill();

  // Random smaller circles
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;
    const radius = Math.random() * 20 + 5;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTrophy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const halfSize = size / 2;

  // Trophy cup
  ctx.beginPath();
  ctx.moveTo(x - halfSize, y - halfSize);
  ctx.lineTo(x + halfSize, y - halfSize);
  ctx.lineTo(x + halfSize * 0.8, y);
  ctx.lineTo(x - halfSize * 0.8, y);
  ctx.closePath();
  ctx.fill();

  // Trophy base
  ctx.fillRect(x - halfSize * 0.3, y, halfSize * 0.6, halfSize * 0.5);
  ctx.fillRect(
    x - halfSize * 0.6,
    y + halfSize * 0.5,
    halfSize * 1.2,
    halfSize * 0.2
  );

  // Trophy handles
  ctx.beginPath();
  ctx.arc(
    x - halfSize,
    y - halfSize * 0.5,
    halfSize * 0.3,
    Math.PI * 0.5,
    Math.PI * 1.5
  );
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    x + halfSize,
    y - halfSize * 0.5,
    halfSize * 0.3,
    Math.PI * 1.5,
    Math.PI * 2.5
  );
  ctx.fill();
}
