// Contacts page specific JavaScript

// Function to initialize contacts page
function initContactsPage() {
  // Handle contact form submission
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const formValues = Object.fromEntries(formData);
      
      // In a real application, this would send data to server
      console.log('Contact form submitted:', formValues);
      
      // Show success message
      showNotification('Your message has been sent successfully! We'll get back to you soon.', 'success');
      
      // Reset form
      contactForm.reset();
    });
  }
  
  // Handle form field validation
  const requiredFields = document.querySelectorAll('.form-group[required] input, .form-group[required] textarea, .form-group[required] select');
  
  requiredFields.forEach(field => {
    // Add validation on blur
    field.addEventListener('blur', () => {
      validateField(field);
    });
    
    // Remove error on input
    field.addEventListener('input', () => {
      removeFieldError(field);
    });
  });
  
  // Handle email field validation
  const emailField = document.getElementById('email');
  
  if (emailField) {
    emailField.addEventListener('blur', () => {
      const email = emailField.value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (email && !emailRegex.test(email)) {
        showFieldError(emailField, 'Please enter a valid email address');
      }
    });
  }
  
  // Handle phone field validation
  const phoneField = document.getElementById('phone');
  
  if (phoneField) {
    phoneField.addEventListener('blur', () => {
      const phone = phoneField.value;
      const phoneRegex = /^[\d\s\-\(\)]+$/;
      
      if (phone && !phoneRegex.test(phone)) {
        showFieldError(phoneField, 'Please enter a valid phone number');
      }
    });
  }
  
  // Initialize map (placeholder)
  const mapContainer = document.getElementById('map-container');
  
  if (mapContainer) {
    // In a real application, this would initialize a map library
    // For now, just show a placeholder message
    const mapPlaceholder = document.createElement('div');
    mapPlaceholder.className = 'map-placeholder';
    mapPlaceholder.innerHTML = `
      <div>
        <i class="fas fa-map-marked-alt fa-3x"></i>
        <p>Interactive map would be loaded here</p>
      </div>
    `;
    
    mapContainer.appendChild(mapPlaceholder);
  }
  
  // Handle copy to clipboard for contact details
  const copyButtons = document.querySelectorAll('.copy-contact');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get text to copy
      const textToCopy = button.getAttribute('data-copy-text');
      
      // Copy to clipboard
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          // Show success message
          showNotification('Copied to clipboard!', 'success');
        })
        .catch(err => {
          // Show error message
          showNotification('Failed to copy to clipboard', 'error');
          console.error('Could not copy text: ', err);
        });
    });
  });
  
  // Handle location links
  const locationLinks = document.querySelectorAll('.location-link');
  
  locationLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      // Get location data
      const address = link.getAttribute('data-address');
      
      if (address) {
        // In a real application, this might open in a map application
        console.log(`Opening location: ${address}`);
        
        // For demo purposes, just show a notification
        showNotification(`Opening map for: ${address}`, 'info');
      }
    });
  });
}

// Function to validate a form field
function validateField(field) {
  const value = field.value.trim();
  
  // Check if field is required but empty
  if (field.hasAttribute('required') && !value) {
    showFieldError(field, 'This field is required');
    return false;
  }
  
  // Check for minimum length if specified
  const minLength = field.getAttribute('minlength');
  
  if (minLength && value.length < parseInt(minLength)) {
    showFieldError(field, `Minimum length is ${minLength} characters`);
    return false;
  }
  
  // Field is valid
  return true;
}

// Function to show field error
function showFieldError(field, message) {
  // Remove any existing error
  removeFieldError(field);
  
  // Add error class to field
  field.classList.add('error');
  
  // Create error message element
  const errorMessage = document.createElement('div');
  errorMessage.className = 'field-error';
  errorMessage.textContent = message;
  
  // Insert error message after field
  field.parentNode.insertBefore(errorMessage, field.nextSibling);
}

// Function to remove field error
function removeFieldError(field) {
  // Remove error class from field
  field.classList.remove('error');
  
  // Remove error message if it exists
  const errorMessage = field.parentNode.querySelector('.field-error');
  
  if (errorMessage) {
    errorMessage.remove();
  }
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

// Initialize contacts page when DOM is loaded
document.addEventListener('DOMContentLoaded', initContactsPage);
