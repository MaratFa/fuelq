
/**
 * Engineers Page JavaScript
 * Handles filtering, sorting, and chart visualization
 */

import type { ChartType } from './forengineers-types';
import { Chart } from './forengineers-types';

// Define interface for type safety
interface ChartMetric {
  [key: string]: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  };
}

// Chart type is imported from forengineers-types.ts

document.addEventListener('DOMContentLoaded', () => {
  // Initialize filter and sort functionality
  initFilterAndSort();

  // Initialize chart functionality
  initChart();

  // Initialize tab functionality
  initTabs();
});

/**
 * Initialize filter and sort functionality for energy source cards
 */
function initFilterAndSort(): void {
  const energyFilter = document.getElementById('energy-filter') as HTMLSelectElement;
  const sortBy = document.getElementById('sort-by') as HTMLSelectElement;
  const resetFilters = document.getElementById('reset-filters') as HTMLButtonElement;
  const filterStatus = document.getElementById('filter-status') as HTMLElement;
  const fuelCards = document.querySelectorAll('.fuel-card') as NodeListOf<HTMLElement>;

  // Apply filters and sorting
  function applyFiltersAndSort(): void {
    const filterValue = energyFilter.value;
    const sortValue = sortBy.value;
    let visibleCount = 0;

    // Filter cards
    fuelCards.forEach(card => {
      const cardTypes = card.dataset.type?.split(' ') || [];
      let shouldShow = filterValue === 'all' || cardTypes.includes(filterValue);

      if (shouldShow) {
        visibleCount++;
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    // Sort visible cards
    if (sortValue !== 'default') {
      const container = document.querySelector('.fuel-grid') as HTMLElement;
      const visibleCards = Array.from(fuelCards).filter(card => card.style.display !== 'none');

      visibleCards.sort((a, b) => {
        const aValue = parseInt(a.dataset[sortValue] || '0');
        const bValue = parseInt(b.dataset[sortValue] || '0');
        return bValue - aValue; // Descending order
      });

      // Re-append sorted cards
      visibleCards.forEach(card => {
        container.appendChild(card);
      });
    }

    // Update filter status
    filterStatus.textContent = `Showing ${visibleCount} of ${fuelCards.length} energy sources`;
  }

  // Event listeners
  energyFilter.addEventListener('change', applyFiltersAndSort);
  sortBy.addEventListener('change', applyFiltersAndSort);

  resetFilters.addEventListener('click', () => {
    energyFilter.value = 'all';
    sortBy.value = 'default';
    applyFiltersAndSort();
  });

  // Initial filter
  applyFiltersAndSort();
}

/**
 * Initialize chart functionality
 */
function initChart(): void {
  const chartCanvas = document.getElementById('energyComparisonChart') as HTMLCanvasElement;
  const chartMetric = document.getElementById('chart-metric') as HTMLSelectElement;
  const downloadChart = document.getElementById('download-chart') as HTMLButtonElement;

  if (!chartCanvas) return;

  const ctx = chartCanvas.getContext('2d')!;
  let currentChart: ChartType | null = null;

  // Chart data
  const chartData: ChartMetric = {
    efficiency: {
      label: 'Efficiency (%)',
      data: [50, 30, 18, 40, 16, 40, 45],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
    },
    cost: {
      label: 'Capital Cost (relative)',
      data: [5, 3, 3, 4, 4, 5, 4],
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
    },
    scalability: {
      label: 'Scalability (1-5)',
      data: [5, 3, 5, 5, 2, 3, 4],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
    },
    landuse: {
      label: 'Land Use (relative, lower is better)',
      data: [1, 5, 3, 3, 1, 0, 1],
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
    },
    capacity: {
      label: 'Capacity Factor (%)',
      data: [50, 50, 17, 37, 85, 90, 50],
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
    }
  };

  // Function to create or update chart
  function updateChart(): void {
    const metric = chartMetric.value;
    const data = chartData[metric];

    if (!data) {
      console.error(`No data found for metric: ${metric}`);
      return;
    }

    if (currentChart) {
      currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Hydrogen', 'Biofuels', 'Solar', 'Wind', 'Geothermal', 'Nuclear', 'Ammonia'],
        datasets: [{
          label: data.label,
          data: data.data,
          backgroundColor: data.backgroundColor,
          borderColor: data.borderColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: data.label
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Energy Source Comparison'
          },
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Event listeners
  chartMetric.addEventListener('change', updateChart);

  downloadChart.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'energy-comparison-chart.png';
    link.href = chartCanvas.toDataURL();
    link.click();
  });

  // Initial chart
  updateChart();
}

/**
 * Initialize tab functionality for comparison section
 */
function initTabs(): void {
  const tabButtons = document.querySelectorAll('.tab-btn') as NodeListOf<HTMLButtonElement>;
  const tabContents = document.querySelectorAll('.tab-content') as NodeListOf<HTMLElement>;

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;

      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(`${tabId}-view`)?.classList.add('active');
    });
  });
}

// Export functions for external use
export { initFilterAndSort, initChart, initTabs };
