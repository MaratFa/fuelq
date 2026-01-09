/**
 * Engineers Page Controller
 * Handles all functionality specific to the engineers page
 */

import { getModule } from '../core/module-registry.js';

interface EngineersPageConfig {
  [key: string]: any;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    tension?: number;
    borderWidth?: number;
  }[];
}

interface ChartOptions {
  responsive: boolean;
  scales?: {
    y?: {
      beginAtZero: boolean;
      max?: number;
    };
  };
}

interface ChartConfig {
  type: string;
  data: ChartData;
  options: ChartOptions;
}

class EngineersPageController {
  private name: string;
  private initialized: boolean;

  constructor() {
    this.name = 'engineersPage';
    this.initialized = false;
  }

  /**
   * Initialize the engineers page controller
   * @param config - Configuration object
   */
  init(config: EngineersPageConfig = {}): void {
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
  initSmoothScroll(): void {
    const nav = getModule('navigation');
    if (nav && typeof nav.initSmoothScroll === 'function') {
      nav.initSmoothScroll();
    } else {
      // Fallback implementation
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e: Event) => {
          e.preventDefault();
          const targetId = (anchor as HTMLAnchorElement).getAttribute('href')?.substring(1);
          if (!targetId) return;

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
  initDataVisualizations(): void {
    // Get the data visualizer module
    const dataViz = getModule('dataVisualizer');
    if (!dataViz) return;

    // Initialize efficiency comparison chart
    const efficiencyChart = document.getElementById('efficiency-chart') as HTMLCanvasElement;
    if (efficiencyChart) {
      const efficiencyConfig: ChartConfig = {
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
      };

      dataViz.createChart(efficiencyChart, efficiencyConfig);
    }

    // Initialize cost comparison chart
    const costChart = document.getElementById('cost-chart') as HTMLCanvasElement;
    if (costChart) {
      const costConfig: ChartConfig = {
        type: 'line',
        data: {
          labels: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
          datasets: [
            {
              label: 'Hydrogen ($/kg)',
              data: [5.5, 4.8, 3.5, 2.8, 2.2, 1.8, 1.5],
              borderColor: ['rgba(54, 162, 235, 1)'],
              backgroundColor: ['rgba(54, 162, 235, 0.1)'],
              tension: 0.4
            },
            {
              label: 'Biofuels ($/gallon)',
              data: [3.2, 3.0, 2.8, 2.6, 2.4, 2.3, 2.2],
              borderColor: ['rgba(75, 192, 192, 1)'],
              backgroundColor: ['rgba(75, 192, 192, 0.1)'],
              tension: 0.4
            },
            {
              label: 'Solar ($/kWh)',
              data: [0.10, 0.08, 0.06, 0.05, 0.04, 0.04, 0.03],
              borderColor: ['rgba(255, 206, 86, 1)'],
              backgroundColor: ['rgba(255, 206, 86, 0.1)'],
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
      };

      dataViz.createChart(costChart, costConfig);
    }
  }

  /**
   * Initialize interactive data tables
   */
  initTableInteractions(): void {
    // Add sorting functionality to data tables
    const tables = document.querySelectorAll('.data-table');

    tables.forEach(table => {
      const headers = table.querySelectorAll('th[data-sort]');

      headers.forEach(header => {
        (header as HTMLElement).style.cursor = 'pointer';
        header.addEventListener('click', () => {
          const sortBy = header.getAttribute('data-sort');
          if (!sortBy) return;

          const tbody = table.querySelector('tbody');
          if (!tbody) return;

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
            const aCell = a.querySelector(`td[data-${sortBy}]`);
            const bCell = b.querySelector(`td[data-${sortBy}]`);

            if (!aCell || !bCell) return 0;

            const aValue = aCell.getAttribute(`data-${sortBy}`);
            const bValue = bCell.getAttribute(`data-${sortBy}`);

            if (!aValue || !bValue) return 0;

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
  initExpandableSections(): void {
    const expandButtons = document.querySelectorAll('.expand-button');

    expandButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        if (!targetId) return;

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
