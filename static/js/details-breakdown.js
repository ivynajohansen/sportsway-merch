const csrfToken = document.head.querySelector('meta[name="csrf-token"]').content;

document.addEventListener('DOMContentLoaded', function() {
    let originalData = []; // Store original data for comparison
    let tableContainer = document.getElementById('table-container');
    let table, uniqueChannels, uniqueMonths, channelData;
    let tempSum = [];
    let columnNumber = 0;

    let originalFilter = ['APPAREL', 'BAGS', 'FOOTWEAR', 'HEADWEAR'];
    let filter = originalFilter;

    var checkboxes = document.querySelectorAll('.filter-container input[type="checkbox"]');

    function fetchData() {
        disableCheckbox();
        const params = new URLSearchParams();
        params.append('filter', JSON.stringify(filter));

        fetch(`/mfp/get-details-breakdown?${params.toString()}`, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                originalData = data; // Save original data
                while (tableContainer.firstChild) {
                    tableContainer.removeChild(tableContainer.firstChild);
                }
                generateTable(data);
                enableCheckbox();
            })
            .catch(error => {
                console.error('Error:', error);
                enableCheckbox();
            });
    }

    function generateTable(data) {
        changesArray = [];
        uniqueChannels = Array.from(new Set(data.map(obj => obj['channel_group'])));
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
        //
    
        uniqueChannels.forEach(channel => {
            const channelHeaderCell = document.createElement('th');
            channelHeaderCell.colSpan = 1;
            const channelHeaderText = document.createTextNode(channel);
            channelHeaderCell.appendChild(channelHeaderText);
            channelHeaderRow.appendChild(channelHeaderCell);
        });
    
        const tbody = document.createElement('tbody');
    
        uniqueMonths.forEach(month => {
            const monthRow = tbody.insertRow();
            const monthCell = monthRow.insertCell();
            const monthText = document.createTextNode(month);
            monthCell.appendChild(monthText);

         
            uniqueChannels.forEach((channel, index) => {
                index++;
                channelData = data.find(obj => obj['channel_group'] === channel && getMonthName(obj['PERIOD']) === month);
                const monthlyTargetCell = monthRow.insertCell();
                // const monthlyTargetInput = document.createElement('input');
                monthlyTargetCell.textContent = (channelData && channelData['total_monthly_target'] !== undefined) ? formatNumber(channelData['total_monthly_target']) : '';
                // monthlyTargetCell.appendChild(monthlyTargetInput);
            });
        });
    
        // Add the total row
        const totalRow = tbody.insertRow();
        const totalCell = totalRow.insertCell();
        totalCell.colSpan = 1;
        totalCell.textContent = 'Total';
        totalRow.classList.add('table-total');
    
        uniqueChannels.forEach(() => {
            const totalValueCell = totalRow.insertCell();
            totalValueCell.classList.add('proportion-input');
    
            let totalValue = 0;
            totalValueCell.textContent = formatNumber(totalValue);
            columnNumber += 1;
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
                var inputElement = cols[columnIndex];
                // console.log(inputElement);
                if (inputElement) {
                    sum += parseFloat(inputElement.textContent) || 0;
                   
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

    const selectAll = document.getElementById("allCheckbox");

    selectAll.addEventListener('change', function() {
        var checkboxes = document.querySelectorAll('.filter-container input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
            checkbox.checked = selectAll.checked;
        });
    });

    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            updateFilter(checkbox);
            if (!checkbox.checked){
                selectAll.checked = false;
            }
        });
    });

    function updateFilter(checkbox) {
        const value = checkbox.id; // Assuming checkbox ids are uppercase
        if (checkbox.id != "allCheckbox"){
            if (checkbox.checked && !filter.includes(value)) {
                filter.push(value);
            } else if (!checkbox.checked && filter.includes(value)) {
                filter = filter.filter(item => item !== value);
            }
        
            console.log("Current filter:", filter);
        }
        else{
            if (checkbox.checked){
                filter = originalFilter;
            }
            else {
                filter = [];
            }
            console.log("Current filter:", filter);
        }   

        fetchData();
    }

    function disableCheckbox(){
        checkboxes.forEach(function(checkbox) {
            checkbox.disabled = true;
        });
    }

    function enableCheckbox(){
        checkboxes.forEach(function(checkbox) {
            checkbox.disabled = false;
        });
    }
});


