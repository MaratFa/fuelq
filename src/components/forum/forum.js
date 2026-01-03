// Forum functionality

// Global variables
let currentPage = 1;
const threadsPerPage = 10;
let filteredThreads = [];
let currentView = "grid";

// Initialize forum when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  // Show loading state
  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "loading-indicator";
  loadingIndicator.innerHTML = `<div class="spinner"></div><p>Loading forum threads...</p>`;
  const forumContainer = document.querySelector(".forum-container");
  if (forumContainer) {
    forumContainer.appendChild(loadingIndicator);
  }

  try {
    // Fetch threads from API
    await fetchThreads();
    filteredThreads = [...threads];
  } catch (error) {
    console.error("Failed to load forum threads:", error);
    // Show error message
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.innerHTML = `<p>Failed to load forum threads. Please try again later.</p>`;
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
  const newThreadBtn = document.getElementById("new-thread-btn");
  if (newThreadBtn) {
    newThreadBtn.addEventListener("click", function () {
      const modal = document.getElementById("new-thread-modal");
      if (modal) {
        modal.style.display = "block";
      }
    });
  }

  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      const modal = document.getElementById("new-thread-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  }

  const cancelThreadBtn = document.getElementById("cancel-thread");
  if (cancelThreadBtn) {
    cancelThreadBtn.addEventListener("click", function () {
      const modal = document.getElementById("new-thread-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  }

  const createThreadBtn = document.getElementById("new-thread-btn");
  if (createThreadBtn) {
    createThreadBtn.addEventListener("click", function () {
      createNewThread();
    });
  }

  // Initialize forum
  function initializeForum() {
    // Set up view toggles
    const gridViewBtn = document.getElementById("grid-view");
    if (gridViewBtn) {
      gridViewBtn.addEventListener("click", function () {
        setView("grid");
      });
    }

    const listViewBtn = document.getElementById("list-view");
    if (listViewBtn) {
      listViewBtn.addEventListener("click", function () {
        setView("list");
      });
    }

    // Set up search
    const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", handleSearch);
  }
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") handleSearch();
    });
  }

    // Set up category filter
    const categoryFilter = document.getElementById("category-filter");
    if (categoryFilter) {
      categoryFilter.addEventListener("change", handleCategoryFilter);
    }

    // Set up pagination
    const prevPageBtn = document.getElementById("prev-page");
    if (prevPageBtn) {
      prevPageBtn.addEventListener("click", function () {
        changePage(-1);
      });
    }

    const nextPageBtn = document.getElementById("next-page");
    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", function () {
        changePage(1);
      });
    }
  }

  // Create new thread
  async function createNewThread() {
    const title = document.getElementById("thread-title").value;
    const content = document.getElementById("thread-content").value;
    const author = document.getElementById("thread-author").value;
    const category = document.getElementById("thread-category").value;

    if (!title || !content || !author) {
      alert("Please fill in all required fields");
      return;
    }

    // Show loading state
    const submitButton = document.getElementById("create-thread");
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Creating...`;
    submitButton.disabled = true;

    try {
      // Create new thread via API
      const newThread = await createThread({
        title,
        content,
        author,
        category
      });

      // Close modal
      document.getElementById("new-thread-modal").style.display = "none";

      // Clear form
      document.getElementById("thread-title").value = "";
      document.getElementById("thread-content").value = "";
      document.getElementById("thread-author").value = "";
      document.getElementById("thread-category").value = "general";

      // Update filtered threads
      filteredThreads = [...threads];
      
      // Reset to first page and render
      currentPage = 1;
      renderThreads();
      
      // Show success message
      showNotification("Thread created successfully!", "success");
    } catch (error) {
      console.error("Error creating thread:", error);
      showNotification("Failed to create thread. Please try again.", "error");
    } finally {
      // Reset button
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  }

  // Set view mode
  function setView(mode) {
    const gridView = document.getElementById("grid-view");
    const listView = document.getElementById("list-view");
    const threadGrid = document.getElementById("thread-grid");
    const threadList = document.getElementById("thread-list");

    if (mode === "grid") {
      gridView.classList.add("active");
      listView.classList.remove("active");
      threadGrid.style.display = "grid";
      threadList.style.display = "none";
    } else {
      gridView.classList.remove("active");
      listView.classList.add("active");
      threadGrid.style.display = "none";
      threadList.style.display = "block";
    }

    // Render threads in the new view
    renderThreads();
  }

  // Handle search
  function handleSearch() {
    const searchTerm = document
      .getElementById("search-input")
      .value.toLowerCase();

    if (!searchTerm) {
      filteredThreads = [...threads];
    } else {
      filteredThreads = threads.filter(
        (thread) =>
          thread.title.toLowerCase().includes(searchTerm) ||
          thread.content.toLowerCase().includes(searchTerm) ||
          thread.author.toLowerCase().includes(searchTerm)
      );
    }

    currentPage = 1;
    renderThreads();
  }

  // Handle category filter
  function handleCategoryFilter() {
    const category = document.getElementById("category-filter").value;

    if (category === "all") {
      filteredThreads = [...threads];
    } else {
      filteredThreads = threads.filter(
        (thread) => thread.category === category
      );
    }

    currentPage = 1;
    renderThreads();
  }

  // Change page
  function changePage(direction) {
    const totalPages = Math.ceil(filteredThreads.length / threadsPerPage);
    currentPage += direction;

    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    renderThreads();
  }

  // Render threads
  function renderThreads() {
    // Clear current content
    const threadGrid = document.getElementById("thread-grid");
    const threadList = document.getElementById("thread-list");

    threadGrid.innerHTML = "";
    threadList.innerHTML = "";

    // Calculate pagination
    const totalPages = Math.ceil(filteredThreads.length / threadsPerPage);
    const startIndex = (currentPage - 1) * threadsPerPage;
    const endIndex = startIndex + threadsPerPage;
    const threadsToShow = filteredThreads.slice(startIndex, endIndex);

    // Update pagination controls
    document.getElementById("prev-page").disabled = currentPage === 1;
    document.getElementById("next-page").disabled =
      currentPage === totalPages || totalPages === 0;
    document.getElementById(
      "page-info"
    ).textContent = `Page ${currentPage} of ${totalPages || 1}`;

    // Render threads based on current view
    if (currentView === "grid") {
      threadGrid.style.display = "grid";
      threadList.style.display = "none";

      threadsToShow.forEach((thread) => {
        const threadCard = document.createElement("div");
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
    } else {
      threadGrid.style.display = "none";
      threadList.style.display = "block";

      threadsToShow.forEach((thread) => {
        const threadItem = document.createElement("li");
        threadItem.className = "thread-item";
        threadItem.innerHTML = `
          <div class="thread-item-header">
            <h3 class="thread-title">
              <a href="thread.html?id=${thread.id}">${thread.title}</a>
            </h3>
            <span class="thread-category">${thread.category || "general"}</span>
          </div>
          <div class="thread-item-meta">
            <span class="thread-author">by ${thread.author}</span>
            <span class="thread-date">${formatDate(thread.date)}</span>
            <span class="thread-stats">
              <span class="thread-comments">${
                thread.comments.length
              } comments</span>
              <span class="thread-views">${thread.views || 0} views</span>
            </span>
          </div>
          <div class="thread-item-content">
            <p>${thread.content.substring(0, 200)}${
          thread.content.length > 200 ? "..." : ""
        }</p>
          </div>
        `;
        threadList.appendChild(threadItem);
      });
    }
  }

  // Utility function to format dates
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  // Function to show notifications
  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Add close functionality
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => {
      notification.classList.add("notification-hiding");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add("notification-hiding");
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);

    // Show with animation
    setTimeout(() => {
      notification.classList.add("notification-visible");
    }, 10);
  }
});
