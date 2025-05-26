# Hikearound Cloud Functions

This repository contains the cloud and backend functions for the Hikearound web and mobile application, built with Firebase Cloud Functions and TypeScript.

## Overview

The cloud functions handle various backend operations for the Hikearound web and mobile application, including:

- 📱 Push notifications
- 📧 Email template generation
- 🌐 Notification and email translations
- 🔥 Firebase integrations

## Prerequisites

- Node.js 14.x
- Firebase CLI
- npm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure Firebase:

```bash
firebase login
firebase use <your-project-id>
```

3. Set up environment variables (if required)

## Available Scripts

- `npm run build` - Compile TypeScript code
- `npm run serve` - Build and serve functions locally
- `npm run shell` - Start Firebase Functions shell
- `npm run start` - Start Firebase Functions shell
- `npm run deploy` - Deploy functions to Firebase
- `npm run logs` - View Firebase Functions logs
- `npm run lint` - Run ESLint

## Project Structure

```
├── functions/     # Cloud functions implementation
├── notifications/ # Push notification handling and templates
├── templates/     # Email and notification templates
├── translations/  # Internationalization files
├── utils/         # Shared utility functions
└── constants/     # Application-wide constants
```

## Dependencies

Key dependencies include:

- Firebase Admin SDK
- Firebase Functions
- Expo Server SDK (for push notifications)
- Mailgun.js (for email)
- MJML (for email templates)
- i18n-js (for translations)
- Algolia Search
- Sentry (for error tracking)

## Development

1. Make your changes in the TypeScript files
2. Run `npm run build` to compile
3. Test locally using `npm run serve`
4. Deploy using `npm run deploy`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
