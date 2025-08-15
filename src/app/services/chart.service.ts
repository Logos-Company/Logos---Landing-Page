import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export class ChartService {

    static createLineChart(ctx: CanvasRenderingContext2D, data: any[], labels: string[], label: string = 'Dane'): Chart {
        const config: ChartConfiguration = {
            type: 'line' as ChartType,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#17a2b8',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            color: '#333'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e9ecef'
                        },
                        ticks: {
                            color: '#6c757d'
                        }
                    },
                    x: {
                        grid: {
                            color: '#e9ecef'
                        },
                        ticks: {
                            color: '#6c757d'
                        }
                    }
                }
            }
        };

        return new Chart(ctx, config);
    }

    static createBarChart(ctx: CanvasRenderingContext2D, data: any[], labels: string[], label: string = 'Wartości'): Chart {
        const config: ChartConfiguration = {
            type: 'bar' as ChartType,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: 'rgba(23, 162, 184, 0.8)',
                    borderColor: '#17a2b8',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            color: '#333'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e9ecef'
                        },
                        ticks: {
                            color: '#6c757d'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6c757d'
                        }
                    }
                }
            }
        };

        return new Chart(ctx, config);
    }

    static createDoughnutChart(ctx: CanvasRenderingContext2D, data: any[], labels: string[]): Chart {
        const config: ChartConfiguration = {
            type: 'doughnut' as ChartType,
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#17a2b8',
                        '#28a745',
                        '#ffc107',
                        '#dc3545',
                        '#6f42c1'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            color: '#333',
                            padding: 15
                        }
                    }
                }
            }
        };

        return new Chart(ctx, config);
    }
}
