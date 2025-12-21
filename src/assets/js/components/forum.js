// Forum component JavaScript

// Function to initialize forum component
function initForum() {
  // Get all thread cards
  const threadCards = document.querySelectorAll('.thread-card');
  
  // Add click event to thread cards
  threadCards.forEach(card => {
    card.addEventListener('click', (event) => {
      // Check if clicked on a link
      if (!event.target.closest('a')) {
        // Find the thread title link
        const threadLink = card.querySelector('.thread-title');
        if (threadLink) {
          // Navigate to thread
          window.location.href = threadLink.getAttribute('href');
        }
      }
    });
  });
  
  // Handle pagination
  const paginationButtons = document.querySelectorAll('.pagination-button');
  
  paginationButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      paginationButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // In a real application, this would load the appropriate page
      const pageNumber = button.textContent;
      console.log(`Loading page ${pageNumber}`);
      
      // For demo purposes, just scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
  
  // Handle thread creation form (if present)
  const createThreadForm = document.getElementById('create-thread-form');
  
  if (createThreadForm) {
    createThreadForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      // Get form data
      const title = document.getElementById('thread-title').value;
      const content = document.getElementById('thread-content').value;
      const category = document.getElementById('thread-category').value;
      
      // In a real application, this would send data to server
      console.log('Creating thread:', { title, content, category });
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'alert alert-success';
      successMessage.textContent = 'Thread created successfully!';
      
      // Insert success message before form
      createThreadForm.parentNode.insertBefore(successMessage, createThreadForm);
      
      // Reset form
      createThreadForm.reset();
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    });
  }
  
  // Handle thread reply form (if present)
  const replyForm = document.getElementById('reply-form');
  
  if (replyForm) {
    replyForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      // Get form data
      const content = document.getElementById('reply-content').value;
      
      // In a real application, this would send data to server
      console.log('Posting reply:', { content });
      
      // Create new reply element
      const repliesContainer = document.querySelector('.replies-container');
      
      if (repliesContainer) {
        const newReply = document.createElement('div');
        newReply.className = 'reply';
        
        // In a real app, this would use actual user data
        newReply.innerHTML = `
          <div class="reply-header">
            <div class="reply-author">You</div>
            <div class="reply-date">Just now</div>
          </div>
          <div class="reply-content">${content}</div>
        `;
        
        // Add new reply to container
        repliesContainer.appendChild(newReply);
        
        // Reset form
        replyForm.reset();
        
        // Scroll to new reply
        newReply.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Initialize forum when DOM is loaded
document.addEventListener('DOMContentLoaded', initForum);
