/**
 * Navigation Controller
 * Handles mobile menu, smooth scrolling, and navigation functionality
 */

export class NavigationController {
  private menuOpen: boolean;
  private sideNav: HTMLElement | null;
  private openBtn: HTMLElement | null;
  private closeBtn: HTMLElement | null;

  constructor() {
    this.menuOpen = false;
    this.sideNav = null;
    this.openBtn = null;
    this.closeBtn = null;
  }

  /**
   * Initialize the navigation controller
   */
  init(): void {
    // Initialize mobile menu
    this.initMobileMenu();

    // Initialize smooth scrolling
    this.initSmoothScrolling();
  }

  /**
   * Initialize mobile menu functionality
   */
  initMobileMenu(): void {
    this.sideNav = document.getElementById('mySidenav');
    this.openBtn = document.getElementById('open-menu');
    this.closeBtn = document.getElementById('close-menu') ||
                   document.getElementById('close-btn');

    if (!this.sideNav || !this.openBtn) return;

    // Open side navigation
    this.openBtn.addEventListener('click', () => {
      this.openMenu();
    });

    // Close side navigation
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    // Close side navigation when clicking outside of it
    document.addEventListener('click', (event: MouseEvent) => {
      if (this.menuOpen &&
          event.target !== this.sideNav &&
          !this.sideNav!.contains(event.target as Node) &&
          event.target !== this.openBtn) {
        this.closeMenu();
      }
    });

    // Handle escape key to close menu
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.menuOpen) {
        this.closeMenu();
      }
    });
  }

  /**
   * Open the mobile menu
   */
  openMenu(): void {
    if (!this.sideNav) return;

    this.menuOpen = true;
    this.sideNav.style.width = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    document.body.style.overflow = "hidden";
  }

  /**
   * Close the mobile menu
   */
  closeMenu(): void {
    if (!this.sideNav) return;

    this.menuOpen = false;
    this.sideNav.style.width = "0";
    document.body.style.backgroundColor = "white";
    document.body.style.overflow = "auto";
  }

  /**
   * Initialize smooth scrolling for anchor links
   */
  initSmoothScrolling(): void {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (event: Event) => {
        event.preventDefault();

        const targetId = (anchor as HTMLAnchorElement).getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId!);
        if (targetElement) {
          // Calculate offset to account for fixed header
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          if (this.menuOpen) {
            this.closeMenu();
          }
        }
      });
    });
  }
}
