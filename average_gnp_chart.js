document.addEventListener("DOMContentLoaded", function () {
    const lineChart = document.getElementById("lineChart");
    let data = [];

    // Parse the CSV file
    Papa.parse("GNP_Life_Expectancy.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            data = results.data;
            renderLineChart();
        },
    });

    // Function to render the line chart
    function renderLineChart() {
        // Prepare data for the line chart
        const yearGNPMap = {};

        data.forEach((row) => {
            Object.keys(row).forEach((key) => {
                if (key.endsWith("_GNI")) {
                    const year = parseInt(key.split("_")[0]); // Extract the year from the column name
                    const gnp = row[key];
                    if (gnp != null && !isNaN(gnp)) {
                        if (!yearGNPMap[year]) {
                            yearGNPMap[year] = { total: 0, count: 0 };
                        }
                        yearGNPMap[year].total += gnp;
                        yearGNPMap[year].count += 1;
                    }
                }
            });
        });

        const years = Object.keys(yearGNPMap).sort((a, b) => a - b);
        const avgGNP = years.map((year) => {
            const { total, count } = yearGNPMap[year];
            return total / count;
        });

        const trace = {
            x: years.map((year) => parseInt(year)),
            y: avgGNP,
            mode: "lines+markers",
            name: "Average GNP",
            line: {
                color: "#654247",
                width: 2,
            },
            marker: {
                size: 6,
                color: "#8c4f5c",
            },
        };

        const layout = {
            title: {
                text: "Average GNP Over the Years",
                font: {
                    family: "Times New Roman",
                    size: 20,
                    color: "#333",
                },
            },
            xaxis: {
                title: {
                    text: "Year",
                    font: {
                        family: "Times New Roman",
                        size: 16,
                        color: "#333",
                    },
                },
                showgrid: true,
                zeroline: false,
            },
            yaxis: {
                title: {
                    text: "Average GNP (USD)",
                    font: {
                        family: "Times New Roman",
                        size: 16,
                        color: "#333",
                    },
                },
                showgrid: true,
                zeroline: false,
            },
            margin: { t: 50, l: 50, r: 50, b: 50 },
        };

        Plotly.newPlot(lineChart, [trace], layout);
    }
});
