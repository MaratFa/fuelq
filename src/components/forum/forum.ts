
// Forum functionality in TypeScript

// Type definitions for forum functionality
export interface Thread {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  date: Date;
  comments: Comment[];
  views: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: Date;
}

// Global variables
export let forumCurrentPage: number = 1;
export const threadsPerPage: number = 10;
export let forumFilteredThreads: Thread[] = [];
export let currentView: string = "grid";
export let forumThreads: Thread[] = [];

// Initialize forum when DOM is loaded
document.addEventListener("DOMContentLoaded", async function (): Promise<void> {
  // Show loading state
  const loadingIndicator: HTMLElement = document.createElement("div");
  loadingIndicator.className = "loading-indicator";
  loadingIndicator.innerHTML = `<div class="spinner"></div><p>Loading forum forumThreads...</p>`;
  const forumContainer: Element | null = document.querySelector(".forum-container");
  if (forumContainer) {
    forumContainer.appendChild(loadingIndicator);
  }

  try {
    // Fetch forumThreads from API
    await fetchThreads();
    forumFilteredThreads = [...forumThreads];
  } catch (error) {
    console.error("Failed to load forum forumThreads:", error);
    // Show error message
    const errorMessage: HTMLElement = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.innerHTML = `<p>Failed to load forum forumThreads. Please try again later.</p>`;
    if (forumContainer) {
      forumContainer.appendChild(errorMessage);
    }
  } finally {
    // Remove loading indicator
    if (loadingIndicator && loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  }

  // Initialize forum
  initializeForum();

  // Event listeners
  const newThreadBtn: HTMLElement | null = document.getElementById("new-thread-btn");
  if (newThreadBtn) {
    newThreadBtn.addEventListener("click", function (): void {
      const modal: HTMLElement | null = document.getElementById("new-thread-modal");
      if (modal) {
        modal.style.display = "block";
      }
    });
  }

  const closeBtn: HTMLElement | null = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function (): void {
      const modal: HTMLElement | null = document.getElementById("new-thread-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  }

  const cancelThreadBtn: HTMLElement | null = document.getElementById("cancel-thread");
  if (cancelThreadBtn) {
    cancelThreadBtn.addEventListener("click", function (): void {
      const modal: HTMLElement | null = document.getElementById("new-thread-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  }

  const createThreadBtn: HTMLElement | null = document.getElementById("create-thread");
  if (createThreadBtn) {
    createThreadBtn.addEventListener("click", function (): void {
      createNewThread();
    });
  }

  // Initialize forum
  function initializeForum(): void {
    // Set up view toggles
    const gridViewBtn: HTMLElement | null = document.getElementById("grid-view");
    if (gridViewBtn) {
      gridViewBtn.addEventListener("click", function (): void {
        setView("grid");
      });
    }

    const listViewBtn: HTMLElement | null = document.getElementById("list-view");
    if (listViewBtn) {
      listViewBtn.addEventListener("click", function (): void {
        setView("list");
      });
    }

    // Set up search
    const searchBtn: HTMLElement | null = document.getElementById("search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", handleSearch);
    }
    const searchInput: HTMLInputElement | null = document.getElementById("search-input") as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener("keyup", function (e: KeyboardEvent): void {
        if (e.key === "Enter") handleSearch();
      });
    }

    // Set up category filter
    const categoryFilter: HTMLSelectElement | null = document.getElementById("category-filter") as HTMLSelectElement;
    if (categoryFilter) {
      categoryFilter.addEventListener("change", handleCategoryFilter);
    }

    // Set up pagination
    const prevPageBtn: HTMLElement | null = document.getElementById("prev-page");
    if (prevPageBtn) {
      prevPageBtn.addEventListener("click", function (): void {
        changePage(-1);
      });
    }

    const nextPageBtn: HTMLElement | null = document.getElementById("next-page");
    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", function (): void {
        changePage(1);
      });
    }
  }

  // Create new thread
  async function createNewThread(): Promise<void> {
    const titleInput: HTMLInputElement | null = document.getElementById("thread-title") as HTMLInputElement;
    const contentInput: HTMLTextAreaElement | null = document.getElementById("thread-content") as HTMLTextAreaElement;
    const authorInput: HTMLInputElement | null = document.getElementById("thread-author") as HTMLInputElement;
    const categorySelect: HTMLSelectElement | null = document.getElementById("thread-category") as HTMLSelectElement;

    const title: string = titleInput ? titleInput.value : "";
    const content: string = contentInput ? contentInput.value : "";
    const author: string = authorInput ? authorInput.value : "";
    const category: string = categorySelect ? categorySelect.value : "";

    if (!title || !content || !author) {
      alert("Please fill in all required fields");
      return;
    }

    // Show loading state
    const submitButton: HTMLElement | null = document.getElementById("create-thread");
    const originalText: string = submitButton ? submitButton.innerHTML : "";
    if (submitButton) {
      submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Creating...`;
      submitButton.setAttribute("disabled", "true");
    }

    try {
      // Create new thread via API
      const newThread: Thread = await createThread({
        title,
        content,
        author,
        category
      });

      // Close modal
      const modal: HTMLElement | null = document.getElementById("new-thread-modal");
      if (modal) {
        modal.style.display = "none";
      }

      // Clear form
      if (titleInput) titleInput.value = "";
      if (contentInput) contentInput.value = "";
      if (authorInput) authorInput.value = "";
      if (categorySelect) categorySelect.value = "general";

      // Update filtered forumThreads
      forumFilteredThreads = [...forumThreads];

      // Reset to first page and render
      forumCurrentPage = 1;
      renderThreads();

      // Show success message
      showNotification("Thread created successfully!", "success");
    } catch (error) {
      console.error("Error creating thread:", error);
      showNotification("Failed to create thread. Please try again.", "error");
    } finally {
      // Reset button
      if (submitButton) {
        submitButton.innerHTML = originalText;
        submitButton.removeAttribute("disabled");
      }
    }
  }

  // Set view mode
  function setView(mode: string): void {
    const gridView: HTMLElement | null = document.getElementById("grid-view");
    const listView: HTMLElement | null = document.getElementById("list-view");
    const threadGrid: HTMLElement | null = document.getElementById("thread-grid");
    const threadList: HTMLElement | null = document.getElementById("thread-list");

    if (mode === "grid") {
      if (gridView) gridView.classList.add("active");
      if (listView) listView.classList.remove("active");
      if (threadGrid) threadGrid.style.display = "grid";
      if (threadList) threadList.style.display = "none";
      currentView = "grid";
    } else {
      if (gridView) gridView.classList.remove("active");
      if (listView) listView.classList.add("active");
      if (threadGrid) threadGrid.style.display = "none";
      if (threadList) threadList.style.display = "block";
      currentView = "list";
    }

    // Render forumThreads in new view
    renderThreads();
  }

  // Handle search
  function handleSearch(): void {
    const searchInput: HTMLInputElement | null = document.getElementById("search-input") as HTMLInputElement;
    const searchTerm: string = searchInput ? searchInput.value.toLowerCase() : "";

    if (!searchTerm) {
      forumFilteredThreads = [...forumThreads];
    } else {
      forumFilteredThreads = forumThreads.filter(
        (thread: Thread) =>
          thread.title.toLowerCase().includes(searchTerm) ||
          thread.content.toLowerCase().includes(searchTerm) ||
          thread.author.toLowerCase().includes(searchTerm)
      );
    }

    forumCurrentPage = 1;
    renderThreads();
  }

  // Handle category filter
  function handleCategoryFilter(): void {
    const categoryFilter: HTMLSelectElement | null = document.getElementById("category-filter") as HTMLSelectElement;
    const category: string = categoryFilter ? categoryFilter.value : "all";

    if (category === "all") {
      forumFilteredThreads = [...forumThreads];
    } else {
      forumFilteredThreads = forumThreads.filter(
        (thread: Thread) => thread.category === category
      );
    }

    forumCurrentPage = 1;
    renderThreads();
  }

  // Change page
  function changePage(direction: number): void {
    const totalPages: number = Math.ceil(forumFilteredThreads.length / threadsPerPage);
    forumCurrentPage += direction;

    if (forumCurrentPage < 1) forumCurrentPage = 1;
    if (forumCurrentPage > totalPages) forumCurrentPage = totalPages;

    renderThreads();
  }

  // Render forumThreads
  function renderThreads(): void {
    // Clear current content
    const threadGrid: HTMLElement | null = document.getElementById("thread-grid");
    const threadList: HTMLElement | null = document.getElementById("thread-list");

    if (threadGrid) threadGrid.innerHTML = "";
    if (threadList) threadList.innerHTML = "";

    // Calculate pagination
    const totalPages: number = Math.ceil(forumFilteredThreads.length / threadsPerPage);
    const startIndex: number = (forumCurrentPage - 1) * threadsPerPage;
    const endIndex: number = startIndex + threadsPerPage;
    const forumThreadsToShow: Thread[] = forumFilteredThreads.slice(startIndex, endIndex);

    // Update pagination controls
    const prevPageBtn: HTMLElement | null = document.getElementById("prev-page");
    const nextPageBtn: HTMLElement | null = document.getElementById("next-page");
    const pageInfo: HTMLElement | null = document.getElementById("page-info");

    if (prevPageBtn) prevPageBtn.setAttribute("disabled", forumCurrentPage === 1 ? "true" : "false");
    if (nextPageBtn) nextPageBtn.setAttribute("disabled", (forumCurrentPage === totalPages || totalPages === 0) ? "true" : "false");
    if (pageInfo) pageInfo.textContent = `Page ${forumCurrentPage} of ${totalPages || 1}`;

    // Render forumThreads based on current view
    if (currentView === "grid" && threadGrid) {
      threadGrid.style.display = "grid";
      if (threadList) threadList.style.display = "none";

      forumThreadsToShow.forEach((thread: Thread) => {
        const threadCard: HTMLElement = document.createElement("div");
        threadCard.className = "thread-card";
        threadCard.innerHTML = `
          <div class="thread-header">
            <h3 class="thread-title">
              <a href="thread.html?id=${thread.id}">${thread.title}</a>
            </h3>
            <span class="thread-category">${thread.category || "general"}</span>
          </div>
          <div class="thread-meta">
            <span class="thread-author">by ${thread.author}</span>
            <span class="thread-date">${formatDate(thread.date)}</span>
          </div>
          <div class="thread-stats">
            <span class="thread-comments">${
              thread.comments.length
            } comments</span>
            <span class="thread-views">${thread.views || 0} views</span>
          </div>
        `;
        threadGrid.appendChild(threadCard);
      });
    } else if (threadList) {
      if (threadGrid) threadGrid.style.display = "none";
      threadList.style.display = "block";

      forumThreadsToShow.forEach((thread: Thread) => {
        const threadRow: HTMLElement = document.createElement("div");
        threadRow.className = "thread-row";
        threadRow.innerHTML = `
          <div class="thread-title-cell">
            <a href="thread.html?id=${thread.id}">${thread.title}</a>
          </div>
          <div class="thread-author-cell">${thread.author}</div>
          <div class="thread-category-cell">${thread.category || "general"}</div>
          <div class="thread-stats-cell">
            <span class="thread-comments">${thread.comments.length}</span>
            <span class="thread-views">${thread.views || 0}</span>
          </div>
          <div class="thread-date-cell">${formatDate(thread.date)}</div>
        `;
        threadList.appendChild(threadRow);
      });
    }
  }

  // Format date
  function formatDate(date: Date): string {
    const now: Date = new Date();
    const diffMs: number = now.getTime() - date.getTime();
    const diffDays: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours: number = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins: number = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
      }
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Show notification
  function showNotification(message: string, type: string): void {
    const notification: HTMLElement = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Fetch forumThreads from API
  async function fetchThreads(): Promise<void> {
    const response: Response = await fetch("/api/forum/forumThreads");
    if (!response.ok) {
      throw new Error("Failed to fetch forumThreads");
    }
    forumThreads = await response.json();
  }

  // Create thread via API
  async function createThread(threadData: { title: string; content: string; author: string; category: string }): Promise<Thread> {
    const response: Response = await fetch("/api/forum/forumThreads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(threadData)
    });

    if (!response.ok) {
      throw new Error("Failed to create thread");
    }

    return response.json();
  }
});
