/**
 * Engineers Page Controller
 * Handles all functionality specific to the engineers page
 */

import { getModule } from '../core/module-registry.js';

class EngineersPageController {
  constructor() {
    this.name = 'engineersPage';
    this.initialized = false;
  }

  /**
   * Initialize the engineers page controller
   * @param {Object} config - Configuration object
   */
  init(config = {}) {
    if (this.initialized) return;

    // Initialize engineers page specific features
    this.initSmoothScroll();
    this.initDataVisualizations();
    this.initTableInteractions();
    this.initExpandableSections();

    this.initialized = true;
    console.log('Engineers page controller initialized');
  }

  /**
   * Initialize smooth scrolling for anchor links
   */
  initSmoothScroll() {
    const nav = getModule('navigation');
    if (nav && typeof nav.initSmoothScroll === 'function') {
      nav.initSmoothScroll();
    } else {
      // Fallback implementation
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    }
  }

  /**
   * Initialize data visualizations
   */
  initDataVisualizations() {
    // Get the data visualizer module
    const dataViz = getModule('dataVisualizer');
    if (!dataViz) return;

    // Initialize efficiency comparison chart
    const efficiencyChart = document.getElementById('efficiency-chart');
    if (efficiencyChart) {
      dataViz.createChart(efficiencyChart, {
        type: 'bar',
        data: {
          labels: ['Hydrogen', 'Biofuels', 'Solar', 'Wind', 'Geothermal', 'Nuclear'],
          datasets: [{
            label: 'Efficiency (%)',
            data: [65, 45, 22, 35, 12, 33],
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 159, 64, 0.7)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }

    // Initialize cost comparison chart
    const costChart = document.getElementById('cost-chart');
    if (costChart) {
      dataViz.createChart(costChart, {
        type: 'line',
        data: {
          labels: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          datasets: [
            {
              label: 'Hydrogen ($/kg)',
              data: [5.5, 4.8, 3.5, 2.8, 2.2, 1.8, 1.5],
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.1)',
              tension: 0.4
            },
            {
              label: 'Biofuels ($/gallon)',
              data: [3.2, 3.0, 2.8, 2.6, 2.4, 2.3, 2.2],
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              tension: 0.4
            },
            {
              label: 'Solar ($/kWh)',
              data: [0.10, 0.08, 0.06, 0.05, 0.04, 0.04, 0.03],
              borderColor: 'rgba(255, 206, 86, 1)',
              backgroundColor: 'rgba(255, 206, 86, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  /**
   * Initialize interactive data tables
   */
  initTableInteractions() {
    // Add sorting functionality to data tables
    const tables = document.querySelectorAll('.data-table');

    tables.forEach(table => {
      const headers = table.querySelectorAll('th[data-sort]');

      headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
          const sortBy = header.getAttribute('data-sort');
          const tbody = table.querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));

          // Determine current sort direction
          const isAsc = header.classList.contains('sort-asc');

          // Remove sort classes from all headers
          headers.forEach(h => {
            h.classList.remove('sort-asc', 'sort-desc');
          });

          // Add appropriate sort class to clicked header
          header.classList.add(isAsc ? 'sort-desc' : 'sort-asc');

          // Sort rows
          rows.sort((a, b) => {
            const aValue = a.querySelector(`td[data-${sortBy}]`).getAttribute(`data-${sortBy}`);
            const bValue = b.querySelector(`td[data-${sortBy}]`).getAttribute(`data-${sortBy}`);

            // Parse numeric values
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);

            if (!isNaN(aNum) && !isNaN(bNum)) {
              return isAsc ? bNum - aNum : aNum - bNum;
            }

            // String comparison
            return isAsc ? 
              bValue.localeCompare(aValue) : 
              aValue.localeCompare(bValue);
          });

          // Re-append sorted rows
          rows.forEach(row => tbody.appendChild(row));
        });
      });
    });
  }

  /**
   * Initialize expandable sections
   */
  initExpandableSections() {
    const expandButtons = document.querySelectorAll('.expand-button');

    expandButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);

        if (!targetSection) return;

        const isExpanded = targetSection.classList.contains('expanded');

        if (isExpanded) {
          targetSection.classList.remove('expanded');
          targetSection.style.maxHeight = '0';
          button.textContent = 'Show More';
        } else {
          targetSection.classList.add('expanded');
          targetSection.style.maxHeight = targetSection.scrollHeight + 'px';
          button.textContent = 'Show Less';
        }
      });
    });
  }
}

// Export as singleton
export default new EngineersPageController();
