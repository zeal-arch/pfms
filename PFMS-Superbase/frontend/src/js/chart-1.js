// chart 1

var ctx1 = document.getElementById("chart-bars").getContext("2d");

new Chart(ctx1, {
    type: "bar",
    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
            label: "Monthly Sales",
            tension: 0.4,
            borderWidth: 0,
            borderRadius: 4,
            borderSkipped: false,
            backgroundColor: "#3b82f6",
            data: [150, 200, 125, 225, 300, 250, 175, 225, 275, 210, 290, 350],
            maxBarThickness: 10
        }],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            }
        },
        interaction: {
            intersect: false,
            mode: "index",
        },
        scales: {
            y: {
                grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [5, 5],
                },
                ticks: {
                    display: true,
                    padding: 10,
                    color: "#b2b9bf",
                    font: {
                        size: 11,
                        family: "Open Sans",
                        style: "normal",
                        lineHeight: 2
                    },
                }
            },
            x: {
                grid: {
                    drawBorder: false,
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                },
                ticks: {
                    display: true,
                    color: "#b2b9bf",
                    padding: 10,
                    font: {
                        size: 11,
                        family: "Open Sans",
                        style: "normal",
                        lineHeight: 2
                    },
                }
            },
        },
    },
});

// end chart 1