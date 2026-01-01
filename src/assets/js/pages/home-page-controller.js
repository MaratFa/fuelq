/**
 * Home Page Controller
 * Handles all functionality specific to the home page
 */

import { getModule } from '../core/module-registry.js';

class HomePageController {
  constructor() {
    this.name = 'homePage';
    this.initialized = false;
  }

  /**
   * Initialize the home page controller
   * @param {Object} config - Configuration object
   */
  init(config = {}) {
    if (this.initialized) return;

    // Initialize home page specific features
    this.initHeroAnimations();
    this.initTabSystem();
    this.initCounters();
    this.initNewsCarousel();
    this.initViewToggle();

    this.initialized = true;
    console.log('Home page controller initialized');
  }

  /**
   * Initialize hero section animations
   */
  initHeroAnimations() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    // Add mouse move effect to hero section
    heroSection.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { offsetWidth, offsetHeight } = heroSection;

      const xPos = (clientX / offsetWidth) - 0.5;
      const yPos = (clientY / offsetHeight) - 0.5;

      const heroImage = document.querySelector('.hero-image');
      if (heroImage) {
        heroImage.style.transform = `perspective(1000px) rotateY(${xPos * 10}deg) rotateX(${-yPos * 10}deg) scale(1.05)`;
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      const heroImage = document.querySelector('.hero-image');
      if (heroImage) {
        heroImage.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
      }
    });
  }

  /**
   * Initialize the tab system for energy sources
   */
  initTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');

        // Remove active class from all buttons and panels
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => {
          panel.classList.remove('active');
          panel.style.opacity = '0';
          panel.style.transform = 'translateY(20px)';
        });

        // Add active class to clicked button
        button.classList.add('active');

        // Animate in the corresponding panel
        const activePanel = document.getElementById(tabId);
        setTimeout(() => {
          activePanel.classList.add('active');
          activePanel.style.opacity = '1';
          activePanel.style.transform = 'translateY(0)';
        }, 100);
      });
    });
  }

  /**
   * Initialize animated counters
   */
  initCounters() {
    const easeOutQuart = (t) => {
      return 1 - Math.pow(1 - t, 4);
    };

    const animateCounter = (element) => {
      const target = parseInt(element.getAttribute('data-counter'));
      const duration = 2000;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.floor(target * easedProgress);

        element.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };

      requestAnimationFrame(updateCounter);
    };

    // Initialize counters when they come into view
    const counters = document.querySelectorAll('.stat-number[data-counter]');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          animateCounter(entry.target);
          entry.target.classList.add('counted');
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  /**
   * Initialize the news carousel
   */
  initNewsCarousel() {
    // Get the animation module for carousel functionality
    const animationModule = getModule('animation');
    if (animationModule && typeof animationModule.initCarousel === 'function') {
      animationModule.initCarousel('.news-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        breakpoints: {
          768: {
            slidesPerView: 2
          },
          1024: {
            slidesPerView: 3
          }
        }
      });
    }
  }

  /**
   * Initialize the view toggle for energy cards
   */
  initViewToggle() {
    const viewToggleButtons = document.querySelectorAll('.toggle-btn');
    const energyTabs = document.querySelector('.energy-tabs');
    const energyGrid = document.querySelector('.energy-grid');

    if (!viewToggleButtons.length || !energyTabs || !energyGrid) return;

    viewToggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const viewType = button.getAttribute('data-view');

        // Remove active class from all buttons
        viewToggleButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Toggle views with animation
        if (viewType === 'tabs') {
          energyGrid.style.opacity = '0';
          energyGrid.style.transform = 'translateY(20px)';

          setTimeout(() => {
            energyGrid.style.display = 'none';
            energyTabs.style.display = 'block';

            setTimeout(() => {
              energyTabs.style.opacity = '1';
              energyTabs.style.transform = 'translateY(0)';
            }, 50);
          }, 300);
        } else {
          energyTabs.style.opacity = '0';
          energyTabs.style.transform = 'translateY(20px)';

          setTimeout(() => {
            energyTabs.style.display = 'none';
            energyGrid.style.display = 'grid';

            setTimeout(() => {
              energyGrid.style.opacity = '1';
              energyGrid.style.transform = 'translateY(0)';
            }, 50);
          }, 300);
        }
      });
    });
  }
}

// Export as singleton
export default new HomePageController();
