# hikearound-cloud-functions

[![CI](https://github.com/hikearound/hikearound-cloud-functions/actions/workflows/ci.yml/badge.svg?branch=master&event=push)](https://github.com/hikearound/hikearound-cloud-functions/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/hikearound/hikearound-cloud-functions)](LICENSE)

Serverless functions for Hikearound's web and iOS clients, built with Firebase Cloud Functions.

## Overview

Backend cloud functions handling push notifications, email templates, translations, and Firebase integrations for the Hikearound hiking platform.

## Tech Stack

- **Runtime**: Node.js 14, Firebase Cloud Functions
- **Notifications**: Expo Server SDK
- **Email**: Mailgun, MJML templates, Handlebars
- **Search**: Algolia
- **Monitoring**: Sentry
- **Messaging**: Slack Webhooks

## Getting Started

```bash
npm install
firebase login
firebase use <project-id>
```

## Development

```bash
npm run serve     # Build and serve locally
npm run shell     # Firebase Functions shell
npm run deploy    # Deploy to Firebase
npm run logs      # View function logs
npm run lint      # Run ESLint
```

## Project Structure

```
constants/       Application-wide constants
functions/       Cloud function implementations
notifications/   Push notification handling
templates/       Email and notification templates
translations/    Internationalization files
utils/           Shared utilities
```

## Related

- [hikearound-app](https://github.com/hikearound/hikearound-app) - iOS client
- [hikearound-web](https://github.com/hikearound/hikearound-web) - Web client
