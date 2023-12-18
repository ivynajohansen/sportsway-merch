const csrfToken = document.head.querySelector('meta[name="csrf-token"]').content;

document.addEventListener('DOMContentLoaded', function() {
    let originalData = []; // Store original data for comparison
    let changesArray = [];
    let tableContainer = document.getElementById('table-container');
    let table, uniqueChannels, uniqueMonths, channelData;
    let tempSum = [];
    let columnNumber = 0;

    function fetchData() {
        fetch('/mfp/get-rs-monthly', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                originalData = data; // Save original data
                while (tableContainer.firstChild) {
                    tableContainer.removeChild(tableContainer.firstChild);
                }
                generateTable(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function generateTable(data) {
        changesArray = [];
        uniqueChannels = Array.from(new Set(data.map(obj => obj['CHANNEL'])));
        uniqueMonths = Array.from(new Set(data.map(obj => getMonthName(obj['PERIOD']))));
    
        table = document.createElement('table');
        table.classList.add('data-table'); // Add class 'data-table' to the table
    
        const thead = table.createTHead();
        const channelHeaderRow = thead.insertRow();
        const subHeaderRow = thead.insertRow();
        subHeaderRow.classList.add('rs-subheader');
        const emptyHeaderCell = document.createElement('th');
        const emptyHeaderText = document.createTextNode('');
        emptyHeaderCell.appendChild(emptyHeaderText);
        emptyHeaderCell.classList.add('month-header');
        channelHeaderRow.appendChild(emptyHeaderCell);
        
    
        const emptySubheaderCell = document.createElement('th');
        const emptySubheaderText = document.createTextNode('');
        emptySubheaderCell.appendChild(emptySubheaderText);
        subHeaderRow.appendChild(emptySubheaderCell);
    
        uniqueChannels.forEach(channel => {
            const channelHeaderCell = document.createElement('th');
            channelHeaderCell.colSpan = 2;
            const channelHeaderText = document.createTextNode(channel);
            channelHeaderCell.appendChild(channelHeaderText);
            channelHeaderRow.appendChild(channelHeaderCell);
    
            // Add sub-headers
            const proportionHeaderCell = document.createElement('th');
            const proportionHeaderText = document.createTextNode('%');
            proportionHeaderCell.appendChild(proportionHeaderText);
            subHeaderRow.appendChild(proportionHeaderCell);
    
            const totalSalesHeaderCell = document.createElement('th');
            const totalSalesHeaderText = document.createTextNode('Value');
            totalSalesHeaderCell.appendChild(totalSalesHeaderText);
            subHeaderRow.appendChild(totalSalesHeaderCell);
        });
    
        const tbody = document.createElement('tbody');
    
        uniqueMonths.forEach(month => {
            const monthRow = tbody.insertRow();
            const monthCell = monthRow.insertCell();
            const monthText = document.createTextNode(month);
            monthCell.appendChild(monthText);

         
            uniqueChannels.forEach((channel, index) => {
                index++;
                channelData = data.find(obj => obj['CHANNEL'] === channel && getMonthName(obj['PERIOD']) === month);
        
                // Create cells for proportion and total sales
                const proportionCell = monthRow.insertCell();
                const proportionInput = document.createElement('input');
                proportionInput.value = (channelData && channelData['PROPORTION'] !== undefined) ? formatNumber(channelData['PROPORTION']) : '';
                proportionInput.classList.add('proportion-input');
                proportionCell.appendChild(proportionInput);
        
                const totalSalesCell = monthRow.insertCell();
                const totalSalesInput = document.createElement('input');
                totalSalesInput.value = (channelData && channelData['TOTAL_SALES'] !== undefined) ? formatNumber(channelData['TOTAL_SALES']) : '';
                totalSalesCell.appendChild(totalSalesInput);
        
                proportionInput.addEventListener('change', () => {
                    
                    handleInputChange(proportionInput,'PROPORTION', month, channel, monthRow, index * 2 - 1);
                });
        
                proportionInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        proportionInput.blur();
                    }
                });
        
                totalSalesInput.addEventListener('change', () => {
                    
                    handleInputChange(totalSalesInput, 'TOTAL_SALES', month, channel, monthRow, index * 2);
                });
        
                totalSalesInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        totalSalesInput.blur();
                    }
                });
            });
        });
    
        // Add the total row
        const totalRow = tbody.insertRow();
        const totalCell = totalRow.insertCell();
        totalCell.colSpan = 1;
        totalCell.textContent = 'Total';
        totalRow.classList.add('table-total');
    
        uniqueChannels.forEach(() => {
            const totalProportionCell = totalRow.insertCell();
            const totalValueCell = totalRow.insertCell();
    
            totalProportionCell.classList.add('proportion-input');
            totalValueCell.classList.add('proportion-input');
    
            let totalProportion = 0;
            let totalValue = 0;

            totalProportionCell.textContent = formatNumber(totalProportion);
            totalValueCell.textContent = formatNumber(totalValue);
            columnNumber += 2;
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);

        for (var i = 1; i <= columnNumber; i++) {
            calculateSum(i);
        } 
    }

    function calculateSum(columnIndex) {
        var rows = table.getElementsByTagName("tr");
        var sum = 0;
        
        for (var i = 0; i < rows.length; i++) {
            var cols = rows[i].getElementsByTagName("td");
            if (cols.length > columnIndex) {
                var inputElement = cols[columnIndex].querySelector("input");
                if (inputElement) {
                    sum += parseFloat(inputElement.value) || 0;
                   
                }
            }
        }
        tempSum[columnIndex] = sum;
        // console.log('tempSum[' + columnIndex + '] = ' + sum);

        var totalRow = table.querySelector(".table-total");
        if (totalRow) {
            var totalCols = totalRow.getElementsByTagName("td");
            if (totalCols.length > columnIndex) {
                totalCols[columnIndex].textContent = sum.toFixed(2);
            }
        }

        return sum;
        
    }
    
    function handleInputChange(input, columnName, month, channel, row, columnIndex) {
        let newValue = input.value;
        if (!isNaN(newValue)) {
            newValue = parseFloat(newValue);
        }
    
        const year = new Date(channelData['PERIOD']).getFullYear();
        const formattedMonth = ('0' + (uniqueMonths.indexOf(month) + 1)).slice(-2);
        const period = `${year}-${formattedMonth}`;
        const channelName = channel;
    
        const existingEntryIndex = changesArray.findIndex(entry => entry.period === period && entry.channel === channelName && entry.column === columnName);
    
        if (existingEntryIndex !== -1) {
            changesArray[existingEntryIndex].value = newValue;
        } else {
            changesArray.push({
                period: period,
                channel: channelName,
                column: columnName,
                value: newValue
            });
        }
        
        if (columnName === "PROPORTION") {
            updateTotalSales(row, columnIndex, period, channelName);
        } else if (columnName === "TOTAL_SALES") {
            updateProportion(row, columnIndex, period, channelName);
        }
        console.log(changesArray);
    }

    function updateTotalSales(row, columnIndex, period, channelName) {
        var proportionInput = row.cells[columnIndex].querySelector("input"); 
        var totalSalesInput = row.cells[columnIndex + 1].querySelector("input"); 
        // calculateSum(columnIndex);

        if (totalSalesInput) {
            var proportion = parseFloat(proportionInput.value) || 0;
            var totalSales = (proportion / 100) * tempSum[columnIndex + 1]; 
            totalSalesInput.value = totalSales.toFixed(2);

            //changesArray
            const columnName = 'TOTAL_SALES';
            const newValue = parseFloat(totalSalesInput.value) || 0;

            const existingEntryIndex = changesArray.findIndex(entry => entry.period === period && entry.channel === channelName && entry.column === columnName);
    
            if (existingEntryIndex !== -1) {
                changesArray[existingEntryIndex].value = newValue;
            } else {
                changesArray.push({
                    period: period,
                    channel: channelName,
                    column: columnName,
                    value: newValue
                });
            }
        }
        // calculateSum(columnIndex + 1);
        // updateAllProportions();
        calculateSum(columnIndex);
    }

    
    function updateProportion(row, columnIndex, period, channelName) {
        var totalSalesInput = row.cells[columnIndex].querySelector("input");
        var proportionInput = row.cells[columnIndex - 1].querySelector("input");
        // calculateSum(columnIndex);
    
        if (proportionInput) {
            var totalSales = parseFloat(totalSalesInput.value) || 0;
            var proportion = (totalSales / tempSum[columnIndex]) * 100; 
            proportionInput.value = proportion.toFixed(2);

            //changesArray
            const columnName = 'PROPORTION';
            const newValue = parseFloat(totalSalesInput.value) || 0;

            const existingEntryIndex = changesArray.findIndex(entry => entry.period === period && entry.channel === channelName && entry.column === columnName);
    
            if (existingEntryIndex !== -1) {
                changesArray[existingEntryIndex].value = newValue;
            } else {
                changesArray.push({
                    period: period,
                    channel: channelName,
                    column: columnName,
                    value: newValue
                });
            }
        }
        // updateAllProportions(columnIndex, channelName);
        calculateSum(columnIndex - 1);
    }

    function updateAllProportions(columnIndex, channelName) {
        var rows = table.getElementsByTagName("tr");
       
        for (var i = 0; i < rows.length; i++) {
            var cols = rows[i].getElementsByTagName("td");
            if (cols.length >= columnIndex - 1) { 
                var totalSalesInput = cols[columnIndex].querySelector("input");
                var proportionInput = cols[columnIndex - 1].querySelector("input");
                
                if (totalSalesInput && proportionInput) {
                    
                    var totalSales = parseFloat(totalSalesInput.value) || 0;
                    var proportion = (totalSales / tempSum[columnIndex]) * 100;
                    proportionInput.value = proportion.toFixed(2);

                    
                    newValue = parseFloat(proportionInput.value);
                    

                    const year = new Date(channelData['PERIOD']).getFullYear();
                    const formattedMonth = ('0' + (i - 1)).slice(-2);
                    const period = `${year}-${formattedMonth}`;
                    const columnName = "PROPORTION";
                   
                
                    const existingEntryIndex = changesArray.findIndex(entry => entry.period === period && entry.channel === channelName && entry.column === columnName);
                
                    if (existingEntryIndex !== -1) {
                        changesArray[existingEntryIndex].value = newValue;
                    } else {
                        changesArray.push({
                            period: period,
                            channel: channelName,
                            column: columnName,
                            value: newValue
                        });
                    }
                }
            }
        }
    }    

    function getMonthName(dateString) {
        const date = new Date(dateString);
        const options = { month: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    function formatNumber(value) {
        // Check if value is defined and not null
        if (value !== undefined && value !== null) {
            // Check if value is a number
            const floatValue = parseFloat(value);
            if (!isNaN(floatValue)) {
                return floatValue.toFixed(2);
            }
        }
        // Return an empty string if value is not a valid number
        return '';
    }

    fetchData();

    const saveButton = document.getElementById('save-btn');
    const revertButton = document.getElementById('revert-btn');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    saveButton.addEventListener('click', () => {

        // if (tempSum[1] != 100){
        //     displayErrorMessage('Total proportion must be 100%');
        //     return;
        // }

        const lastRow = table.rows[table.rows.length - 1];
        for (let i = 1; i < lastRow.cells.length; i += 2) {
            const cellContent = parseFloat(lastRow.cells[i].textContent);
            if (isNaN(cellContent) || cellContent !== 100) {
                displayErrorMessage('Total proportion must be 100%');
                return;
            }
        }
        
        console.log("Updates: " + JSON.stringify(changesArray));
        enableSpinner();
        fetch('/update-rs-monthly', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(changesArray)
        })
        .then(response => {
            if (response.ok) {
                changesArray = [];
                fetchData();
                displaySuccessMessage('Update Succesfully');
                triggerApi();
            } else {
                throw new Error(`Server responded with status ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message.includes('status 500')) {
                displayErrorMessage('Failed to update');
            } else {
                displayErrorMessage('An error occurred.');
            }
        });

    });

    function triggerApi(){
        fetch('https://asia-southeast2-poc-eiger.cloudfunctions.net/retail_bottom_up_planning', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Accept' : '*/*',
                'Accept-Encoding' : 'gzip, deflate, br',
            },
        })
        .then(response => response.json())
        .then(() => {
            disableSpinner();
            fetchData();
        })
        .catch(error => {
            console.error('Error:', error);
            disableSpinner();
        });
    }

    function displaySuccessMessage(message) {
        errorMessage.style.display = 'none';
        successMessage.innerText = message;
        successMessage.style.display = 'block';
    
        // Hide the error message after 2 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }

    function displayErrorMessage(message) {
        successMessage.style.display = 'none';
        errorMessage.innerText = message;
        errorMessage.style.display = 'block';
        
    
        // Hide the error message after 2 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    revertButton.addEventListener('click', () => {
        while (tableContainer.firstChild) {
            tableContainer.removeChild(tableContainer.firstChild);
        }
        generateTable(originalData);
        
    })

    function enableSpinner() {
        saveButton.disabled = true;
        revertButton.disabled = true;
        document.getElementById('btn-text').style.display = 'none';
        document.getElementById('spinner').style.display = 'inline-block';
    }

    function disableSpinner(){
        saveButton.disabled = false;
        revertButton.disabled = false;
    
        document.getElementById('btn-text').style.display = 'inline-block';
        document.getElementById('spinner').style.display = 'none';
    }
});


