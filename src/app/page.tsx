import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two Truths and a Lie",
  description: "A fun game to play with your Farcaster friends!",
  openGraph: {
    title: "Two Truths and a Lie",
    description: "A fun game to play with your Farcaster friends!",
    images: [
      {
        url: "/api/frames/image",
        width: 1200,
        height: 630,
        alt: "Two Truths and a Lie",
      },
    ],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "/api/frames/image",
    "fc:frame:post_url": "/api/frames",
    "fc:frame:button:1": "Sign in with Farcaster",
  },
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-900 text-white">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6">Two Truths and a Lie</h1>
        <p className="text-xl mb-8">
          A fun game to play with your Farcaster friends!
        </p>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
          <ol className="text-left list-decimal pl-6 space-y-2">
            <li>Sign in with your Farcaster account</li>
            <li>Enter 2 truths and 1 lie about yourself</li>
            <li>Guess which statements from other users are lies</li>
            <li>Earn 100 points for each correct guess</li>
            <li>Compete for the top spot on the leaderboard</li>
          </ol>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">About This Game</h2>
          <p className="mb-4">
            This is a Farcaster mini-app built with Next.js, Tailwind CSS, and
            Prisma. It demonstrates how to create interactive experiences using
            Farcaster Frames.
          </p>
          <p>
            To play, open this page in a Farcaster client that supports Frames.
          </p>
        </div>
      </div>
    </main>
  );
}
