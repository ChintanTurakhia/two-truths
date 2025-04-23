import { GameState } from "./types";
import prisma from "./prisma";

export const POINTS_PER_CORRECT_GUESS = 100;

export async function getOrCreateUser(fid: string, username: string) {
  const user = await prisma.user.upsert({
    where: { id: fid },
    update: { username },
    create: {
      id: fid,
      username,
      totalPoints: 0,
    },
  });

  return user;
}

export async function createStatements(
  userId: string,
  truth1: string,
  truth2: string,
  lie: string
) {
  // Create the two truths
  await prisma.statement.create({
    data: {
      userId,
      text: truth1,
      isLie: false,
    },
  });

  await prisma.statement.create({
    data: {
      userId,
      text: truth2,
      isLie: false,
    },
  });

  // Create the lie
  await prisma.statement.create({
    data: {
      userId,
      text: lie,
      isLie: true,
    },
  });
}

export async function getStatementsForUser(userId: string) {
  return prisma.statement.findMany({
    where: { userId },
  });
}

export async function getRandomUserWithStatements(currentUserId: string) {
  // Get a random user that is not the current user and has at least 3 statements
  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      statements: {
        some: {},
      },
    },
    include: {
      _count: {
        select: { statements: true },
      },
    },
  });

  const usersWithEnoughStatements = users.filter(
    (user) => user._count.statements >= 3
  );

  if (usersWithEnoughStatements.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * usersWithEnoughStatements.length
  );
  const randomUser = usersWithEnoughStatements[randomIndex];

  const statements = await prisma.statement.findMany({
    where: { userId: randomUser.id },
  });

  return {
    user: randomUser,
    statements,
  };
}

export async function makeGuess(userId: string, statementId: string) {
  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
  });

  if (!statement) {
    throw new Error("Statement not found");
  }

  const isCorrect = statement.isLie;
  const pointsEarned = isCorrect ? POINTS_PER_CORRECT_GUESS : 0;

  // Create the guess
  const guess = await prisma.guess.create({
    data: {
      userId,
      statementId,
      isCorrect,
      pointsEarned,
    },
  });

  // Update user's total points if guess is correct
  if (isCorrect) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: POINTS_PER_CORRECT_GUESS,
        },
      },
    });
  }

  return guess;
}

export async function getLeaderboard(limit = 10) {
  return prisma.user.findMany({
    orderBy: {
      totalPoints: "desc",
    },
    take: limit,
  });
}

export function encodeState(state: GameState): string {
  return Buffer.from(JSON.stringify(state)).toString("base64");
}

export function decodeState(encodedState: string): GameState {
  try {
    return JSON.parse(Buffer.from(encodedState, "base64").toString());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Return default state if decoding fails
    return { currentView: "welcome" };
  }
}
