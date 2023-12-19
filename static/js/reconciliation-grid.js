const csrfToken = document.head.querySelector('meta[name="csrf-token"]').content;

let table; //the tabulator table
let originalData;
let editedData = []; //keep track of the edits to be saved
var totals = {}; //an array to keep track of each column's totals
var isProgramEdit = false; //a boolean to make sure cellEdited: function (cell) does not run IF javascript changed the cell value, not the user

document.addEventListener('DOMContentLoaded', function() {
    fetchData();
    const saveButton = document.getElementById('save-btn');
    const revertButton = document.getElementById('revert-btn');

    revertButton.addEventListener('click', () => {
        editedData = [];
        initializeTables();
    })
    
    saveButton.addEventListener('click', () => {
        const proportionTotals = Object.values(totals);
        for (let i = 0; i < proportionTotals.length; i += 3) {            
            const roundedTotal = parseFloat(proportionTotals[i]);

            if (roundedTotal !== 100.00) {
                displayErrorMessage('Total proportion must be 100%');
                return;
            }
        }
        updateData();
    });
    
})

function fetchData(){
    var url = '/mfp/get-reconciliation';
    fetch(url , {
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
}

function updateData() {
    var url = '/mfp/update-reconciliation';
    var updatedData = editedData;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(updatedData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('API update successful:', data);
        displaySuccessMessage(data.message);
        fetchData();
    })
    .catch(error => {
        console.error('Error updating API:', error);
        displayErrorMessage(error);
    });
}


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
            MONTHLY_TARGET: row.MONTHLY_TARGET,
            PERIOD: row.PERIOD, //save the original timestamp for updating data to backend
        }; 
    });

    console.log("Organized Data: ", organizedData);

    // Convert organized data to an array
    var modifiedData = uniqueMonths.map(month => {
        var monthData = { MONTH: month };
    
        uniqueChannels.forEach(channel => {
            var channelData = organizedData[channel][month] || {};
            monthData[channel + "_PROPORTION"] = channelData.PROPORTION !== undefined ? channelData.PROPORTION : "Data Missing";
            monthData[channel + "_MONTHLY_TARGET"] = channelData.MONTHLY_TARGET !== undefined ? channelData.MONTHLY_TARGET : "Data Missing";
            monthData[channel + "_PERIOD"] = channelData.PERIOD !== undefined ? channelData.PERIOD : "Data Missing";
        });
        return monthData;
    });

    // Define columns for months
    var monthColumns = [
        {
            title: "",
            field: "MONTH",
            width: 130,
            hozAlign: "center",
            sorter: function (a, b) {
                // Define the order of months
                var monthOrder = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];

                if (a === 'Total') return 1;
        
                // Find the index of each month in the predefined order
                var indexA = monthOrder.indexOf(a);
                var indexB = monthOrder.indexOf(b);
    
                // Compare the indices to determine the sorting order
                return indexA - indexB;
            }
        }
    ];

    //Check whether cells are editable based on the row 'total'
    var editCheck = function(cell){
        //get row data
        var data = cell.getRow().getData();
    
        if (data.MONTH.toLowerCase() === 'total') { //check if row's most left column is 'total'
            return false; //uneditable
        }
        return true; //editable
    }

    // Define columns for channels
    var channelColumns = uniqueChannels.map(channel => ({
        title: channel,
        columns: [
            { 
                title: "%",
                field: channel + "_PROPORTION",
                width: 100,
                editor: "number",
                editable: editCheck,
                sorter: function (a, b, aRow, bRow) {
                    var monthValue = aRow.getData()["MONTH"];
                    var monthValue = bRow.getData()["MONTH"];
                    if (monthValue === 'Total') return 1;
                    if (monthValue === 'Total') return -1;

                    return a - b;
                },
            },
            { 
                title: "Value",
                field: channel + "_MONTHLY_TARGET",
                editor: "number",
                formatter:"money",
                editable: editCheck,
                sorter: function (a, b, aRow, bRow) {
                    var monthValue = aRow.getData()["MONTH"];
                    var monthValue = bRow.getData()["MONTH"];
                    if (monthValue === 'Total') return 1;
                    if (monthValue === 'Total') return -1;

                    return a - b;
                }
            }
        ]
    }));

    // add a row for total
    var totalsRow = { MONTH: "Total" };
    calculateTotals(modifiedData, uniqueChannels);
    uniqueChannels.forEach(channel => {
        totalsRow[channel + "_PROPORTION"] = totals[channel + "_PROPORTION"];
        totalsRow[channel + "_MONTHLY_TARGET"] = totals[channel + "_MONTHLY_TARGET"];
    });

    modifiedData.push(totalsRow);

    console.log("Modified Data: ", modifiedData);

    // Create columns array by combining month and channel columns
    var columns = monthColumns.concat(channelColumns);

    table = new Tabulator("#table-container", {
        data: modifiedData,
        layout: "fitColumns",
        responsiveLayout: "true",
        history: true,
        movableColumns: false,
        columnDefaults: {
            tooltip: true,
        },
        columns: columns,
        dataTree: true,
        cellEdited: function (cell) { //Handle cell input changes
            if (!isProgramEdit) {
                var row = cell.getRow();
                var field = cell.getField();
                var channel = field.split('_')[0];
    
                if (field.endsWith('_PROPORTION')) {
                    updateTotalSales(row, cell.getField());
                } else if (field.endsWith('_MONTHLY_TARGET')) {
                    updateProportion(row, cell.getField());
                }

                calculateTotals(modifiedData, uniqueChannels);
                pushChanges(row, channel);
            }
    
            isProgramEdit = false;
        },
    });
}

// keep track of changes to an array
function pushChanges(row, channel) {
    var period = row.getData()[channel + "_PERIOD"];
    var proportion = row.getData()[channel + "_PROPORTION"];
    var monthly_target = row.getData()[channel + "_MONTHLY_TARGET"];

    var existingIndex = editedData.findIndex(function (item) {
        return item.period === period && item.channel === channel;
    });

    if (existingIndex !== -1) {
        // Replace existing data with new values
        editedData[existingIndex] = {
            PERIOD: period,
            CHANNEL: channel,
            PROPORTION: proportion,
            MONTHLY_TARGET: monthly_target
        };
    } else {
        // No existing data found, push the new data
        editedData.push({
            PERIOD: period,
            CHANNEL: channel,
            PROPORTION: proportion,
            MONTHLY_TARGET: monthly_target
        });
    }
}


function calculateTotals(data, uniqueChannels) {
    var totalRow = data.find(row => row.MONTH === "Total"); // Implement the logic to find the total row

    uniqueChannels.forEach(channel => {
        var totalProportion = 0;
        var totalSales = 0;

        data.forEach(monthData => {
            if (monthData.MONTH !== "Total") { //exclude the total row
                totalProportion += parseFloat(monthData[channel + "_PROPORTION"]) || 0;
                totalSales += parseFloat(monthData[channel + "_MONTHLY_TARGET"]) || 0;
            }
        });

        totals[channel + "_PROPORTION"] = totalProportion.toFixed(2);
        totals[channel + "_MONTHLY_TARGET_TEMPORARY"] = totalSales.toFixed(2); //total sales based on user input

        if (totalRow){
            totalRow[channel + "_PROPORTION"] = totals[channel + "_PROPORTION"];
            // no need to re-calculate monthly_target because it is fixed
            // totalRow[channel + "_MONTHLY_TARGET"] = totals[channel + "_MONTHLY_TARGET"];
            table.setData(data);
        }
        else {
            totals[channel + "_MONTHLY_TARGET"] = totalSales.toFixed(2);
        }
    });
}

function updateTotalSales(row, field) {
    isProgramEdit = true;
    var proportionInput = row.getCell(field); //get the edited proportion cell
    var totalSalesInput = row.getCell(field.replace('_PROPORTION', '_MONTHLY_TARGET')); //get the monthly_target cell corresponding to the edited cell.

    if (totalSalesInput) {
        var proportion = parseFloat(proportionInput.getValue()) || 0;
        var totalSales = (proportion / 100) * totals[field.replace('_PROPORTION', '_MONTHLY_TARGET')];
        totalSalesInput.setValue(totalSales.toFixed(2));

    }
}

function updateProportion(row, field) {
    isProgramEdit = true;
    var proportionInput = row.getCell(field.replace('_MONTHLY_TARGET', '_PROPORTION'));
    var totalSalesInput = row.getCell(field);

    if (proportionInput) {
        var totalSales = parseFloat(totalSalesInput.getValue()) || 0;
        var proportion = (totalSales / totals[field]) * 100;
        proportionInput.setValue(proportion.toFixed(5));
    }
}
