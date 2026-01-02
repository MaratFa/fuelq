/**
 * Forum Controller
 * Handles all functionality specific to the forum
 */

export class ForumController {
  constructor() {
    this.name = 'forum';
    this.initialized = false;
  }

  /**
   * Initialize the forum controller
   * @param {Object} config - Configuration object
   */
  init(config = {}) {
    if (this.initialized) return;

    console.log('Initializing forum controller...');

    // Initialize forum functionality
    this.initForumFilters();
    this.initPagination();
    this.initViewToggle();
    this.initSearch();
    this.initThreadCreation();

    this.initialized = true;
    console.log('Forum controller initialized');
  }

  /**
   * Initialize forum filter functionality
   */
  initForumFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Filter threads based on selected category
        const category = button.getAttribute('data-category');
        this.filterThreads(category);
      });
    });
  }

  /**
   * Initialize pagination functionality
   */
  initPagination() {
    const paginationButtons = document.querySelectorAll('.pagination-btn');

    paginationButtons.forEach(button => {
      button.addEventListener('click', () => {
        const page = button.getAttribute('data-page');
        this.loadPage(page);
      });
    });
  }

  /**
   * Initialize view toggle functionality
   */
  initViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');

    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        viewButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Toggle view based on selected view
        const view = button.getAttribute('data-view');
        this.toggleView(view);
      });
    });
  }

  /**
   * Initialize search functionality
   */
  initSearch() {
    const searchInput = document.getElementById('forum-search');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value;
        this.searchThreads(query);
      });
    }
  }

  /**
   * Initialize thread creation functionality
   */
  initThreadCreation() {
    const createButton = document.getElementById('create-thread-btn');

    if (createButton) {
      createButton.addEventListener('click', () => {
        this.openThreadModal();
      });
    }

    const threadForm = document.getElementById('thread-form');

    if (threadForm) {
      threadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createThread();
      });
    }
  }

  /**
   * Filter threads by category
   * @param {string} category - Category to filter by
   */
  filterThreads(category) {
    const threads = document.querySelectorAll('.thread-card');

    threads.forEach(thread => {
      if (category === 'all' || thread.getAttribute('data-category') === category) {
        thread.style.display = 'block';
      } else {
        thread.style.display = 'none';
      }
    });
  }

  /**
   * Load a specific page of threads
   * @param {number} page - Page number to load
   */
  loadPage(page) {
    // Implementation would depend on your data source
    console.log(`Loading page ${page}`);
  }

  /**
   * Toggle view between grid and list
   * @param {string} view - View type ('grid' or 'list')
   */
  toggleView(view) {
    const threadsContainer = document.querySelector('.threads-container');

    if (view === 'grid') {
      threadsContainer.classList.remove('list-view');
      threadsContainer.classList.add('grid-view');
    } else {
      threadsContainer.classList.remove('grid-view');
      threadsContainer.classList.add('list-view');
    }
  }

  /**
   * Search threads by query
   * @param {string} query - Search query
   */
  searchThreads(query) {
    const threads = document.querySelectorAll('.thread-card');

    threads.forEach(thread => {
      const title = thread.querySelector('.thread-title').textContent.toLowerCase();
      const content = thread.querySelector('.thread-excerpt').textContent.toLowerCase();

      if (title.includes(query.toLowerCase()) || content.includes(query.toLowerCase())) {
        thread.style.display = 'block';
      } else {
        thread.style.display = 'none';
      }
    });
  }

  /**
   * Open thread creation modal
   */
  openThreadModal() {
    const modal = document.getElementById('thread-modal');

    if (modal) {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Create a new thread
   */
  createThread() {
    const titleInput = document.getElementById('thread-title');
    const contentInput = document.getElementById('thread-content');
    const categorySelect = document.getElementById('thread-category');

    if (titleInput && contentInput && categorySelect) {
      const title = titleInput.value.trim();
      const content = contentInput.value.trim();
      const category = categorySelect.value;

      if (title && content) {
        // Implementation would depend on your data source
        console.log('Creating thread:', { title, content, category });

        // Reset form
        titleInput.value = '';
        contentInput.value = '';

        // Close modal
        this.closeThreadModal();

        // Show success message
        this.showNotification('Thread created successfully!', 'success');
      } else {
        this.showNotification('Please fill in all fields', 'error');
      }
    }
  }

  /**
   * Close thread creation modal
   */
  closeThreadModal() {
    const modal = document.getElementById('thread-modal');

    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  /**
   * Show notification message
   * @param {string} message - Message to display
   * @param {string} type - Type of notification ('success', 'error', 'info')
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Export a singleton instance
export default new ForumController();
