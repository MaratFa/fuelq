/**
 * Forum Controller
 * Handles all functionality specific to the forum
 */

interface ForumConfig {
  [key: string]: any;
}

export class ForumController {
  private name: string;
  private initialized: boolean;

  constructor() {
    this.name = 'forum';
    this.initialized = false;
  }

  /**
   * Initialize the forum controller
   * @param config - Configuration object
   */
  init(config: ForumConfig = {}): void {
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
  initForumFilters(): void {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Filter threads based on selected category
        const category = button.getAttribute('data-category') || 'all';
        this.filterThreads(category);
      });
    });
  }

  /**
   * Initialize pagination functionality
   */
  initPagination(): void {
    const paginationButtons = document.querySelectorAll('.pagination-btn');

    paginationButtons.forEach(button => {
      button.addEventListener('click', () => {
        const page = button.getAttribute('data-page') || '1';
        this.loadPage(page);
      });
    });
  }

  /**
   * Initialize view toggle functionality
   */
  initViewToggle(): void {
    const viewButtons = document.querySelectorAll('.view-btn');

    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        viewButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Toggle view based on selected view
        const view = button.getAttribute('data-view') || 'grid';
        this.toggleView(view);
      });
    });
  }

  /**
   * Initialize search functionality
   */
  initSearch(): void {
    const searchInput = document.getElementById('forum-search') as HTMLInputElement;

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
  initThreadCreation(): void {
    const createButton = document.getElementById('create-thread-btn') as HTMLButtonElement;

    if (createButton) {
      createButton.addEventListener('click', () => {
        this.openThreadModal();
      });
    }

    const threadForm = document.getElementById('thread-form') as HTMLFormElement;

    if (threadForm) {
      threadForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        this.createThread();
      });
    }
  }

  /**
   * Filter threads by category
   * @param category - Category to filter by
   */
  filterThreads(category: string): void {
    const threads = document.querySelectorAll('.thread-card');

    threads.forEach(thread => {
      if (category === 'all' || thread.getAttribute('data-category') === category) {
        (thread as HTMLElement).style.display = 'block';
      } else {
        (thread as HTMLElement).style.display = 'none';
      }
    });
  }

  /**
   * Load a specific page of threads
   * @param page - Page number to load
   */
  loadPage(page: string): void {
    // Implementation would depend on your data source
    console.log(`Loading page ${page}`);
  }

  /**
   * Toggle view between grid and list
   * @param view - View type ('grid' or 'list')
   */
  toggleView(view: string): void {
    const threadsContainer = document.querySelector('.threads-container');

    if (threadsContainer) {
      if (view === 'grid') {
        threadsContainer.classList.remove('list-view');
        threadsContainer.classList.add('grid-view');
      } else {
        threadsContainer.classList.remove('grid-view');
        threadsContainer.classList.add('list-view');
      }
    }
  }

  /**
   * Search threads by query
   * @param query - Search query
   */
  searchThreads(query: string): void {
    const threads = document.querySelectorAll('.thread-card');

    threads.forEach(thread => {
      const titleElement = thread.querySelector('.thread-title');
      const contentElement = thread.querySelector('.thread-excerpt');

      if (!titleElement || !contentElement) return;

      const title = titleElement.textContent?.toLowerCase() || '';
      const content = contentElement.textContent?.toLowerCase() || '';

      if (title.includes(query.toLowerCase()) || content.includes(query.toLowerCase())) {
        (thread as HTMLElement).style.display = 'block';
      } else {
        (thread as HTMLElement).style.display = 'none';
      }
    });
  }

  /**
   * Open thread creation modal
   */
  openThreadModal(): void {
    const modal = document.getElementById('thread-modal') as HTMLElement;

    if (modal) {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Create a new thread
   */
  createThread(): void {
    const titleInput = document.getElementById('thread-title') as HTMLInputElement;
    const contentInput = document.getElementById('thread-content') as HTMLTextAreaElement;
    const categorySelect = document.getElementById('thread-category') as HTMLSelectElement;

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
  closeThreadModal(): void {
    const modal = document.getElementById('thread-modal') as HTMLElement;

    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  /**
   * Show notification message
   * @param message - Message to display
   * @param type - Type of notification ('success', 'error', 'info')
   */
  showNotification(message: string, type: string = 'info'): void {
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
