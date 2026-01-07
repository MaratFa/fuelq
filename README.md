# FuelQ Website

A modern, responsive website dedicated to providing information about fuel quality and alternative energy sources.

## Project Overview

FuelQ is a comprehensive web platform focused on clean energy innovation, providing information about alternative fuel technologies including hydrogen energy systems, advanced biofuels, and integrated renewable systems. The site features a component-based architecture with a modular JavaScript system for maintainability and scalability.

## Project Structure

```
fuelq/
├── index.html              # Main landing page
├── README.md               # This file
├── htaccess                # Apache server configuration
├── init-header.js          # Component initialization script
├── src/sw.js              # Service worker for offline support
└── src/
    ├── assets/
    │   ├── css/            # Stylesheets
    │   │   ├── components/  # Component-specific styles
    │   │   ├── forengineers-fixed.css  # Engineers page styles
    │   │   ├── form-validation.css  # Form validation styles
    │   │   ├── home-interactive.css  # Home page styles
    │   │   ├── styles.css     # Main stylesheet
    │   │   └── thread.css     # Forum thread styles
    │   ├── data/           # Data files
    │   │   └── forum-data.js  # Forum data
    │   ├── images/         # Image assets
    │   └── js/             # JavaScript files
    │       ├── core/         # Core modules
    │       │   ├── app.js  # Main application entry point
    │       │   ├── module-loader.js  # Dynamic module loading
    │       │   ├── module-registry.js  # Module registration system
    │       │   ├── service-worker-manager.js  # Service worker management
    │       │   └── state-manager.js  # Application state management
    │       ├── modules/       # Feature modules
    │       │   ├── analytics.js  # Analytics tracking
    │       │   ├── animation-controller.js  # Animation management
    │       │   ├── component-loader.js  # Component loading system
    │       │   ├── data-visualizer.js  # Data visualization
    │       │   ├── form-validator.js  # Form validation
    │       │   ├── navigation-controller.js  # Navigation management
    │       │   ├── notification-manager.js  # Notification system
    │       │   └── theme-manager.js  # Theme management
    │       ├── pages/         # Page-specific controllers
    │       │   ├── engineers-page-controller.js  # Engineers page controller
    │       │   └── home-page-controller.js  # Home page controller
    │       └── utils/         # Utility functions
    │           ├── form-validation.js  # Form validation utilities
    │           ├── helpers.js  # Helper functions
    │           ├── lazy-load.js  # Lazy loading utilities
    │           └── notification.js  # Notification utilities
    ├── components/         # Reusable UI components
    │   ├── footer/
    │   │   ├── footer.css
    │   │   ├── footer.html
    │   │   └── footer.js
    │   ├── forum/
    │   │   ├── forum.css
    │   │   └── forum.js
    │   └── header/
    │       ├── header.css
    │       ├── header.html
    │       └── header.js
    └── pages/             # HTML pages
        ├── contacts.html
        ├── forengineers.html
        └── forum/
            ├── index.html
            └── thread.html
```

## Features

- Information about alternative energy sources
- Technical resources for engineers
- Community forum for discussions
- Responsive design
- Component-based architecture
- Service worker for offline support
- Dynamic module loading system
- Theme management
- Form validation
- Notification system
- Data visualization

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome for icons
- Service Workers API
- Modern JavaScript module system

## Getting Started

To view the website locally:

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

4. Start the server using PM2:
   ```bash
   npm start
   ```

5. For development, you can use:
   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000` in your browser.

### Server Management with PM2

The project uses PM2 for process management. Here are the available commands:

- `npm start` - Start the server in production mode
- `npm run stop` - Stop the server
- `npm run restart` - Restart the server
- `npm run delete` - Remove the server from PM2
- `npm run logs` - View server logs
- `npm run monit` - Open PM2 monitoring dashboard

## Project Changes

The project has been updated to use PM2 for server management, replacing the previous custom scripts:

- Removed: `start-server.js` - Custom server startup script
- Removed: `watchdog.sh` - Bash script for server monitoring
- Added: PM2 configuration in `ecosystem.config.js`
- Added: PM2 as a dev dependency

## Project Pages

- **Home Page** (`index.html`): Main landing page with overview of energy solutions
- **For Engineers** (`src/pages/forengineers.html`): Technical resources and detailed information
- **Contacts** (`src/pages/contacts.html`): Contact information and form
- **Forum** (`src/pages/forum/index.html`): Community discussion platform

## Component System

The project uses a component-based architecture with reusable components:

- **Header**: Navigation and branding
- **Footer**: Site information and links
- **Forum**: Discussion platform components

Components are loaded dynamically using the component loader module, which finds all elements with `data-component` attributes and replaces them with the appropriate HTML content.

## Module System

The JavaScript is organized into a modular system with:

- **Core Modules**: Essential application functionality
- **Feature Modules**: Specific features like analytics, animations, etc.
- **Page Controllers**: Page-specific functionality
- **Utility Functions**: Reusable helper functions

Modules are loaded dynamically based on page requirements, ensuring optimal performance.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Contact

FuelQuality Team
