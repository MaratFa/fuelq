// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize slideshow
    initSlideshow();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize smooth scrolling for anchor links
    initSmoothScrolling();
});

// Slideshow functionality
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

// Mobile menu functionality
function initMobileMenu() {
    const openBtn = document.getElementById('open-menu');
    const closeBtn = document.getElementById('close-menu');
    const sidenav = document.getElementById('mySidenav');

    if (!openBtn || !closeBtn || !sidenav) return;

    // Open side navigation
    openBtn.addEventListener('click', function() {
        sidenav.style.width = "250px";
        document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    });

    // Close side navigation
    closeBtn.addEventListener('click', function() {
        sidenav.style.width = "0";
        document.body.style.backgroundColor = "white";
    });

    // Close side navigation when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target !== sidenav && !sidenav.contains(event.target) && event.target !== openBtn) {
            sidenav.style.width = "0";
            document.body.style.backgroundColor = "white";
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility function to format dates
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Analytics placeholder
function logPageView(pageName) {
    console.log(`Page view: ${pageName}`);
    // In a real implementation, this would send data to analytics service
}

// Initialize analytics for each page
logPageView(window.location.pathname);