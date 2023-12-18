const csrfToken = document.head.querySelector('meta[name="csrf-token"]').content;

let table; //the tabulator table
let originalData;
let originalDetails;
let editedData = []; //keep track of the edits to be saved
var totals = {}; //an array to keep track of each column's totals
var isProgramEdit = false; //a boolean to make sure cellEdited: function (cell) does not run IF javascript changed the cell value, not the user

document.addEventListener('DOMContentLoaded', function() {
    fetchDetails();
    fetchData();
    const detailsRevertButton = document.getElementById('form-revert-btn');
    const saveButton = document.getElementById('save-btn');
    const revertButton = document.getElementById('revert-btn');
    const recalculateButton = document.getElementById('recalculate-btn');

    detailsRevertButton.addEventListener('click', () => {
        initializeForm();
    })

    revertButton.addEventListener('click', () => {
        initializeTables();
    })

    recalculateButton.addEventListener('click', () => {
        recalculate()
    });
    
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

function fetchDetails(){
    var url = '/mfp/get-details';
    fetch(url , {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        originalDetails = data;
        initializeForm(originalDetails);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function initializeForm(){
    const inflationInput = document.getElementById("inflation");
    const multiplierInput = document.getElementById("multiplier");
    const tgPercentageInput = document.getElementById("tg-percentage");
    const tgValueInput = document.getElementById("tg-value");
    const tgFinalInput = document.getElementById("tg-final");

    inflationInput.value = originalDetails.INFLATION;
    tgPercentageInput.value = originalDetails.TARGET_GROWTH_PERCENTAGE;
    multiplierInput.value = tgPercentageInput.value / inflationInput.value;

    tgValueInput.value = ((100 + parseFloat(tgPercentageInput.value)) / 100) * originalDetails.PREV_YEAR;
    tgFinalInput.value = originalDetails.FINAL_TARGET_GROWTH;

    inflationInput.addEventListener('change', updatePercentage);
    multiplierInput.addEventListener('change', updatePercentage);

    function updatePercentage() {
        let rawValue = multiplierInput.value * inflationInput.value;
        let formattedValue = parseFloat(rawValue).toFixed(2);
        tgPercentageInput.value = formattedValue;
    
        tgValueInput.value = ((100 + parseFloat(tgPercentageInput.value)) / 100) * originalDetails.PREV_YEAR;
        tgFinalInput.value = parseFloat(tgValueInput.value).toFixed(2);
    }

    const detailsSaveButton = document.getElementById('form-save-btn');
    detailsSaveButton.addEventListener('click', () => {
        const inflation = inflationInput.value;
        const tgPercentage = tgPercentageInput.value;
        const tgValue = tgValueInput.value;
        const tgFinal = tgFinalInput.value;

        const data = {
            INFLATION: inflation,
            TARGET_GROWTH_PERCENTAGE: tgPercentage,
            TARGET_GROWTH_VALUE: tgValue,
            FINAL_TARGET_GROWTH: tgFinal
        };
        const jsonData = JSON.stringify(data);

        fetch('/mfp/update-details', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: jsonData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            fetchData();
        })
        .catch(error => {
            // Handle errors
            console.error('Error:', error);
        });

    })

}

function fetchData(){
    var url = '/mfp/get-company-target';
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
    var url = '/mfp/update-company-target';
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
    // initialize data for the table to be modified if needed
    var modifiedData = originalData;

    // Extract unique channels
    var uniqueChannels = [...new Set(originalData.map(row => row.CHANNEL))];
    var columns = [
        {   title: "CHANNEL", 
            field: "CHANNEL", 
            frozen: true,
            sorter: function (a, b) {
            
                if (a === 'Total Sales') return 1;
                if (b === 'Total Sales') return 1;

                return a.localeCompare(b);
            },
        },
        {
            title: "PROPORTION",
            field: "PROPORTION",
            editor: "number",
            formatter: function(cell) {
                var value = cell.getValue();
                // Format the value by appending '%' at the end
                var formattedValue = value + '%';
                return formattedValue;
            },
            sorter: function (a, b, aRow, bRow) {
                var channelValue = aRow.getData()["CHANNEL"];
                var channelValue = bRow.getData()["CHANNEL"];
                if (channelValue === 'Total Sales') return 1;
                if (channelValue === 'Total Sales') return -1;

                return a - b;
            },
        },
        {   title: "TOTAL_SALES", 
            field: "TOTAL_SALES", 
            editor: "input",
            sorter: function (a, b, aRow, bRow) {
                var channelValue = aRow.getData()["CHANNEL"];
                var channelValue = bRow.getData()["CHANNEL"];
                if (channelValue === 'Total Sales') return 1;
                if (channelValue === 'Total Sales') return -1;

                return a - b;
            },
        },
        {
            title: "",
            field: "CHECKBOX",
            formatter: "tickCross",
            align: "center",
            width: 100,
            cellClick: function (e, cell) {
                // Handle checkbox click event
                var isChecked = cell.getValue();
                // Perform actions based on checkbox state
                // For example: console.log('Checkbox is checked:', isChecked);
            },
            cellEdited: function (cell) {
                // Handle checkbox state change
                var isChecked = cell.getValue();
                // Perform actions based on checkbox state
                // For example: console.log('Checkbox is checked:', isChecked);
            },
            cellContext: function (e, cell) {
                // Handle right-click context menu for the checkbox column
                // You can add custom context menu options here
                e.preventDefault(); // Prevent default right-click behavior
                console.log('Right-clicked on checkbox column');
            }
        },
        { title: "ID", field: "ID", visible: false },
    ];

    var totalsRow = { CHANNEL: "Total Sales" };
    calculateTotals(modifiedData);
    
    totalsRow["PROPORTION"] = totals["PROPORTION"];
    totalsRow["TOTAL_SALES"] = totals["TOTAL_SALES"];
    

    modifiedData.push(totalsRow);
    console.log("Modified Data: ", modifiedData);

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
                var channel = row.getData()['CHANNEL'];
    
                if (field == 'PROPORTION') {
                    updateTotalSales(row, cell.getField());
                } else if (field == 'TOTAL_SALES') {
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
    var id = row.getData()["ID"];
    var proportion = row.getData()["PROPORTION"];
    var total_sales = row.getData()["TOTAL_SALES"];

    var existingIndex = editedData.findIndex(function (item) {
        return item.ID === id;
    });

    if (existingIndex !== -1) {
        // Replace existing data with new values
        editedData[existingIndex] = {
            ID: id,
            CHANNEL: channel,
            PROPORTION: proportion,
            TOTAL_SALES: total_sales
        };
    } else {
        // No existing data found, push the new data
        editedData.push({
            ID: id,
            CHANNEL: channel,
            PROPORTION: proportion,
            TOTAL_SALES: total_sales
        });
    }

    console.log(editedData);
}


function calculateTotals(data) {
    var totalRow = data.find(row => row.CHANNEL === "Total Sales"); // Implement the logic to find the total row

    var totalProportion = 0;
    var totalSales = 0;

    data.forEach(channelData => {
        if (channelData.CHANNEL !== "Total Sales") { //exclude the total row
            totalProportion += parseFloat(channelData["PROPORTION"]) || 0;
            totalSales += parseFloat(channelData["TOTAL_SALES"]) || 0;
        }
    });

    totals["PROPORTION"] = totalProportion.toFixed(2);
    totals["TOTAL_SALES_TEMPORARY"] = totalSales.toFixed(2); //total sales based on user input

    if (totalRow){
        totalRow["PROPORTION"] = totals["PROPORTION"];
        // no need to re-calculate total_sales because it is fixed
        // totalRow[channel + "_TOTAL_SALES"] = totals[channel + "_TOTAL_SALES"];
        table.setData(data);
    }
    else { //first time initializing table
        totals["TOTAL_SALES"] = totalSales.toFixed(2);
    }
   
}

function updateTotalSales(row, field) {
    isProgramEdit = true;
    var proportionInput = row.getCell(field); //get the edited proportion cell
    var totalSalesInput = row.getCell('TOTAL_SALES'); //get the total_sales cell corresponding to the edited cell.

    if (totalSalesInput) {
        var proportion = parseFloat(proportionInput.getValue()) || 0;
        var totalSales = (proportion / 100) * totals['TOTAL_SALES'];
        totalSalesInput.setValue(totalSales.toFixed(2));

    }
}

function updateProportion(row, field) {
    isProgramEdit = true;
    var proportionInput = row.getCell('PROPORTION');
    var totalSalesInput = row.getCell(field);

    if (proportionInput) {
        var totalSales = parseFloat(totalSalesInput.getValue()) || 0;
        var proportion = (totalSales / totals[field]) * 100;
        proportionInput.setValue(proportion.toFixed(5));
    }
}
