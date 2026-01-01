/**
 * Data Visualizer Module
 * Handles creation and management of data visualizations
 */

class DataVisualizer {
  constructor() {
    this.name = 'dataVisualizer';
    this.charts = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the data visualizer
   * @param {Object} config - Configuration object
   */
  init(config = {}) {
    if (this.initialized) return;

    // Load Chart.js if not already loaded
    this.loadChartLibrary()
      .then(() => {
        this.initialized = true;
        console.log('Data visualizer initialized');
      })
      .catch(error => {
        console.error('Failed to initialize data visualizer:', error);
      });
  }

  /**
   * Load Chart.js library
   * @returns {Promise} Promise that resolves when Chart.js is loaded
   */
  loadChartLibrary() {
    return new Promise((resolve, reject) => {
      // Check if Chart.js is already loaded
      if (window.Chart) {
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Chart.js'));

      document.head.appendChild(script);
    });
  }

  /**
   * Create a new chart
   * @param {HTMLElement} element - Canvas element for the chart
   * @param {Object} config - Chart configuration
   * @returns {Object} Chart instance
   */
  createChart(element, config) {
    if (!this.initialized) {
      console.warn('Data visualizer not initialized yet');
      return null;
    }

    // Destroy existing chart if it exists
    if (this.charts.has(element)) {
      this.charts.get(element).destroy();
    }

    // Create new chart
    const chart = new Chart(element, config);

    // Store reference to chart
    this.charts.set(element, chart);

    return chart;
  }

  /**
   * Destroy a chart
   * @param {HTMLElement} element - Canvas element of the chart
   */
  destroyChart(element) {
    if (this.charts.has(element)) {
      this.charts.get(element).destroy();
      this.charts.delete(element);
    }
  }

  /**
   * Create a comparison table from data
   * @param {HTMLElement} container - Container element for the table
   * @param {Array} data - Array of data objects
   * @param {Array} columns - Array of column definitions
   */
  createComparisonTable(container, data, columns) {
    // Clear container
    container.innerHTML = '';

    // Create table element
    const table = document.createElement('table');
    table.className = 'comparison-table data-table';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column.title;

      if (column.sortable) {
        th.setAttribute('data-sort', column.key);
        th.innerHTML += ' <i class="fas fa-sort"></i>';
      }

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');

    data.forEach(item => {
      const row = document.createElement('tr');

      columns.forEach(column => {
        const td = document.createElement('td');
        td.setAttribute(`data-${column.key}`, item[column.key]);

        if (column.formatter) {
          td.innerHTML = column.formatter(item[column.key]);
        } else {
          td.textContent = item[column.key];
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  /**
   * Create a progress bar visualization
   * @param {HTMLElement} container - Container element
   * @param {Array} items - Array of progress items
   */
  createProgressBar(container, items) {
    // Clear container
    container.innerHTML = '';

    // Create progress bars
    items.forEach(item => {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-item';

      const label = document.createElement('div');
      label.className = 'progress-label';
      label.textContent = item.label;

      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';

      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      progressFill.style.width = `${item.value}%`;

      if (item.color) {
        progressFill.style.backgroundColor = item.color;
      }

      const value = document.createElement('div');
      value.className = 'progress-value';
      value.textContent = `${item.value}%`;

      progressBar.appendChild(progressFill);
      progressBar.appendChild(value);

      progressContainer.appendChild(label);
      progressContainer.appendChild(progressBar);

      container.appendChild(progressContainer);
    });
  }

  /**
   * Create a timeline visualization
   * @param {HTMLElement} container - Container element
   * @param {Array} events - Array of timeline events
   */
  createTimeline(container, events) {
    // Clear container
    container.innerHTML = '';

    // Create timeline
    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    events.forEach((event, index) => {
      const eventElement = document.createElement('div');
      eventElement.className = 'timeline-event';

      const marker = document.createElement('div');
      marker.className = 'timeline-marker';

      const content = document.createElement('div');
      content.className = 'timeline-content';

      const date = document.createElement('div');
      date.className = 'timeline-date';
      date.textContent = event.date;

      const title = document.createElement('h3');
      title.className = 'timeline-title';
      title.textContent = event.title;

      const description = document.createElement('p');
      description.className = 'timeline-description';
      description.textContent = event.description;

      content.appendChild(date);
      content.appendChild(title);
      content.appendChild(description);

      eventElement.appendChild(marker);
      eventElement.appendChild(content);

      timeline.appendChild(eventElement);
    });

    container.appendChild(timeline);
  }
}

// Export as singleton
export default new DataVisualizer();
