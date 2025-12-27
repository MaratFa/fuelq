// Forum component JavaScript

// Function to initialize forum component
function initForum() {
  // Check if we are on the forum index page
  if (window.location.pathname.includes('forum/index.html')) {
    initForumIndex();
  }
  
  // Check if we are on a thread detail page
  if (window.location.pathname.includes('forum/thread.html')) {
    initThreadDetail();
  }
}

// Initialize forum index page
function initForumIndex() {
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

  // Handle thread creation modal
  const newThreadBtn = document.getElementById('new-thread-btn');
  const newThreadModal = document.getElementById('new-thread-modal');
  const closeModal = document.querySelector('.close');
  const cancelThread = document.getElementById('cancel-thread');
  const createThread = document.getElementById('create-thread');
  
  if (newThreadBtn && newThreadModal) {
    newThreadBtn.addEventListener('click', () => {
      newThreadModal.style.display = 'block';
    });
    
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        newThreadModal.style.display = 'none';
      });
    }
    
    if (cancelThread) {
      cancelThread.addEventListener('click', () => {
        newThreadModal.style.display = 'none';
      });
    }
    
    if (createThread) {
      createThread.addEventListener('click', () => {
        // Get form data
        const title = document.getElementById('thread-title').value;
        const content = document.getElementById('thread-content').value;
        const author = document.getElementById('thread-author').value;
        const category = document.getElementById('thread-category') ? 
          document.getElementById('thread-category').value : 'general';
        
        if (title && content && author) {
          // Create new thread object
          const newThread = {
            id: threads.length > 0 ? Math.max(...threads.map(t => t.id)) + 1 : 1,
            title,
            author,
            content,
            category,
            date: Date.now(),
            views: 0,
            comments: []
          };
          
          // Add to threads array
          threads.unshift(newThread);
          
          // Save to localStorage
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("threads", JSON.stringify(threads));
          }
          
          // Close modal
          newThreadModal.style.display = 'none';
          
          // Reset form
          document.getElementById('thread-title').value = '';
          document.getElementById('thread-content').value = '';
          document.getElementById('thread-author').value = '';
          
          // Refresh thread display
          if (typeof renderThreads === 'function') {
            renderThreads();
          }
          
          // Show success message
          const successMessage = document.createElement('div');
          successMessage.className = 'alert alert-success';
          successMessage.textContent = 'Thread created successfully!';
          successMessage.style.position = 'fixed';
          successMessage.style.top = '20px';
          successMessage.style.right = '20px';
          successMessage.style.zIndex = '1000';
          successMessage.style.padding = '15px';
          successMessage.style.backgroundColor = '#4CAF50';
          successMessage.style.color = 'white';
          successMessage.style.borderRadius = '5px';
          successMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
          
          document.body.appendChild(successMessage);
          
          // Remove success message after 3 seconds
          setTimeout(() => {
            successMessage.remove();
          }, 3000);
        } else {
          // Show error message
          const errorMessage = document.createElement('div');
          errorMessage.className = 'alert alert-error';
          errorMessage.textContent = 'Please fill in all fields';
          errorMessage.style.position = 'fixed';
          errorMessage.style.top = '20px';
          errorMessage.style.right = '20px';
          errorMessage.style.zIndex = '1000';
          errorMessage.style.padding = '15px';
          errorMessage.style.backgroundColor = '#f44336';
          errorMessage.style.color = 'white';
          errorMessage.style.borderRadius = '5px';
          errorMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
          
          document.body.appendChild(errorMessage);
          
          // Remove error message after 3 seconds
          setTimeout(() => {
            errorMessage.remove();
          }, 3000);
        }
      });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === newThreadModal) {
        newThreadModal.style.display = 'none';
      }
    });
  }
}

// Initialize thread detail page
function initThreadDetail() {
  // Handle thread reply form
  const replyForm = document.getElementById('reply-form');

  if (replyForm) {
    replyForm.addEventListener('submit', (event) => {
      event.preventDefault();

      // Get form data
      const content = document.getElementById('reply-content').value;
      const author = document.getElementById('reply-author').value;

      if (content && author) {
        // Create new reply object
        const newReply = {
          author,
          content,
          date: Date.now()
        };

        // Get thread ID from URL or from the page
        const threadId = new URLSearchParams(window.location.search).get('id');
        
        // Find the thread
        const thread = threads.find(t => t.id == threadId);
        
        if (thread) {
          // Add reply to thread
          thread.comments.push(newReply);
          
          // Save to localStorage
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("threads", JSON.stringify(threads));
          }
          
          // Create new reply element
          const repliesContainer = document.querySelector('.replies-container');

          if (repliesContainer) {
            const newReplyElement = document.createElement('div');
            newReplyElement.className = 'reply';

            newReplyElement.innerHTML = `
              <div class="reply-header">
                <div class="reply-author">${author}</div>
                <div class="reply-date">${formatDate(newReply.date)}</div>
              </div>
              <div class="reply-content">${content}</div>
            `;

            // Add new reply to container
            repliesContainer.appendChild(newReplyElement);

            // Reset form
            replyForm.reset();

            // Scroll to new reply
            newReplyElement.scrollIntoView({ behavior: 'smooth' });
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.textContent = 'Reply posted successfully!';
            successMessage.style.position = 'fixed';
            successMessage.style.top = '20px';
            successMessage.style.right = '20px';
            successMessage.style.zIndex = '1000';
            successMessage.style.padding = '15px';
            successMessage.style.backgroundColor = '#4CAF50';
            successMessage.style.color = 'white';
            successMessage.style.borderRadius = '5px';
            successMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            
            document.body.appendChild(successMessage);
            
            // Remove success message after 3 seconds
            setTimeout(() => {
              successMessage.remove();
            }, 3000);
          }
        }
      } else {
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-error';
        errorMessage.textContent = 'Please fill in all fields';
        errorMessage.style.position = 'fixed';
        errorMessage.style.top = '20px';
        errorMessage.style.right = '20px';
        errorMessage.style.zIndex = '1000';
        errorMessage.style.padding = '15px';
        errorMessage.style.backgroundColor = '#f44336';
        errorMessage.style.color = 'white';
        errorMessage.style.borderRadius = '5px';
        errorMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        
        document.body.appendChild(errorMessage);
        
        // Remove error message after 3 seconds
        setTimeout(() => {
          errorMessage.remove();
        }, 3000);
      }
    });
  }
}

// Utility function to format dates
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Initialize forum when DOM is loaded
document.addEventListener('DOMContentLoaded', initForum);