/**
 * Engineers Page JavaScript
 * Handles filtering, sorting, and chart visualization
 */

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
function initFilterAndSort() {
    const energyFilter = document.getElementById('energy-filter');
    const sortBy = document.getElementById('sort-by');
    const resetFilters = document.getElementById('reset-filters');
    const filterStatus = document.getElementById('filter-status');
    const fuelCards = document.querySelectorAll('.fuel-card');

    // Apply filters and sorting
    function applyFiltersAndSort() {
        const filterValue = energyFilter.value;
        const sortValue = sortBy.value;
        let visibleCount = 0;

        // Filter cards
        fuelCards.forEach(card => {
            const cardTypes = card.dataset.type.split(' ');
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
            const container = document.querySelector('.fuel-grid');
            const visibleCards = Array.from(fuelCards).filter(card => card.style.display !== 'none');

            visibleCards.sort((a, b) => {
                const aValue = parseInt(a.dataset[sortValue]);
                const bValue = parseInt(b.dataset[sortValue]);
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
function initChart() {
    const chartCanvas = document.getElementById('energyComparisonChart');
    const chartMetric = document.getElementById('chart-metric');
    const downloadChart = document.getElementById('download-chart');

    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext('2d');
    let currentChart = null;

    // Chart data
    const chartData = {
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
    function updateChart() {
        const metric = chartMetric.value;
        const data = chartData[metric];

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
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabId}-view`).classList.add('active');
        });
    });
}
