/**
 * Home page controller
 * Handles functionality specific to the home page
 */

/**
 * Initialize the home page
 * @param {Object} modules - The application modules
 */
export function initHomePage(modules) {
  // Initialize slideshow
  initSlideshow();

  // Set up tracking for energy cards
  trackEnergyCards(modules.analytics);
}

/**
 * Initialize the slideshow
 */
function initSlideshow() {
  const slides = document.getElementsByClassName("mySlides");
  if (slides.length === 0) return;

  let slideIndex = 0;

  function showSlides() {
    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }

    // Increment index and reset if needed
    slideIndex++;
    if (slideIndex > slides.length) {
      slideIndex = 1;
    }

    // Show current slide
    slides[slideIndex - 1].style.display = "block";

    // Change slide every 3 seconds
    setTimeout(showSlides, 3000);
  }

  // Start the slideshow
  showSlides();
}

/**
 * Set up tracking for energy cards
 * @param {Analytics} analytics - The analytics module
 */
function trackEnergyCards(analytics) {
  const energyCards = document.querySelectorAll('.energy-card');

  energyCards.forEach(card => {
    const cardLink = card.querySelector('.card-link');

    if (cardLink) {
      cardLink.addEventListener('click', () => {
        const cardTitle = card.querySelector('h3').textContent;
        analytics.trackEvent('energy_card_clicked', {
          card_title: cardTitle
        });
      });
    }
  });
}
