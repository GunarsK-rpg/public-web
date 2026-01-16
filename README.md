# Cosmere RPG - Character Sheet Manager

![CI](https://github.com/GunarsK-rpg/public-web/workflows/CI/badge.svg)
[![codecov](https://codecov.io/gh/GunarsK-rpg/public-web/graph/badge.svg)](https://codecov.io/gh/GunarsK-rpg/public-web)
[![CodeRabbit](https://img.shields.io/coderabbit/prs/github/GunarsK-rpg/public-web?label=CodeRabbit&color=2ea44f)](https://coderabbit.ai)

Character sheet manager for the Cosmere RPG tabletop game built with Vue.js.

## Features

- Character creation wizard (7-step guided process)
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
- **HTTP Client**: Axios
- **Routing**: Vue Router
- **Testing**: Vitest + jsdom

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
│   │   ├── character/    # Character sheet components
│   │   │   └── tabs/     # Tab components (Stats, Skills, etc.)
│   │   └── wizard/       # Character creation wizard components
│   ├── css/              # Global styles
│   ├── i18n/             # Internationalization
│   ├── layouts/          # Layout components
│   ├── mock/             # Mock data for development
│   ├── pages/            # Page components
│   ├── router/           # Route definitions
│   ├── services/         # API service layer
│   ├── stores/           # Pinia stores
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Utility functions (with tests)
├── public/               # Public static files
└── index.html            # HTML template
```

### Architecture Patterns

**Stores** (`src/stores/`):

- `classifiers` - Game data (ancestries, cultures, skills, talents, etc.)
- `heroes` - Character data management
- `campaigns` - Campaign management
- `user` - User authentication state

**Utils** (`src/utils/`):

- `arrayUtils` - Array search, filter, grouping, map-building
- `characterValidation` - Wizard step validation and budget calculations
- `derivedStats` - Formula and lookup-based stat calculations
- `talentUtils` - Prerequisite formatting for talent display

## Quick Start

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run development server:

   ```bash
   npm run dev
   ```

3. Access at: `http://localhost:7100`

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

# Testing
task test                # Run unit tests
task test:watch          # Run tests in watch mode
task test:coverage       # Run tests with coverage

# Security
task security:audit      # Run npm security audit (high/critical only)

# Docker
task docker:build        # Build Docker image
task docker:run          # Run in Docker container

# CI/CD
task ci:all              # Run all CI checks
```

## Testing

Unit tests use Vitest with jsdom. Tests are co-located with source files (`*.test.ts`).

```bash
task test              # Run all tests
task test:watch        # Watch mode
task test:coverage     # Coverage report
```

See [TESTING.md](TESTING.md) for detailed testing documentation.

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

## API Integration

The app connects to backend services via axios:

- **auth-service**: Authentication (login, refresh, logout)
- **rpg-api**: Game data and character management

API configuration is in `src/boot/axios.ts` and `src/services/`.

## CI/CD

GitHub Actions workflow runs on push/PR to main/develop:

- Lint and format checks
- TypeScript type checking
- Unit tests
- Production build
- Security audit (npm audit)
- Docker image build and Trivy scan
- Secret scanning (TruffleHog)

## License

MIT
