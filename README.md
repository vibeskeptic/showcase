# Vibe Skeptic Showcase

A single-page application that showcases all public, non-forked repositories from the [vibe-skeptic](https://github.com/vibe-skeptic) GitHub account.

## Features

- Fetches repos from the GitHub API at runtime (no build-time secrets required)
- Displays project name, description, language, topics, stars, forks, and open issues
- Live search/filter across names, descriptions, and topics
- Links to each project's GitHub page and homepage (when available)
- Responsive grid layout — works great on mobile, tablet, and desktop

## Tech Stack

| Tool | Version |
|------|---------|
| React | 19 |
| TypeScript | 5.9 |
| Vite | 6 |
| Mantine UI | 8 |
| PNPM | latest |

## Getting Started

```bash
pnpm install
pnpm start      # dev server at http://localhost:5173
pnpm build      # production build → dist/
pnpm test       # run tests
```

## Notes

The app calls the public GitHub API (`https://api.github.com/orgs/vibe-skeptic/repos`). Unauthenticated requests are limited to 60 per hour per IP. For higher throughput you can set `VITE_GITHUB_TOKEN` and update the fetch headers accordingly.
