# Math Maze

An educational math game for students built using SvelteKit, Phaser, Supabase,
and Bun.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Development](#development)
- [Git Workflow](#git-workflow)
- [VS Code Extensions](#vs-code-extensions)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## Project Overview

Math Maze is an interactive educational game that combines mathematics with maze
exploration. Students navigate through themed mazes while solving math problems
to progress and reach the goal. Teachers can monitor student progress and switch
to student view to experience the game from a student's perspective.

## Features

- **User Authentication**: Secure login/registration system for students and
  teachers
- **Role-based Access**: Different interfaces for students and teachers
- **Interactive Maze Game**: Navigate through mazes using keyboard controls
- **Math Challenges**: Solve age-appropriate math problems to progress
- **Multiple Themes**: Space, Ocean, Jungle, and Candy themes with unique
  visual elements
- **Responsive Design**: Adapts to different screen sizes
- **Teacher Dashboard**: View student progress and switch to student view
- **Student Dashboard**: Access games and view achievements

## Prerequisites

- **Homebrew:** Install from [brew.sh](https://brew.sh) if you haven't
  already.
- **Bun:** JavaScript runtime; installable via Homebrew.
- **Git:** For version control.
- **VS Code:** (Optional, but recommended for development)

## Setup

1.  **Clone the Repository:**

```bash
git clone https://github.com/cmpt322-2025sp/project-drop-table-teams.git
cd project-drop-table-teams
```

2.  **Install Dependencies via Homebrew:**

There is a `Brewfile` for convenience. Run the following command to install
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

5.  **Optional: Use the `setup.sh` script to automate installation**

The `setup.sh` script installs from the `Brewfile`, installs project
dependencies with bun, and sets up necessary configurations.

## Development

- Run the Development Server:

```bash
bun run dev
```

- Build the Project:

```bash
bun run build
```

- Preview Production Build:

```bash
bun run preview
```

- Type Checking:

```bash
bun run check
```

- Linting and Formatting:

```bash
bun run lint
```

```bash
bun run format
```

- Running Tests:

```bash
bun test
```

## Git Workflow

Follow these guidelines for contributing:

- Branching:

  - Create a new branch for each feature or bug fix:

  ```bash
  git checkout -b feature-branch
  ```

- Committing:

  - Commit small, focused changes with clear commit messages.
  - Push your branch.
  - Allow Josh to merge the branch into main.

## VS Code Extensions

Recommended VS Code extensions:

- Svelte for VS Code (`svelte.svelte-vscode`)
- Prettier - Code formatter (`esbenp.prettier-vscode`)
- ESLint (`dbaeumer.vscode-eslint`)

You can install these manually or use the provided `.vscode/extensions.json`
file for recommendations.

## Project Structure

The project follows SvelteKit's file-based routing structure:

    math-maze/
    ├── src/                # Source code
    │   ├── lib/            # Shared components and utilities
    │   │   ├── components/ # Reusable UI components
    │   │   ├── game/       # Phaser game logic
    │   │   ├── stores/     # Svelte stores
    │   │   └── Maze.ts     # Maze generation logic
    │   ├── routes/         # SvelteKit routes
    │   │   ├── auth/       # Authentication routes
    │   │   └── private/    # Protected routes
    │   │       ├── student/ # Student-specific routes
    │   │       └── teacher/ # Teacher-specific routes
    ├── static/             # Static assets
    ├── supabase/           # Supabase configuration and migrations
    ├── tests/              # Test files
    └── [config files]      # Various configuration files

## Environment Variables

The `.env.example` file contains the keys required for connecting to Supabase.
Make sure to copy it to `.env.local` and update the values before starting
development.

## Contributing

- Create a new branch for your feature/bug fix.
- Make your changes and commit them with clear messages.
