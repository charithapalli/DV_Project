$(document).ready(function () {
    var gniData;

    // Function to parse the CSV file containing GNI per capita data
    function parseGniCSV() {
        $.ajax({
            url: 'Gross National Product.csv',
            dataType: 'text',
            success: function (data) {
                gniData = Papa.parse(data, {
                    header: true,
                    dynamicTyping: true
                }).data;

                // Initialize the choropleth map
                generateChoroplethMap(1975); // Default to 1975
            },
            error: function (xhr, status, error) {
                console.error('Failed to fetch GNI per capita CSV file:', error);
            }
        });
    }

    // Function to generate choropleth map for selected year
    function generateChoroplethMap(year) {
        var yearData = gniData.map(function (d) {
            return {
                'ISO3': d['Country Code'],
                'GNI': d[year],
                'CountryName': d['Country Name']
            };
        }).filter(function (d) {
            return d.GNI !== null && d.GNI !== undefined;
        });

        var data = [{
            type: 'choropleth',
            locations: yearData.map(d => d.ISO3),
            z: yearData.map(d => d.GNI),
            text: yearData.map(d => d.CountryName),
            colorscale: [
                [0, 'rgb(244, 217, 217)'], // Lightest shade of #a87676
                [0.5, 'rgb(199, 136, 136)'], // Medium shade of #a87676
                [1, 'rgb(168, 118, 118)']  // Darkest shade of #a87676
            ],
            autocolorscale: false,
            reversescale: false,
            marker: {
                line: {
                    color: 'darkgray',
                    width: 0.5
                }
            },
            colorbar: {
                title: 'Gross National Product (USD)',
                thickness: 10
            }
        }];

        var layout = {
            title: `Gross National Product (${year})`,
            geo: {
                showframe: false,
                showcoastlines: true,
                coastlinecolor: 'rgb(217,217,217)',
                projection: {
                    type: 'mercator'
                },
                resolution: 50,
                center: {
                    lon: 0,
                    lat: 30
                },
                lonaxis: { range: [-180, 180] },
                lataxis: { range: [-60, 90] }
            },
            autosize: true,
            height: 700, // Adjust the height
            width: 1000  // Adjust the width
        };

        Plotly.newPlot('mapGraph', data, layout);
    }

    // Event listener for year input change
    $('#yearInput').on('input', function () {
        var year = $(this).val();
        if (year >= 1975 && year <= 2023) {
            generateChoroplethMap(year);
        }
    });

    // Parse the CSV file on document load
    parseGniCSV();
});
