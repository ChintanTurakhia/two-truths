import { NextRequest, NextResponse } from "next/server";
import { getFrameMessage } from "frames.js";
import {
  decodeState,
  encodeState,
  getOrCreateUser,
  createStatements,
  getRandomUserWithStatements,
  makeGuess,
  getLeaderboard,
} from "../../../../lib/frames";
import { GameState } from "../../../../lib/types";

// Define a type for the frame message to avoid using 'any'
interface FrameMessageData {
  isValid: boolean;
  button?: number;
  state?: string;
  fid?: number;
  username?: string;
  inputText?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the frame message
    const body = await req.json();

    // Handle both frames.js format and our simplified test format
    let frameMessage: FrameMessageData;

    // Check if this is our test format
    if (body.isValid !== undefined) {
      // This is our simplified test format
      frameMessage = body as FrameMessageData;
    } else {
      // This is the frames.js format
      try {
        const frameMessageResult = await getFrameMessage(body);

        if (!frameMessageResult || !frameMessageResult.isValid) {
          return NextResponse.json(
            { error: "Invalid frame request" },
            { status: 400 }
          );
        }

        // Cast to our custom type for better type safety
        frameMessage = frameMessageResult as unknown as FrameMessageData;
      } catch (error) {
        console.error("Error parsing frame message:", error);
        return NextResponse.json(
          { error: "Invalid frame request format" },
          { status: 400 }
        );
      }
    }

    // Get the button index that was clicked
    const buttonIndex = frameMessage.button || 1;

    // Get the state from the frame message
    let state: GameState = { currentView: "welcome" };
    if (frameMessage.state) {
      state = decodeState(frameMessage.state);
    }

    // Handle the frame action based on the current view and button index
    switch (state.currentView) {
      case "welcome":
        // Button 1: Sign in with Farcaster
        state.currentView = "auth";
        break;

      case "auth":
        // User has authenticated
        if (frameMessage.fid) {
          const user = await getOrCreateUser(
            frameMessage.fid.toString(),
            frameMessage.username || `User_${frameMessage.fid}`
          );
          state.user = {
            id: user.id,
            username: user.username,
            totalPoints: user.totalPoints,
          };
          state.currentView = "create";
        } else {
          // If no FID, go back to welcome
          state.currentView = "welcome";
        }
        break;

      case "create":
        // Handle statement creation or navigation
        if (buttonIndex === 1 && frameMessage.inputText) {
          // Parse the input text (format: "Truth 1|Truth 2|Lie")
          const statements = frameMessage.inputText.split("|");
          if (statements.length === 3 && state.user) {
            await createStatements(
              state.user.id,
              statements[0].trim(),
              statements[1].trim(),
              statements[2].trim()
            );
            state.currentView = "play";
          } else {
            // Invalid input, stay on create view
            state.currentView = "create";
          }
        } else if (buttonIndex === 2) {
          // Skip to play
          state.currentView = "play";
        } else if (buttonIndex === 3) {
          // Go to leaderboard
          state.currentView = "leaderboard";
        }
        break;

      case "play":
        if (!state.user) {
          state.currentView = "welcome";
          break;
        }

        if (!state.statements) {
          // Fetch statements from a random user
          const randomUserData = await getRandomUserWithStatements(
            state.user.id
          );

          if (randomUserData) {
            state.statements = randomUserData.statements.map((s) => ({
              id: s.id,
              userId: s.userId,
              text: s.text,
              isLie: s.isLie,
            }));
            // Shuffle the statements
            state.statements.sort(() => Math.random() - 0.5);
            state.currentStatementIndex = 0;
          } else {
            // No other users with statements, go back to create
            state.currentView = "create";
            break;
          }
        }

        // Handle guess
        if (state.statements && state.currentStatementIndex !== undefined) {
          if (buttonIndex >= 1 && buttonIndex <= 3) {
            const statementIndex = buttonIndex - 1;
            if (statementIndex < state.statements.length) {
              const statement = state.statements[statementIndex];

              // Make the guess
              const guess = await makeGuess(state.user.id, statement.id);

              state.lastGuess = {
                id: guess.id,
                userId: guess.userId,
                statementId: guess.statementId,
                isCorrect: guess.isCorrect,
                pointsEarned: guess.pointsEarned,
              };

              // Update user's points
              if (guess.isCorrect) {
                state.user.totalPoints += guess.pointsEarned;
              }

              state.currentView = "result";
            }
          } else if (buttonIndex === 4) {
            // Go to leaderboard
            state.currentView = "leaderboard";
          }
        }
        break;

      case "result":
        if (buttonIndex === 1) {
          // Play again
          state.statements = undefined;
          state.currentStatementIndex = undefined;
          state.lastGuess = undefined;
          state.currentView = "play";
        } else if (buttonIndex === 2) {
          // Create new statements
          state.currentView = "create";
        } else if (buttonIndex === 3) {
          // Go to leaderboard
          state.currentView = "leaderboard";
        }
        break;

      case "leaderboard":
        if (buttonIndex === 1) {
          // Play
          state.statements = undefined;
          state.currentStatementIndex = undefined;
          state.lastGuess = undefined;
          state.currentView = "play";
        } else if (buttonIndex === 2) {
          // Create new statements
          state.currentView = "create";
        }
        break;

      default:
        state.currentView = "welcome";
        break;
    }

    // Generate the frame HTML based on the current state
    const frameHtml = await generateFrameHtml(state);

    return new NextResponse(frameHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error handling frame request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateFrameHtml(state: GameState): Promise<string> {
  const host = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";
  const encodedState = encodeState(state);

  let title = "Two Truths and a Lie";
  let description = "A fun game to play with friends!";
  let buttons: string[] = [];
  const image = `${host}/api/frames/image?state=${encodedState}`;
  let inputText = false;

  switch (state.currentView) {
    case "welcome":
      description =
        "Play the classic game of Two Truths and a Lie with your Farcaster friends!";
      buttons = ["Sign in with Farcaster"];
      break;

    case "auth":
      description = "Authenticating with Farcaster...";
      break;

    case "create":
      title = "Create Your Statements";
      description =
        "Enter 2 truths and 1 lie separated by | (pipe character).\nExample: I can speak 3 languages|I've been to Japan|I have a pet tiger";
      buttons = ["Submit", "Skip to Play", "View Leaderboard"];
      inputText = true;
      break;

    case "play":
      if (!state.statements || state.statements.length === 0) {
        description = "Loading statements...";
      } else {
        title = "Which one is the lie?";
        description = "Select the statement you think is a lie:";
        buttons = [
          state.statements[0].text,
          state.statements[1].text,
          state.statements[2].text,
          "View Leaderboard",
        ];
      }
      break;

    case "result":
      if (state.lastGuess) {
        title = state.lastGuess.isCorrect ? "Correct! 🎉" : "Wrong! 😢";
        description = state.lastGuess.isCorrect
          ? `You earned ${state.lastGuess.pointsEarned} points! Your total: ${
              state.user?.totalPoints || 0
            }`
          : "Better luck next time!";
        buttons = ["Play Again", "Create New Statements", "View Leaderboard"];
      } else {
        description = "Something went wrong...";
        buttons = ["Play Again"];
      }
      break;

    case "leaderboard":
      title = "Leaderboard";
      description = "Top players:";

      // Use getLeaderboard to fetch top players
      try {
        const topPlayers = await getLeaderboard(10);
        if (topPlayers.length > 0) {
          description =
            "Top players:\n" +
            topPlayers
              .map(
                (player, index) =>
                  `${index + 1}. ${player.username}: ${
                    player.totalPoints
                  } points`
              )
              .join("\n");
        } else {
          description = "No players yet. Be the first!";
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        description = "Could not load leaderboard.";
      }

      buttons = ["Play", "Create New Statements"];
      break;
  }

  // Construct the frame HTML
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${image}" />
        <meta property="fc:frame:post_url" content="${host}/api/frames" />
        <meta property="fc:frame:state" content="${encodedState}" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${image}" />
        ${buttons
          .map(
            (button, i) =>
              `<meta property="fc:frame:button:${i + 1}" content="${button}" />`
          )
          .join("\n")}
        ${
          inputText
            ? `<meta property="fc:frame:input:text" content="Enter your statements" />`
            : ""
        }
      </head>
      <body>
        <h1>${title}</h1>
        <p>${description}</p>
      </body>
    </html>
  `;
}
