# FuelQuality - Pioneering the Future of Clean Energy

A comprehensive website dedicated to providing information about fuel quality and alternative energy sources. This platform serves as a resource hub for both general users and engineering professionals interested in sustainable energy solutions.

**Key Goal**: To democratize knowledge about clean energy alternatives and fuel quality standards, making it accessible to everyone from casual enthusiasts to industry professionals.

## Project Structure

```
fuelq/
├── README.md                          # Project documentation
 structure
├── IMPLEMENTATION_SUMMARY.md          # Summary of the implementation
├── .gitignore                         # Git ignore file
├── index.html                         # Homepage
├── package.json                       # Project metadata and scripts
├── scripts/                           # Build and utility scripts
│   └── migrate.js                     # Migration script
├── src/                               # Source files
│   ├── assets/                        # Static assets
│   │   ├── css/                       # Stylesheets
│   │   │   ├── main.css               # Main stylesheet
│   │   │   ├── legacy.css             # Legacy styles import
│   │   │   ├── components/            # Component-specific styles
│   │   │   │   ├── header.css
│   │   │   │   ├── footer.css
│   │   │   │   └── forum.css
│   │   │   └── pages/                 # Page-specific styles
│   │   │       ├── home.css
│   │   │       ├── engineers.css
│   │   │       └── contacts.css
│   │   ├── js/                        # JavaScript files
│   │   │   ├── main.js                # Main application logic
│   │   │   ├── legacy.js              # Legacy scripts import
│   │   │   ├── components/            # Component scripts
│   │   │   │   ├── header.js
│   │   │   │   ├── footer.js
│   │   │   │   └── forum.js
│   │   │   ├── pages/                 # Page-specific scripts
│   │   │   │   ├── home.js
│   │   │   │   ├── engineers.js
│   │   │   │   └── contacts.js
│   │   │   └── utils/                 # Utility functions
│   │   │       └── helpers.js         # Helper functions
│   │   ├── images/                    # Images organized by category
│   │   │   ├── logos/                 # Logos and icons
│   │   │   ├── energy-sources/        # Energy source images
│   │   │   └── ui/                    # UI elements
│   │   └── data/                      # Data files
│   │       └── forum-data.js          # Forum data
│   └── components/                    # HTML components
│       ├── layout/                    # Layout components
│       │   ├── header.html
│       │   └── footer.html
│       ├── features/                  # Feature components
│       └── ui/                        # UI components
└── pages/                             # HTML pages
    ├── contacts.html                  # Contact page
    ├── forengineers.html              # Technical specifications
    └── forum/                         # Forum section
        ├── index.html
        └── thread.html
```

## Features

- **Comprehensive Energy Information**: Detailed content about alternative fuel sources including hydrogen, biofuels, solar, and wind energy
- **Technical Specifications**: Specialized section for engineers with technical data, performance metrics, and implementation guidelines
- **Interactive Forum**: Community-driven discussion platform for knowledge sharing and Q&A with moderation tools
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with progressive enhancement
- **Contact System**: Direct communication channel with form validation and email integration
- **Component-Based Architecture**: Modular design for better maintainability and scalability
- **Performance Optimization**: Lazy loading, minified assets, and efficient caching strategies
- **Accessibility**: WCAG 2.1 AA compliant interface with semantic HTML and ARIA labels

## Technologies Used

- **Frontend**: HTML5, CSS3 with custom properties, Vanilla JavaScript (ES6+)
- **Build Tools**: Vite for fast development and optimized production builds
- **Data Storage**: LocalStorage for forum data persistence with IndexedDB fallback
- **Icons**: Font Awesome 6 for consistent iconography
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Component Architecture**: Modular HTML, CSS, and JavaScript components for maintainability
- **Component Loading System**: Dynamic loading of reusable HTML components with error handling
- **ES6 Modules**: Modern JavaScript module system with tree-shaking
- **Performance**: Service Worker for offline functionality and resource caching

## Demo

A live demo of the website is available at: https://fuelq.vercel.app

[![FuelQuality Demo](https://img.shields.io/badge/demo-live-green.svg)](https://fuelq.vercel.app)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE (VS Code, Sublime Text, etc.)

### Installation

1. Clone or download this repository:

```bash
git clone https://github.com/MaratFa/fuelq.git
cd fuelq
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser and navigate to http://localhost:8080

## Component Architecture

The website uses a component-based architecture that separates concerns and improves maintainability:

- **Layout Components**: Header, footer, and navigation elements
- **Feature Components**: Reusable UI elements for specific features
- **Page Components**: Page-specific functionality
- **Utility Functions**: Common helper functions used across the application

## Development Workflow

1. Make changes to components or pages
2. Test locally using the development server
3. Run linting and formatting:

```bash
npm run lint
npm run format
```

4. Commit changes with descriptive messages
5. Deploy to production

## Roadmap

### Completed
- [x] Component-based architecture
- [x] Responsive design implementation
- [x] Forum functionality with LocalStorage
- [x] Contact form with validation
- [x] Performance optimization

### In Progress
- [ ] Advanced search functionality with filters
- [ ] Energy calculator tools

### Planned
- [ ] User authentication system with OAuth providers
- [ ] Interactive data visualizations using D3.js
- [ ] Multi-language support (i18n)
- [ ] REST API for third-party integrations
- [ ] Backend implementation with Node.js/Express
- [ ] Mobile app development (React Native)

## Browser Compatibility

This website is tested and compatible with the following browsers:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Browser Support Policy
- We support the latest 2 versions of major browsers
- Legacy browsers receive a graceful degradation experience
- Progressive enhancement ensures core functionality works across all browsers




### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow the established code style guidelines
- Use ESLint for JavaScript code consistency
- Use Prettier for code formatting

### Issue Reporting
- Use the issue tracker to report bugs or request features
- Provide detailed information about the issue
- Include screenshots if applicable

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped make this project better
- Special thanks to the energy community for providing valuable insights and data
- Icons provided by [Font Awesome](https://fontawesome.com/)
