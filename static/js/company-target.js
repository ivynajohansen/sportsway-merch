const csrfToken = document.head.querySelector('meta[name="csrf-token"]').content;

document.addEventListener('DOMContentLoaded', function() {
    let originalData = []; // Store original data for comparison
    let originalDetails = [];
    let changesArray = [];
    let tableContainer = document.getElementById('table-container');
    let table, uniqueKeys;
    let columnNumber = 0;
    let tempSum = [];
    let previous_year_target;

    const inflationInput = document.getElementById("inflation");
    const multiplierInput = document.getElementById("multiplier");
    const tgPercentageInput = document.getElementById("tg-percentage");
    const tgValueInput = document.getElementById("tg-value");
    const tgFinalInput = document.getElementById("tg-final");

    fetchData();

    function generateid() {
        return idv4();
    }

    function fetchData() {
        // fetch('/get-details', {
        //     method: 'GET'
        // })
        // .then(response => response.json())
        // .then(data => {
        //     originalDetails = data;
        //     previous_year_target = data.PREV_YEAR;
        //     inflationInput.value = data.INFLATION;
        //     tgPercentageInput.value = data.TARGET_GROWTH_PERCENTAGE;
        //     multiplierInput.value = tgPercentageInput.value / inflationInput.value;

        //     tgValueInput.value = ((100 + parseFloat(tgPercentageInput.value)) / 100) * previous_year_target;
        //     tgFinalInput.value = parseFloat(tgValueInput.value).toFixed(2);

            fetch('/mfp/get-target', {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                originalData = data; // Save original data
                console.log(data);
                while (tableContainer.firstChild) {
                    tableContainer.removeChild(tableContainer.firstChild);
                }
                generateTable(data);
                formatAllInputBoxes();
            })
            .catch(error => {
                console.error('Error:', error);
            });
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        // });

    }

    inflationInput.addEventListener('change', updatePercentage);
    multiplierInput.addEventListener('change', updatePercentage);

    function updatePercentage() {
        let rawValue = multiplierInput.value * inflationInput.value;
        let formattedValue = parseFloat(rawValue).toFixed(2);
        tgPercentageInput.value = formattedValue;

        tgValueInput.value = ((100 + parseFloat(tgPercentageInput.value)) / 100) * previous_year_target;
        tgFinalInput.value = parseFloat(tgValueInput.value).toFixed(2);
    }

    function generateTable(data) {
        changesArray = [];
        uniqueKeys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));

        table = document.createElement('table');
        table.classList.add('data-table');

        const thead = table.createTHead();
        const row = thead.insertRow();

        uniqueKeys.forEach(key => {
            if (key !== 'ID') {
                const th = document.createElement('th');
                const text = document.createTextNode(key);
                th.appendChild(text);
                row.appendChild(th);
                columnNumber++;
            }
        });

        //column for locking
        const th = document.createElement('th');
        const text = document.createTextNode("");
        th.style.textAlign = "center";
        th.appendChild(text);
        row.appendChild(th);
        columnNumber++;

        const tbody = document.createElement('tbody');

        data.forEach((obj, index) => {
            const tr = tbody.insertRow();
            const id = obj['ID'];

            uniqueKeys.forEach(key => {
                if (key !== 'ID') {
                    const cell = tr.insertCell();
        
                    if (key !== 'CHANNEL') {
                        
                        const input = document.createElement('input');
                        input.value = obj[key] !== undefined ? obj[key] : '';
                        cell.appendChild(input);
        
                        cell.setAttribute('data_id', id);
                        cell.setAttribute('data_column', key);
        
                        input.addEventListener('change', () => {
                            let newValue = input.value;
                            if (!isNaN(newValue)) {
                                newValue = parseFloat(newValue);
                            }
                            const columnName = cell.getAttribute('data_column');
        
                            const existingEntryIndex = changesArray.findIndex(entry => entry.id === id && entry.column === columnName);
        
                            if (existingEntryIndex !== -1) {
                                changesArray[existingEntryIndex].value = newValue;
                            } else {
                                changesArray.push({ id: id, column: columnName, value: newValue });
                            }
        
                            let columnIndex;
                            if (columnName === "PROPORTION"){
                                columnIndex = 1;
                                updateTotalSales(tr, columnIndex);
                            }
                            else if (columnName === "TOTAL_SALES"){
                                columnIndex = 2;
                                updateProportion(tr, columnIndex);
                            }
                            console.log(changesArray);
                        });
        
                        input.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter') {
                                input.blur();
                            }
                        });
                    } else {
                        // If the key is "CHANNEL", create a text node instead of an input box
                        const text = document.createTextNode(obj[key] !== undefined ? obj[key] : '');
                        cell.appendChild(text);
                    }
                }
            });

            const checkboxCell = tr.insertCell();
            const checkbox = document.createElement('input');
            checkboxCell.style.textAlign = "center";
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkboxCell.appendChild(checkbox);

            // Add an event listener to handle checkbox changes
            checkbox.addEventListener('change', () => {
                const inputs = tr.querySelectorAll('input');
                inputs.forEach(input => {
                    if (input.type != 'checkbox'){
                        input.disabled = !checkbox.checked;
                    }
                });
            });
        });

        const totalRow = tbody.insertRow();
        totalRow.classList.add('table-total');

        uniqueKeys.forEach((key, index) => {
            if (key !== 'ID' && key !== 'CHANNEL') {
                const totalCell = totalRow.insertCell();
                totalCell.setAttribute('data-column', key);
                const total = data.reduce((acc, obj) => acc + (parseFloat(obj[key]) || 0), 0);
                const text = document.createTextNode(total.toFixed(2)); // Adjust the formatting as needed
                totalCell.appendChild(text);
                tempSum[index-1] = total;

            } else if (key === 'CHANNEL') {
                const totalCell = totalRow.insertCell();
                totalCell.setAttribute('data-column', key);
                const text = document.createTextNode('Total Sales');
                totalCell.appendChild(text);
            }
        });

        const totalCell = totalRow.insertCell(); //insert empty cell for lock

        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }

    function addNewRow() {
        const newRow = table.insertRow(table.rows.length - 1);;
        const newId = generateid();
        let firstInput;
        let tr = newRow;
    
        uniqueKeys.forEach((key, index) => {
            if (key !== 'ID') {
                const cell = newRow.insertCell();
                const input = document.createElement('input');
                input.value = '';
                cell.appendChild(input);
    
                cell.setAttribute('data_id', newId);
                cell.setAttribute('data_column', key);
    
                input.addEventListener('change', () => {
                    let newValue = input.value;
                    if (!isNaN(newValue)) {
                        newValue = parseFloat(newValue);
                    }
                    const columnName = cell.getAttribute('data_column');
    
                    const existingEntryIndex = changesArray.findIndex(entry => entry.id === newId && entry.column === columnName);
    
                    if (existingEntryIndex !== -1) {
                        changesArray[existingEntryIndex].value = newValue;
                    } else {
                        changesArray.push({ id: newId, column: columnName, value: newValue });
                    }

                    let columnIndex;
                    if (columnName === "PROPORTION"){
                        columnIndex = 1;
                        updateTotalSales(tr, columnIndex);
                    }
                    else if (columnName === "TOTAL_SALES"){
                        columnIndex = 2;
                        updateProportion(tr, columnIndex);
                    }
                });
    
                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        if (index > 1) calculateSum(index - 1);
                        if (index < columnNumber) {
                            // Move focus to the next input box
                            uniqueKeys[index + 1] !== 'ID' && document.querySelector(`[data_id="${newId}"][data_column="${uniqueKeys[index + 1]}"] input`).focus();
                        } else {
                            // If it's the last input box, blur to trigger any subsequent logic
                            input.blur();
                        }
                    }
                });
    
                if (index === 1) {
                    // Set focus to the first input box
                    firstInput = input;
                }
            }
        });

        const checkboxCell = tr.insertCell();
        const checkbox = document.createElement('input');
        checkboxCell.style.textAlign = "center";
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkboxCell.appendChild(checkbox);

        // Add an event listener to handle checkbox changes
        checkbox.addEventListener('change', () => {
            const inputs = tr.querySelectorAll('input');
            inputs.forEach(input => {
                if (input.type != 'checkbox'){
                    input.disabled = !checkbox.checked;
                }
            });
        });
    
        // Focus on the first input box
        firstInput && firstInput.focus();
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
        console.log('tempSum[' + columnIndex + '] = ' + sum);

        var totalRow = table.querySelector(".table-total");
        if (totalRow) {
            var totalCols = totalRow.getElementsByTagName("td");
            if (totalCols.length > columnIndex) {
                totalCols[columnIndex].textContent = sum.toFixed(2);
            }
        }
        
    }

    function recalculate(){
        var uncheckedTotalSales = tempSum[2], uncheckedProportionLeft = 100, uncheckedProportion = 0;
        var rows = table.getElementsByTagName("tr");

        for (var i = 1; i < rows.length; i++) {
            var cols = rows[i].getElementsByTagName("td");
            var ProportionInputElement = cols[1].querySelector("input");
            var TotalSalesInputElement = cols[2].querySelector("input");
            var checkInput = cols[3].querySelector("input");

            if (ProportionInputElement && TotalSalesInputElement && checkInput.checked) {
                uncheckedProportionLeft -= parseFloat(ProportionInputElement.value) || 0;
                uncheckedTotalSales -= parseFloat(TotalSalesInputElement.value) || 0;
            }
            else if (ProportionInputElement && TotalSalesInputElement && !checkInput.checked){
                uncheckedProportion += parseFloat(ProportionInputElement.value) || 0;
            }
           
        }
      
        //recalculate all proportions
        for (var i = 1; i < rows.length; i++) {
            var cols = rows[i].getElementsByTagName("td");
            var proportionInput = cols[1].querySelector("input");
            var totalSalesInput = cols[2].querySelector("input");
            var checkInput = cols[3].querySelector("input");
        
            if (totalSalesInput && proportionInput && !checkInput.checked) {
                var proportion = (parseFloat(proportionInput.value) / uncheckedProportion) * uncheckedProportionLeft;
                console.log("Proportion= (" + parseFloat(proportionInput.value) + " / " + uncheckedProportion + ") * " + uncheckedProportionLeft);
                proportionInput.value = proportion.toFixed(2);
                totalSalesInput.value = proportion / 100 * tempSum[2];

                const id = rows[i].cells[2].getAttribute('data_id');
                const newValue = parseFloat(proportionInput.value) || 0;
                const newValue2 = parseFloat(totalSalesInput.value) || 0;

                const existingEntryIndex = changesArray.findIndex(entry => entry.id === id && entry.column === columnName);

                if (existingEntryIndex !== -1) {
                    changesArray[existingEntryIndex].value = newValue;
                } else {
                    changesArray.push({ id: id, column: 'PROPORTION', value: newValue });
                    changesArray.push({ id: id, column: 'TOTAL_SALES', value: newValue2 });
                }
            }
           
        }

        calculateSum(1);
    }

    function updateTotalSales(row, columnIndex) {
        var proportionInput = row.cells[1].querySelector("input"); //second column
        var totalSalesInput = row.cells[2].querySelector("input"); //third column
        calculateSum(columnIndex);

        if (totalSalesInput) {
            var proportion = parseFloat(proportionInput.value) || 0;
            var totalSales = (proportion / 100) * tempSum[columnIndex + 1]; 
            totalSalesInput.value = totalSales.toFixed(2);

            //changesArray
            const id = row.cells[columnIndex].getAttribute('data_id');
            const columnName = 'TOTAL_SALES';
            const newValue = parseFloat(totalSalesInput.value) || 0;

            const existingEntryIndex = changesArray.findIndex(entry => entry.id === id && entry.column === columnName);

            if (existingEntryIndex !== -1) {
                changesArray[existingEntryIndex].value = newValue;
            } else {
                changesArray.push({ id: id, column: columnName, value: newValue });
            }
        }
        // calculateSum(columnIndex + 1);
        // updateAllProportions();
        // calculateSum(columnIndex);
    }

    
    function updateProportion(row, columnIndex) {
        var totalSalesInput = row.cells[2].querySelector("input");
        var proportionInput = row.cells[1].querySelector("input");
        // calculateSum(columnIndex);
    
        if (proportionInput) {
            var totalSales = parseFloat(totalSalesInput.value) || 0;
            var proportion = (totalSales / tempSum[columnIndex]) * 100; 
            proportionInput.value = proportion.toFixed(2);

            //changesArray
            const id = row.cells[columnIndex].getAttribute('data_id');
            const columnName = 'PROPORTION';
            const newValue = parseFloat(proportionInput.value) || 0;

            const existingEntryIndex = changesArray.findIndex(entry => entry.id === id && entry.column === columnName);

            if (existingEntryIndex !== -1) {
                changesArray[existingEntryIndex].value = newValue;
            } else {
                changesArray.push({ id: id, column: columnName, value: newValue });
            }
        }
        updateAllProportions();
        calculateSum(columnIndex - 1);
    }

    function updateAllProportions() {
        var rows = table.getElementsByTagName("tr");
    
        // Update all proportion cells based on the new total sum
        for (var i = 0; i < rows.length; i++) {
            var cols = rows[i].getElementsByTagName("td");
            
            if (cols.length > 2) { // Assuming total_sales is in the third column
                var totalSalesInput = cols[2].querySelector("input");
                var proportionInput = cols[1].querySelector("input");
                var checkInput = cols[3].querySelector("input");
            
    
                if (totalSalesInput && proportionInput && checkInput.checked) {
                    
                    var totalSales = parseFloat(totalSalesInput.value) || 0;
                    var proportion = (totalSales / tempSum[2]) * 100;
                    proportionInput.value = proportion.toFixed(2);

                    //changesArray
                    const id = rows[i].cells[2].getAttribute('data_id');
                    const columnName = 'PROPORTION';
                    const newValue = parseFloat(proportionInput.value) || 0;

                    const existingEntryIndex = changesArray.findIndex(entry => entry.id === id && entry.column === columnName);

                    if (existingEntryIndex !== -1) {
                        changesArray[existingEntryIndex].value = newValue;
                    } else {
                        changesArray.push({ id: id, column: columnName, value: newValue });
                    }
                }
            }
        }
    }    
    const saveButton = document.getElementById('save-btn');
    const revertButton = document.getElementById('revert-btn');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    const addButton = document.getElementById('add-btn');
    const recalculateButton = document.getElementById('recalculate-btn');
    
    recalculateButton.addEventListener('click', () => recalculate());
    addButton.addEventListener('click', () => addNewRow());
    saveButton.addEventListener('click', () => {
        if (tempSum[1] != 100){
            displayErrorMessage('Total proportion must be 100%');
            return;
        }
        
        console.log("Updates: " + JSON.stringify(changesArray));
        enableSpinner();
        fetch('/update-target', {
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

    //details form
    const formSaveButton = document.getElementById('form-save-btn');
    const formRevertButton = document.getElementById('form-revert-btn');

    function enableFormSpinner() {
        formSaveButton.disabled = true;
        formRevertButton.disabled = true;
 
        document.getElementById('form-btn-text').style.display = 'none';
        document.getElementById('form-spinner').style.display = 'inline-block';
    }

    function disableFormSpinner(){
        formSaveButton.disabled = false;
        formRevertButton.disabled = false;
    
        document.getElementById('form-btn-text').style.display = 'inline-block';
        document.getElementById('form-spinner').style.display = 'none';
    }

    formRevertButton.addEventListener('click', () => {
        inflationInput.value = originalDetails.INFLATION;
        tgPercentageInput.value = originalDetails.TARGET_GROWTH_PERCENTAGE;
        tgValueInput.value = originalDetails.TARGET_GROWTH_VALUE;
        tgFinalInput.value = originalDetails.FINAL_TARGET_GROWTH;
        multiplierInput.value = tgPercentageInput.value / inflationInput.value;
    })

    formSaveButton.addEventListener('click', () => {
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

        enableFormSpinner();
        fetch('/update-details', {
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
        })
        .catch(error => {
            // Handle errors
            console.error('Error:', error);
        });

    })

});


