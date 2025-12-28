/**
 * Animation Controller
 * Handles all scroll and entrance animations
 */

export class AnimationController {
  constructor() {
    this.animatedElements = [];
    this.scrollThrottle = null;
    this.resizeThrottle = null;
  }

  /**
   * Initialize the animation controller
   */
  init() {
    // Find all elements with animation classes
    this.findAnimatedElements();

    // Set up event listeners
    this.setupEventListeners();

    // Run initial check
    this.checkAnimations();
  }

  /**
   * Find all elements that should be animated
   */
  findAnimatedElements() {
    this.animatedElements = document.querySelectorAll('.animate-on-scroll');
  }

  /**
   * Set up event listeners for scroll and resize
   */
  setupEventListeners() {
    // Throttled scroll event
    window.addEventListener('scroll', () => {
      if (!this.scrollThrottle) {
        this.scrollThrottle = setTimeout(() => {
          this.checkAnimations();
          this.scrollThrottle = null;
        }, 20);
      }
    });

    // Throttled resize event
    window.addEventListener('resize', () => {
      if (!this.resizeThrottle) {
        this.resizeThrottle = setTimeout(() => {
          this.checkAnimations();
          this.resizeThrottle = null;
        }, 100);
      }
    });
  }

  /**
   * Check which elements should be animated
   */
  checkAnimations() {
    this.animatedElements.forEach(element => {
      if (this.isInViewport(element) && !element.classList.contains('animated')) {
        element.classList.add('animated');

        // Apply staggered animation for cards
        if (element.classList.contains('energy-card') || element.classList.contains('fuel-card')) {
          this.applyStaggeredAnimation(element);
        }
      }
    });
  }

  /**
   * Check if element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    return (
      rect.top <= viewportHeight * 0.8 &&
      rect.bottom >= 0
    );
  }

  /**
   * Apply staggered animation to cards
   */
  applyStaggeredAnimation(element) {
    const parent = element.parentElement;
    const cards = parent.querySelectorAll('.animate-on-scroll');

    cards.forEach((card, index) => {
      if (card.classList.contains('animated')) {
        card.style.transitionDelay = `${index * 0.1}s`;
      }
    });
  }
}
