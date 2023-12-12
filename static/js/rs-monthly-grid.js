let originalData;

document.addEventListener('DOMContentLoaded', function() {
    fetch('/mfp/get-rs-monthly', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        originalData = data; // Save original data
        initializeTables();
    })
    .catch(error => {
        console.error('Error:', error);
    });
})

function initializeTables() {
    // Extract unique channels and months
    var uniqueChannels = [...new Set(originalData.map(row => row.CHANNEL))];
    var uniqueMonths = [...new Set(originalData.map(row => new Date(row.PERIOD).toLocaleString('default', { month: 'long' })))];

    // Organize data by channel and month
    var organizedData = {};

    originalData.forEach(row => {
        var month = new Date(row.PERIOD).toLocaleString('default', { month: 'long' });

        if (!organizedData[row.CHANNEL]) {
            organizedData[row.CHANNEL] = {};
        }

        organizedData[row.CHANNEL][month] = {
            PROPORTION: row.PROPORTION,
            TOTAL_SALES: row.TOTAL_SALES
        };
    });

    console.log("Organized Data: ", organizedData);

    // Convert organized data to an array
    var modifiedData = uniqueMonths.map(month => {
        var monthData = { MONTH: month };
    
        uniqueChannels.forEach(channel => {
            var channelData = organizedData[channel][month] || {};
            monthData[channel + "_PROPORTION"] = channelData.PROPORTION !== undefined ? channelData.PROPORTION : "Data Missing";
            monthData[channel + "_TOTAL_SALES"] = channelData.TOTAL_SALES !== undefined ? channelData.TOTAL_SALES : "Data Missing";
        });
        return monthData;
    });

    console.log("Modified Data: ", modifiedData);

    // Define columns for months
    var monthColumns = [
        { title: "", field: "MONTH", width: 130, hozAlign: "center" }
    ];

    // Define columns for channels
    var channelColumns = uniqueChannels.map(channel => ({
        title: channel,
        columns: [
            { title: "%", field: channel + "_PROPORTION", editor: "input" },
            { title: "Value", field: channel + "_TOTAL_SALES", editor: "input"}
        ]
    }));


    // Create columns array by combining month and channel columns
    var columns = monthColumns.concat(channelColumns);

    var table = new Tabulator("#myGrid", {
        data: modifiedData,  // Use the modified dataset
        layout: "fitColumns", // fit columns to width of table
        responsiveLayout: "scroll", // hide columns that don't fit on the table
        history: true, // allow undo and redo actions on the table
        movableColumns: false, // allow column order to be changed
        columnDefaults: {
            tooltip: true, // show tooltips on cells
        },
        columns: columns,
        dataTree: true, // Enable data tree to show months as parent rows
    });
}

