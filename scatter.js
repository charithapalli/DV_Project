// Global variables
let mergedData = [];
let interval;

// Function to parse CSV and load data
function parseMergedFile() {
    const csvFilePath = 'GNP_Life_Expectancy.csv'; // Ensure the file path matches your actual CSV file

    $.ajax({
        url: csvFilePath,
        dataType: 'text',
        success: function (data) {
            console.log("CSV Data Loaded Successfully");
            mergedData = Papa.parse(data, {
                header: true,
                dynamicTyping: true,
            }).data;

            if (mergedData.length > 0) {
                console.log("Sample Rows:", mergedData.slice(0, 5)); // Debugging the CSV content
                console.log("Available Columns:", Object.keys(mergedData[0])); // Log column headers
                generateScatterPlot(1962); // Initial plot for 1962
                initializeSlider(); // Initialize the slider after loading the data
            } else {
                console.error("CSV file is empty or improperly formatted.");
            }
        },
        error: function (xhr, status, error) {
            console.error("Failed to fetch merged CSV file:", error);
        },
    });
}

// Function to generate scatter plot
function generateScatterPlot(year) {
    console.log(`Generating scatter plot for year: ${year}`);
    const yearGNI = `${year}_GNI`;
    const yearLifeExpectancy = `${year}_Life_Expectancy`;

    if (!mergedData || mergedData.length === 0) {
        console.error("No data available to generate scatter plot.");
        return;
    }

    const filteredData = mergedData.filter(
        (row) => row[yearGNI] != null && row[yearLifeExpectancy] != null
    );

    if (filteredData.length === 0) {
        console.warn(`No data available for year ${year}`);
        Plotly.newPlot('scatterPlot', [], {
            title: `No data available for ${year}`,
        });
        return;
    }

    const trace = {
        x: filteredData.map((row) => row[yearGNI]),
        y: filteredData.map((row) => row[yearLifeExpectancy]),
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 8,
            color: filteredData.map(() => getSimilarShadeOfB18b93()), // Use custom color function
        },
        text: filteredData.map(
            (row) =>
                `Country:${row['Country Name']}<br>GNP: $${row[yearGNI]}<br>Life Expectancy: ${row[yearLifeExpectancy]} years`
        ),
        hoverinfo: 'text',
    };

    const layout = {
        title: {
            text: `GNP per Capita & Life Expectancy (${year})`,
            font: {
                family: "Times New Roman, serif", // Set Times New Roman font
                size: 24,
            },
        },
        xaxis: {
            title: {
                text: 'GNP per Capita (USD)',
                font: {
                    family: "Times New Roman, serif", // Font for x-axis
                },
            },
            range: [10, 100000], // Static x-axis range
            tickvals: Array.from({ length: 20 }, (_, i) => 10 + 5000 * i), // Tick values: 100, 5100, 10100, ..., 100000
        },
        yaxis: {
            title: {
                text: 'Life Expectancy (Years)',
                font: {
                    family: "Times New Roman, serif", // Font for y-axis
                },
            },
        },
        font: {
            family: "Times New Roman, serif", // Font for entire plot
        },
        height: 600,
    };

    Plotly.newPlot('scatterPlot', [trace], layout);
    console.log("Scatter plot generated successfully.");
}



// Function to generate shades similar to #b18b93
function getSimilarShadeOfB18b93() {
    const baseColor = [177, 139, 147]; // RGB for #b18b93
    const maxVariation = 30; // Adjust this value to control similarity

    const r = Math.min(255, Math.max(0, baseColor[0] + getRandomVariation(maxVariation)));
    const g = Math.min(255, Math.max(0, baseColor[1] + getRandomVariation(maxVariation)));
    const b = Math.min(255, Math.max(0, baseColor[2] + getRandomVariation(maxVariation)));

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Helper function to generate random variation
function getRandomVariation(maxVariation) {
    return Math.floor(Math.random() * (2 * maxVariation + 1)) - maxVariation;
}

// Function to initialize the slider
function initializeSlider() {
    console.log("Initializing slider...");
    const yearSlider = $('#yearSlider');
    const playButton = $('#playButton');
    let isPlaying = false;

    yearSlider.slider({
        range: 'min',
        min: 1962,
        max: 2021,
        step: 1,
        value: 1962,
        slide: function (event, ui) {
            console.log(`Year changed to: ${ui.value}`);
            generateScatterPlot(ui.value);
        },
    });

    playButton.click(function () {
        isPlaying = !isPlaying;
        if (isPlaying) {
            $(this).text('Pause');
            playAnimation(yearSlider);
        } else {
            $(this).text('Play');
            clearInterval(interval);
        }
    });
}

// Function to play the animation
function playAnimation(slider) {
    console.log("Starting animation...");
    let currentYear = slider.slider('value');
    interval = setInterval(() => {
        if (currentYear >= 2021) {
            clearInterval(interval);
            $('#playButton').text('Play');
        } else {
            currentYear++;
            slider.slider('value', currentYear);
            generateScatterPlot(currentYear);
        }
    }, 500);
}

// Load CSV and initialize components on page load
$(document).ready(function () {
    console.log("Document is ready. Loading CSV...");
    parseMergedFile();
});
