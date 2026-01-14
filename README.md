# Cosmere RPG - Character Sheet Manager

Character sheet manager for the Cosmere RPG tabletop game built with Vue.js.

## Features

- Character sheet viewer with 7 tabs (Stats, Skills, Actions, Equipment, Talents, Expertises, Others)
- Campaign and character selection
- User authentication
- Mobile-first responsive design
- Dark mode support

## Tech Stack

- **Framework**: Vue 3 (Composition API) + TypeScript
- **UI Library**: Quasar Framework
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router

## Prerequisites

- Node.js 22+ (LTS)
- npm 10+
- [Task](https://taskfile.dev/) (recommended for running commands)

## Project Structure

```text
public-web/
├── src/
│   ├── assets/           # Static assets
│   ├── boot/             # Boot files (i18n, axios)
│   ├── components/       # Vue components
│   │   └── character/    # Character sheet components
│   │       └── tabs/     # Tab components (Stats, Skills, etc.)
│   ├── css/              # Global styles
│   ├── i18n/             # Internationalization
│   ├── layouts/          # Layout components
│   ├── mock/             # Mock data for development
│   ├── pages/            # Page components
│   ├── router/           # Route definitions
│   ├── stores/           # Pinia stores
│   └── types/            # TypeScript interfaces
├── public/               # Public static files
└── index.html            # HTML template
```

## Quick Start

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

1. Run development server:

   ```bash
   npm run dev
   ```

1. Access at: `http://localhost:7100`

## Available Commands

Using Task:

```bash
# Development
task dev:start           # Start development server
task install             # Install dependencies

# Build
task build               # Build for production
task preview             # Preview production build
task clean               # Clean build artifacts

# Code quality
task lint                # Run ESLint
task lint:fix            # Run ESLint and auto-fix issues
task format              # Format code with Prettier
task format:check        # Check code formatting
task typecheck           # Run TypeScript type checking

# Security
task security:audit      # Run npm security audit (high/critical only)

# Docker
task docker:build        # Build Docker image
task docker:run          # Run in Docker container

# CI/CD
task ci:all              # Run all CI checks
```

Using npm directly:

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

## Character Sheet Tabs

1. **Stats** - Attributes (STR, SPD, INT, WIL, AWA, PRE), defenses, and derived stats
2. **Skills** - Physical, Cognitive, and Spiritual skills with ranks
3. **Actions** - Combat actions (basic, talent, and surge actions)
4. **Equipment** - Weapons, armor, equipment, and currency
5. **Talents** - Path, specialty, and acquired talents
6. **Expertises** - Expertise categories and items
7. **Others** - Goals, connections, companions, biography, and conditions

## Game Mechanics

Based on the Cosmere RPG system:

- **Attributes**: 6 attributes (0-5 scale)
- **Defenses**: Physical (STR+SPD), Cognitive (INT+WIL), Spiritual (AWA+PRE)
- **Health**: healthBase (from level table) + STR × tier
- **Focus**: 2 + WIL
- **Investiture**: 2 + max(AWA, PRE) for Radiants

## Development Server

The development server runs on port 7100.

## Building for Production

```bash
npm run build
```

Output is in the `dist/spa/` directory.

## Docker Deployment

```bash
# Build image
docker build -t cosmere-rpg .

# Run container (nginx listens on port 8080)
docker run -p 7100:8080 cosmere-rpg
```

## License

MIT
