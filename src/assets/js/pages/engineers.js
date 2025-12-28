/**
 * Engineers page controller
 * Handles functionality specific to the engineers page
 */

/**
 * Initialize the engineers page
 * @param {Object} modules - The application modules
 */
export function initEngineersPage(modules) {
  // Handle tab functionality for technical sections
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get target tab ID
      const targetTabId = button.getAttribute('data-tab');
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
  
  // Handle accordion functionality for specifications
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      // Get parent accordion item
      const accordionItem = header.parentElement;
      
      // Toggle active class on accordion item
      accordionItem.classList.toggle('active');
      
      // Get accordion content
      const accordionContent = accordionItem.querySelector('.accordion-content');
      
      if (accordionContent) {
        // Toggle max-height for smooth animation
        if (accordionItem.classList.contains('active')) {
          accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
        } else {
          accordionContent.style.maxHeight = '0';
        }
      }
    });
  });
  
  // Initialize accordions with closed state
  accordionHeaders.forEach(header => {
    const accordionItem = header.parentElement;
    const accordionContent = accordionItem.querySelector('.accordion-content');
    
    if (accordionContent && !accordionItem.classList.contains('active')) {
      accordionContent.style.maxHeight = '0';
    }
  });
  
  // Handle resource download links
  const downloadLinks = document.querySelectorAll('.resource-download');
  
  downloadLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      // Get resource type and name
      const resourceType = link.getAttribute('data-resource-type');
      const resourceName = link.getAttribute('data-resource-name');
      
      // In a real application, this would initiate a download
      console.log(`Downloading ${resourceType}: ${resourceName}`);
      
      // Show download started message
      modules.notifications.showNotification(`Download started: ${resourceName}`, 'info');
    });
  });
  
  // Handle resource favorite links
  const favoriteLinks = document.querySelectorAll('.resource-favorite');
  
  favoriteLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      
      // Toggle favorite state
      link.classList.toggle('active');
      
      // Get resource name
      const resourceName = link.getAttribute('data-resource-name');
      
      // Show appropriate message
      if (link.classList.contains('active')) {
        modules.notifications.showNotification(`Added to favorites: ${resourceName}`, 'success');
      } else {
        modules.notifications.showNotification(`Removed from favorites: ${resourceName}`, 'info');
      }
    });
  });
  
  // Handle search functionality
  const searchInput = document.getElementById('resource-search');
  
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      const searchTerm = event.target.value.toLowerCase();
      const resourceCards = document.querySelectorAll('.resource-card');
      
      resourceCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        // Check if card matches search term
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
  
  // Handle filter functionality
  const filterButtons = document.querySelectorAll('.filter-button');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get filter value
      const filterValue = button.getAttribute('data-filter');
      
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Filter resource cards
      const resourceCards = document.querySelectorAll('.resource-card');
      
      resourceCards.forEach(card => {
        if (filterValue === 'all') {
          card.style.display = '';
        } else {
          const cardCategories = card.getAttribute('data-categories').split(' ');
          
          if (cardCategories.includes(filterValue)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        }
      });
    });
  });
}

// Function to show a notification message
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Hide and remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    
    // Remove after animation completes
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Initialize engineers page when DOM is loaded
document.addEventListener('DOMContentLoaded', initEngineersPage);
