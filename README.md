# FuelQ Website

A website dedicated to providing information about fuel quality and alternative energy sources.

## Project Overview

FuelQ is a comprehensive web platform focused on clean energy innovation, providing information about alternative fuel technologies including hydrogen energy systems, advanced biofuels, and integrated renewable systems.

## Project Structure

```
fuelq/
├── index.html              # Main landing page
├── package.json            # Project metadata and dependencies
└── src/
    ├── assets/
    │   ├── css/            # Stylesheets
    │   │   ├── pages/      # Page-specific styles
    │   │   └── styles.css  # Main stylesheet
    │   ├── data/           # Data files (e.g., forum data)
    │   ├── images/         # Image assets
    │   └── js/             # JavaScript files
    │       ├── pages/      # Page-specific scripts
    │       ├── utils/      # Utility functions
    │       ├── components.js
    │       └── main.js
    ├── components/         # Reusable UI components
    │   ├── footer/
    │   ├── forum/
    │   └── header/
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

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome for icons

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

3. Open `index.html` in your web browser or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Node.js with http-server
   npx http-server
   ```

4. Visit `http://localhost:8000` in your browser.

## Project Pages

- **Home Page** (`index.html`): Main landing page with overview of energy solutions
- **For Engineers** (`src/pages/forengineers.html`): Technical resources and detailed information
- **Contacts** (`src/pages/contacts.html`): Contact information and form
- **Forum** (`src/pages/forum/index.html`): Community discussion platform

## Components

The project uses a component-based architecture with reusable components:

- **Header**: Navigation and branding
- **Footer**: Site information and links
- **Forum**: Discussion platform components

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

FuelQuality Team
Repository: https://github.com/maratfa/fuelq.git
