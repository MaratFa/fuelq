/**
 * Animation Controller
 * Handles all scroll and entrance animations
 */

export class AnimationController {
  private animatedElements: NodeListOf<Element>;
  private scrollThrottle: number | null;
  private resizeThrottle: number | null;

  constructor() {
    this.animatedElements = [] as unknown as NodeListOf<Element>;
    this.scrollThrottle = null;
    this.resizeThrottle = null;
  }

  /**
   * Initialize the animation controller
   */
  init(): void {
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
  findAnimatedElements(): void {
    this.animatedElements = document.querySelectorAll('.animate-on-scroll');
  }

  /**
   * Set up event listeners for scroll and resize
   */
  setupEventListeners(): void {
    // Throttled scroll event
    window.addEventListener('scroll', () => {
      if (!this.scrollThrottle) {
        this.scrollThrottle = window.setTimeout(() => {
          this.checkAnimations();
          this.scrollThrottle = null;
        }, 20);
      }
    });

    // Throttled resize event
    window.addEventListener('resize', () => {
      if (!this.resizeThrottle) {
        this.resizeThrottle = window.setTimeout(() => {
          this.checkAnimations();
          this.resizeThrottle = null;
        }, 100);
      }
    });
  }

  /**
   * Check which elements should be animated
   */
  checkAnimations(): void {
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
  isInViewport(element: Element): boolean {
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
  applyStaggeredAnimation(element: Element): void {
    const parent = element.parentElement;
    if (!parent) return;

    const cards = parent.querySelectorAll('.animate-on-scroll');

    cards.forEach((card, index) => {
      if (card.classList.contains('animated')) {
        (card as HTMLElement).style.transitionDelay = `${index * 0.1}s`;
      }
    });
  }
}