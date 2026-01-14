# FuelQ Website

A modern, responsive website dedicated to providing information about fuel quality and alternative energy sources.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Server Management with PM2](#server-management-with-pm2)
- [Project Pages](#project-pages)
- [Component System](#component-system)
- [Module System](#module-system)
- [Service Worker](#service-worker)
- [Building and Deployment](#building-and-deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Contact](#contact)

## Project Overview

FuelQ is a comprehensive web platform focused on clean energy innovation, providing information about alternative fuel technologies including hydrogen energy systems, advanced biofuels, and integrated renewable systems. The site features a component-based architecture with a modular JavaScript system for maintainability and scalability.

The website is deployed at [https://fuelq.ru](https://fuelq.ru) and serves as an educational resource for both the general public and engineering professionals interested in sustainable energy solutions.

## Features

- **Comprehensive Energy Information**: Detailed content about various alternative energy sources
- **Technical Resources**: Specialized information for engineers and technical professionals
- **Community Forum**: Discussion platform for knowledge sharing and collaboration
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Component-Based Architecture**: Modular design for maintainability and scalability
- **Service Worker**: Offline support and improved performance
- **Dynamic Module Loading**: Optimized JavaScript loading based on page requirements
- **Theme Management**: Light/dark theme support
- **Form Validation**: Client-side validation with user-friendly error messages
- **Notification System**: Non-intrusive alerts and updates
- **Data Visualization**: Interactive charts and diagrams

## Technologies Used

### Frontend
- **HTML5**: Semantic markup for accessibility and SEO
- **CSS3**: Modern styling with animations and transitions
- **JavaScript (ES6+)**: Modern JavaScript with modules and async/await
- **Font Awesome**: Icon library for UI elements
- **Service Workers API**: Offline support and caching

### Backend
- **Node.js**: JavaScript runtime for server-side code
- **Express.js**: Web application framework
- **TypeScript**: Type-safe JavaScript development
- **MySQL**: Database for forum and user data
- **JWT**: Authentication tokens
- **PM2**: Process management

## Project Structure

```
fuelq/
├── README.md               # This file
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── ecosystem.config.cjs    # PM2 configuration
├── server.ts               # Main server file
├── index.html              # Main landing page
├── manifest.json           # Web app manifest
├── sw.ts                   # Service worker
├── src/                    # Source files
│   ├── api/                # API endpoints
│   ├── assets/             # Static assets
│   │   ├── css/            # Stylesheets
│   │   ├── images/         # Image assets
│   │   └── js/             # JavaScript files
│   │       ├── core/       # Core modules
│   │       ├── modules/    # Feature modules
│   │       ├── pages/      # Page-specific controllers
│   │       └── utils/      # Utility functions
│   ├── components/         # Reusable UI components
│   │   ├── chat/           # Chat component
│   │   ├── discovery/      # Discovery component
│   │   ├── footer/         # Footer component
│   │   ├── forum/          # Forum component
│   │   ├── header/         # Header component
│   │   ├── mobile/         # Mobile-specific components
│   │   ├── notifications/  # Notification component
│   │   └── user-profile/   # User profile component
│   ├── pages/              # HTML pages
│   │   ├── cabinet.html    # User cabinet
│   │   ├── contacts.html   # Contact page
│   │   ├── discovery.html  # Discovery page
│   │   ├── forengineers.html # Engineers page
│   │   ├── login.html      # Login page
│   │   ├── register.html   # Registration page
│   │   └── forum/          # Forum pages
│   ├── sw.ts               # Service worker source
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── middleware/             # Express middleware
│   ├── auth-enhanced.ts    # Enhanced authentication
│   └── rateLimiter.ts      # Rate limiting
├── migrations/             # Database migrations
│   ├── 001-initial-schema.ts
│   ├── config.ts
│   └── runner.ts
├── scripts/                # Build and utility scripts
│   └── build.ts            # Build script
└── types/                  # Global type definitions
    └── express.d.ts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (for development)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/maratfa/fuelq.git
   ```

2. Navigate to the project directory:
   ```bash
   cd fuelq
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Set up the database:
   ```bash
   npm run migrate
   ```

6. Build the project:
   ```bash
   npm run build
   ```

7. Start the server:
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

8. Visit `http://localhost:3001` in your browser.

## Server Management with PM2

The project uses PM2 for process management. Here are the available commands:

- `npm start` - Start the server in production mode
- `npm run stop` - Stop the server
- `npm run restart` - Restart the server
- `npm run delete` - Remove the server from PM2
- `npm run logs` - View server logs
- `npm run monit` - Open PM2 monitoring dashboard

## Project Pages

- **Home Page** (`index.html`): Main landing page with overview of energy solutions
- **For Engineers** (`src/pages/forengineers.html`): Technical resources and detailed information
- **Discovery** (`src/pages/discovery.html`): Interactive discovery of energy topics
- **Contacts** (`src/pages/contacts.html`): Contact information and form
- **User Cabinet** (`src/pages/cabinet.html`): User profile and settings
- **Login** (`src/pages/login.html`): User authentication
- **Register** (`src/pages/register.html`): User registration
- **Forum** (`src/pages/forum/index.html`): Community discussion platform

## Component System

The project uses a component-based architecture with reusable components:

- **Header**: Navigation and branding
- **Footer**: Site information and links
- **Forum**: Discussion platform components
- **Chat**: Real-time messaging
- **Discovery**: Interactive content discovery
- **Mobile**: Mobile-specific UI components
- **Notifications**: Alert system
- **User Profile**: User account management

Components are loaded dynamically using the component loader module, which finds all elements with `data-component` attributes and replaces them with the appropriate HTML content.

## Module System

The JavaScript is organized into a modular system with:

- **Core Modules**: Essential application functionality
  - `app.js`: Main application entry point
  - `module-loader.js`: Dynamic module loading
  - `module-registry.js`: Module registration system
  - `service-worker-manager.js`: Service worker management
  - `state-manager.js`: Application state management

- **Feature Modules**: Specific features
  - `analytics.js`: Analytics tracking
  - `animation-controller.js`: Animation management
  - `component-loader.js`: Component loading system
  - `data-visualizer.js`: Data visualization
  - `form-validator.js`: Form validation
  - `navigation-controller.js`: Navigation management
  - `notification-manager.js`: Notification system
  - `theme-manager.js`: Theme management

- **Page Controllers**: Page-specific functionality
  - `engineers-page-controller.js`: Engineers page controller
  - `home-page-controller.js`: Home page controller

- **Utility Functions**: Reusable helper functions
  - `form-validation.js`: Form validation utilities
  - `helpers.js`: General helper functions
  - `lazy-load.js`: Lazy loading utilities
  - `notification.js`: Notification utilities

Modules are loaded dynamically based on page requirements, ensuring optimal performance.

## Service Worker

The application includes a service worker (`src/sw.ts`) that provides:

- Offline functionality
- Resource caching
- Background sync
- Push notifications

The service worker is registered through the `service-worker-manager.js` module, which handles registration, updates, and provides a user-friendly update notification.

## Building and Deployment

### Build Process

The project uses TypeScript for development, which is compiled to JavaScript during the build process:

```bash
npm run build
```

This command:
1. Compiles TypeScript to JavaScript
2. Copies assets to the dist directory
3. Compiles the service worker
4. Copies other necessary files

### Deployment

For deployment to production:

1. Build the project:
   ```bash
   npm run build
   ```

2. Set up production environment variables

3. Start the server in production mode:
   ```bash
   npm start
   ```

## Troubleshooting

### Common Issues

1. **Service Worker Registration Fails**
   - Ensure the service worker file is accessible at the correct path
   - Check that the site is served over HTTPS (required for service workers)

2. **Component CSS 404 Errors**
   - Verify that the CSS files exist in the correct location
   - Check the server configuration for static file serving

3. **Module Loading Errors**
   - Ensure all required modules are properly built
   - Check the module paths in the component loader

### Debugging

To enable debug mode, set the `DEBUG` environment variable:

```bash
DEBUG=true npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## Contact

FuelQuality Team
