# Two Truths and a Lie - Farcaster Mini-App

A fun game built as a Farcaster mini-app (Frames v2) where users can share two truths and one lie about themselves, and guess which statements from other users are lies.

## Features

- **Authentication**: Sign in with Farcaster
- **Game Mechanics**: Enter 2 truths and 1 lie in text input fields
- **Gameplay**: Guess which statement from other users is a lie
- **Points System**: Get 100 points for correct guesses
- **Leaderboard**: See top players based on points

## Tech Stack

- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Prisma with SQLite
- **Frames Integration**: frames.js for Farcaster Frames v2
- **Image Generation**: Canvas for dynamic frame images

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/two-truths.git
   cd two-truths
   ```

2. Install dependencies:

   ```bash
   npm install --legacy-peer-deps
   ```

3. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser or Farcaster client.

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository.

2. Import the project in Vercel.

3. The project includes a `vercel.json` file that configures the build process to generate the Prisma client.

4. Set the following environment variables in Vercel:

   - `DATABASE_URL`: Your database connection string
   - `NEXT_PUBLIC_HOST`: Your deployment URL (e.g., https://your-app.vercel.app)

5. Deploy!

## How It Works

1. Users sign in with their Farcaster account
2. They submit 2 truths and 1 lie about themselves
3. Other users try to guess which statement is the lie
4. Users earn 100 points for each correct guess
5. A leaderboard shows the top players

## Project Structure

- `src/app/page.tsx`: Main landing page
- `src/app/api/frames/route.ts`: API endpoint for frame actions
- `src/app/api/frames/image/route.ts`: API endpoint for frame images
- `lib/frames.ts`: Game logic and database operations
- `lib/types.ts`: TypeScript interfaces
- `prisma/schema.prisma`: Database schema

## License

MIT
