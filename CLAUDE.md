# Vibe Skeptic Showcase

## Project Overview

This showcase is a simple single page application that will showcase all projects created on the VibeSkeptic github account.

Use the GitHub api to fetch all repos and display them in a friendly way that shows the project names/descriptions/github stats (stars/forks/etc) and then a link to their homepage if applicable.

## Tech Stack

- **Backend**: None
- **Frontend**: React 19, TypeScript 5.9, Vite 8, Mantine 8, PNPM

## References

Mantine: https://mantine.dev/llms.txt

## Common Commands

When setting up the project set it up with the following commands:
`pnpm start` - Spin up the vite dev server
`pnpm build` - Build the site for production
`pnpm test` - Run any tests

## Best Practices

### README.md

Create and maintain the README as the project is being developed.

### Git

Before making a commit, make sure the project builds without error and all tests are passing.

At the end of every prompt, create a commit with the following commit message structure:

> claude: <insert commit message>
> More description if needed
