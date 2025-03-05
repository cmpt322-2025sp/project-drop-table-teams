# Math Maze

This is our group project for software engineering---a math game for kids built
using SvelteKit, Supabase, and Bun.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Development](#development)
- [Git Workflow](#git-workflow)
- [VS Code Extensions](#vs-code-extensions)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## Prerequisites

- **Homebrew:** Install from [brew.sh](https://brew.sh) if you haven't
  already.
- **Bun:** JavaScript runtime; installable via Homebrew.
- **Git:** For version control.
- **VS Code:** (Optional, but recommended for development)

## Setup

1.  **Clone the Repository:**

```bash
git clone https://github.com/yourusername/your-repo-name.git cd your-repo-name
```

2.  **Install Dependencies via Homebrew:**

There is a `Brewfile` for convenience. Run the folling command to install
required tools (like Bun and Git):

```bash
brew bundle
```

3.  **Install Project Dependencies:**

```bash
bun install
```

4.  **Configure Environment Variables:**

```bash
cp .env.example .env
```

5.  **Optional: Use the `start.sh` script to automate brew, bun, and Supabase**

The `start.sh` script checks for a `.env`, and copies from `.env.exmaple` if
none is found. Then it installs from the `Brewfile`, installs project
dependencies with bun, and starts a local Supabase instance for simplicity.

6.  **Optional: Configure VS Code Extensions**

Use VS Code and the following [extensions](#vs-code-extensions) if you don't
have something else in mind.

## Development

- Run the Development Server:

```bash
bun dev
```

- Build the Project:

```bash
bun build
```

- Linting and Formatting:

Our project uses ESLint and Prettier. To run linting:

```bash
bun run lint
```

To format your code:

```bash
bun run format
```

## Git Workflow

Follow these guidelines to make git simple:

- Branching:

  - Create a new branch for each feature or bug fix:

  ```bash
  git checkout -b feature-branch
  ```

- Committing:
  - Commit small, focused changes with clear commit messages.
- Pull Requests:
  - Push your branch and create a pull request on GitHub for code review.
  - Merge changes only after the pull request has been approved.

## VS Code Extensions

Recommended VS Code extensions:

- Svelte for VS Code (`svelte.svelte-vscode`)
- Prettier - Code formatter (`esbenp.prettier-vscode`)
- ESLint (`dbaeumer.vscode-eslint`)

You can install these manually or use the provided `.vscode/extensions.json`
file for recommendations.

## Project Structure

    |-- src/                # Source code for the project
    |-- public/             # Static assets
    |-- .env.example        # Example environment variables
    |-- package.json        # Project metadata and scripts
    |-- README.md           # This file
    |-- flake.nix           # Nix flake for dev tools
    |-- flake.lock          # Flake lock file for version pinning
    |-- Brewfile            # Project dependencies and dev tools
    └-- .vscode/            # VS Code settings and reccomended extensions

## Environment Variables

The `.env.example` file contains the keys required for connecting to Supabase.
Make sure to copy it to `.env` and update the values before starting
development.

## Contributing

- Fork the repository.
- Create a new branch for your feature/bug fix.
- Make your changes and commit them with clear messages.
- Submit a pull request with a detailed description of your changes.
