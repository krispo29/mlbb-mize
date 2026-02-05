# MLBB Mize

> **The ultimate MLBB drafting assistant.** Data-driven counter-picking and intelligent hero randomization for Mobile Legends: Bang Bang.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan?logo=tailwindcss)

## Features

- **🎯 Draft Assistant** — Select enemy heroes and get data-driven counter-pick suggestions based on win-rate deltas.
- **📚 Hero Library** — Browse all 126 MLBB heroes with search, role, and lane filtering.
- **🎲 Random Roll** — Randomly select heroes based on filters for fun games with friends.
- **🌙 Dark Mode** — Beautiful dark theme with system preference support.

## Tech Stack

| Category      | Technology              |
| ------------- | ----------------------- |
| Framework     | Next.js 16 (App Router) |
| Language      | TypeScript              |
| Styling       | Tailwind CSS v4         |
| UI Components | Shadcn UI               |
| State         | React hooks + useMemo   |
| Validation    | Zod                     |
| Theming       | next-themes             |
| Icons         | Lucide React            |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
mlbb-mize/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── draft/              # Draft Assistant
│   └── heroes/             # Hero Library
├── components/             # React components
│   ├── ui/                 # Shadcn UI components
│   ├── draft-board.tsx     # Draft UI with counter suggestions
│   ├── hero-grid.tsx       # Hero grid with filtering
│   └── navbar.tsx          # Global navigation
├── lib/
│   ├── api/                # API fetching services
│   ├── data/               # Mock data generators
│   └── types/              # TypeScript types + Zod schemas
└── public/                 # Static assets
```

## API

This app fetches hero data from the [MLBB Wiki API](https://mlbb-wiki-api.vercel.app/api/heroes).

## License

MIT
