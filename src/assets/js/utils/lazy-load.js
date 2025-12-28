// Lazy loading utility for images

/**
 * Initialize lazy loading for all images with data-src attribute
 */
function initializeLazyLoading() {
  // Get all images with data-src attribute
  const lazyImages = document.querySelectorAll('img[data-src]');

  // If browser supports Intersection Observer, use it
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        // When image is visible
        if (entry.isIntersecting) {
          const img = entry.target;

          // Load image
          loadImage(img);

          // Stop observing this image
          observer.unobserve(img);
        }
      });
    }, {
      // Start loading when image is 200px away from being visible
      rootMargin: '200px 0px',
      // Don't trigger until at least 1px of the image is visible
      threshold: 0.01
    });

    // Observe each lazy image
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    // Just load all images immediately
    lazyImages.forEach(img => {
      loadImage(img);
    });
  }
}

/**
 * Load an image
 * @param {HTMLImageElement} img - The image element to load
 */
function loadImage(img) {
  // Get source from data-src attribute
  const src = img.getAttribute('data-src');

  if (src) {
    // Set src attribute
    img.src = src;

    // Add fade-in effect
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';

    // When image loads, fade it in
    img.onload = () => {
      img.style.opacity = '1';
    };

    // Remove data-src attribute
    img.removeAttribute('data-src');
  }
}

/**
 * Initialize lazy loading for background images
 */
function initializeLazyBackgrounds() {
  // Get all elements with data-bg attribute
  const lazyBackgrounds = document.querySelectorAll('[data-bg]');

  // If browser supports Intersection Observer, use it
  if ('IntersectionObserver' in window) {
    const backgroundObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        // When element is visible
        if (entry.isIntersecting) {
          const element = entry.target;

          // Get background from data-bg attribute
          const bg = element.getAttribute('data-bg');

          if (bg) {
            // Set background image
            element.style.backgroundImage = `url(${bg})`;

            // Remove data-bg attribute
            element.removeAttribute('data-bg');
          }

          // Stop observing this element
          observer.unobserve(element);
        }
      });
    }, {
      // Start loading when element is 200px away from being visible
      rootMargin: '200px 0px',
      // Don't trigger until at least 1px of the element is visible
      threshold: 0.01
    });

    // Observe each lazy background element
    lazyBackgrounds.forEach(element => {
      backgroundObserver.observe(element);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    // Just load all backgrounds immediately
    lazyBackgrounds.forEach(element => {
      const bg = element.getAttribute('data-bg');

      if (bg) {
        element.style.backgroundImage = `url(${bg})`;
        element.removeAttribute('data-bg');
      }
    });
  }
}

// Initialize lazy loading when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeLazyLoading();
  initializeLazyBackgrounds();
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeLazyLoading,
    initializeLazyBackgrounds,
    loadImage
  };
}
