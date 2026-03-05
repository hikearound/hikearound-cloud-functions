# hikearound-cloud-functions

Serverless functions for Hikearound's web and iOS clients, built with Firebase Cloud Functions and JavaScript.

## Tech Stack

- Node.js 14, Firebase Cloud Functions v3
- ESLint 7 with Airbnb config + Prettier
- Module aliases via `module-alias` (`@constants`, `@functions`, `@utils`, etc.)

## Architecture

- `index.js` - Main entry point, exports all cloud functions
- `functions/` - Individual cloud function implementations
- `notifications/` - Push notification logic (Expo Server SDK)
- `templates/` - Email templates (MJML + Handlebars)
- `translations/` - i18n translation files
- `constants/` - Shared constants
- `utils/` - Shared utility functions

## Code Style

- 4-space indentation, single quotes, trailing commas, semicolons required
- Prettier configured via ESLint plugin (printWidth: 80, tabWidth: 4)
- Airbnb style guide as base

## Commands

- `npm run lint` - Run ESLint
- `npm run build` - Compile TypeScript
- `npm run serve` - Build and serve locally
- `npm run deploy` - Deploy to Firebase

## CI

- GitHub Actions workflow at `.github/workflows/ci.yml`
- Runs claudelint validation and ESLint on push/PR to master
