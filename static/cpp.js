// === CLEAN FT CALL LOGIC ===

function updateWorkScopeVisibility() {
    const callType = document.getElementById('dropdownCallType').value;
    const stationType = document.getElementById('stationType').value;
    const acStationModel = document.getElementById('acStationModel').value;

    const ftCallFields = document.getElementById('ftCallFields');
    const standardCallFields = document.getElementById('standardCallFields');
    const newExistingCallFields = document.getElementById('newExistingCallFields');
    const acStationOptions = document.getElementById('acStationOptions');
    const workScopeContainer = document.querySelector('.workScopeContainer');
    const doneButton = document.getElementById('doneButton');

    // Hide everything by default
    ftCallFields.classList.add('hidden');
    standardCallFields.classList.add('hidden');
    newExistingCallFields.classList.add('hidden');
    acStationOptions.classList.add('hidden');
    workScopeContainer.classList.add('hidden');
    doneButton.classList.add('hidden');

    if (callType === 'FT Call') {
        ftCallFields.classList.remove('hidden');

        if (stationType === 'AC') {
            acStationOptions.classList.remove('hidden');

            if (acStationModel === 'CT4000' || acStationModel === 'CPF') {
                workScopeContainer.classList.remove('hidden');
                doneButton.classList.remove('hidden');
            }
        }
    } else if (callType === 'Standard Call') {
        standardCallFields.classList.remove('hidden');
    } else if (['New', 'Existing', 'Assigned Case'].includes(callType)) {
        newExistingCallFields.classList.remove('hidden');
    }
}

// Bind cleanly
['dropdownCallType', 'stationType', 'acStationModel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateWorkScopeVisibility);
});

document.addEventListener('DOMContentLoaded', updateWorkScopeVisibility);
// === END FT CALL LOGIC ===


// Load saved table data from localStorage when the page loads
document.addEventListener('DOMContentLoaded', function () {
    loadTableData();
});

// Save data to localStorage
function saveTableData() {
    const tableRows = Array.from(document.querySelectorAll('#dataTable tbody tr'));
    const tableData = tableRows.map(row => {
        return Array.from(row.children).map(cell => {
            return cell.innerHTML.replace(/<ul>/g, '').replace(/<\/ul>/g, '').replace(/<li>/g, '• ').replace(/<\/li>/g, '\n').replace(/<br>/g, '\n');
        });
    });
    localStorage.setItem('tableData', JSON.stringify(tableData));
}

// Function to remove row with confirmation and backend deletion
function removeRow(button) {
    const confirmation = confirm("Are you sure you want to remove this row?");
    if (confirmation) {
        const row = button.parentNode.parentNode;
        const callLogId = button.getAttribute('data-id'); // Ensure this retrieves the correct ID

        console.log("Attempting to delete call log with ID:", callLogId);  // Diagnostic

        if (callLogId && callLogId !== "undefined") {  // Extra check for undefined
            fetch(`/logs/call_log/${callLogId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to delete call log entry");
                }
                row.parentNode.removeChild(row);  // Remove row from table
                alert("Call log entry deleted successfully");
            })
            .catch(error => {
                console.error("Error deleting call log entry:", error);
            });
        } else {
            console.error("callLogId is undefined or invalid:", callLogId);
        }
    }
}

// Load saved table data from localStorage
function loadTableData() {
    const savedData = localStorage.getItem('tableData');
    if (savedData) {
        const tableData = JSON.parse(savedData);
        const tbody = document.querySelector('#dataTable tbody');
        tbody.innerHTML = ''; // Clear existing rows

        tableData.forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach(cellData => {
                const cell = document.createElement('td');
                cell.innerHTML = cellData.replace(/\n/g, '<br>'); // Preserve formatting as HTML
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
    }
}

// Case number validation: only allow 8 digits and numbers
document.getElementById('text1').addEventListener('input', function (e) {
    const value = e.target.value;

    // Remove any non-digit characters
    e.target.value = value.replace(/\D/g, '');

    // Ensure the input is limited to 8 digits
    if (e.target.value.length > 8) {
        e.target.value = e.target.value.slice(0, 8);
    }
});

// Phone number validation: only allow 10 digits
document.getElementById('phoneNumber').addEventListener('input', function (e) {
    const value = e.target.value;

    // Remove any non-digit characters
    e.target.value = value.replace(/\D/g, '');

    // Ensure the input is limited to 10 digits
    if (e.target.value.length > 10) {
        e.target.value = e.target.value.slice(0, 10);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    loadTableData();
    // The line below was hiding the work scope container even when it should be visible.
    // It's removed as updateWorkScopeVisibility handles the initial state correctly.
    // document.querySelector('.workScopeContainer').classList.add('hidden');
});





// Run visibility check on all relevant changes

// Toggle work scope fields based on checkbox selection
document.querySelectorAll('.workScopeCheckbox').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        const selectedScopes = getSelectedWorkScopes();
        const countryFields = document.getElementById('countryFields');
        const wiringVoltageFields = document.getElementById('wiringVoltageFields');
        const headSwapFields = document.getElementById('headSwapFields');

        // Toggle the visibility of the fields based on selected scopes
        if (selectedScopes.includes('Cellular Survey')) {
            countryFields.classList.remove('hidden');
        } else {
            countryFields.classList.add('hidden');
        }

        if (selectedScopes.includes('Wiring and Voltage verification')) {
            wiringVoltageFields.classList.remove('hidden');
        } else {
            wiringVoltageFields.classList.add('hidden');
        }

        if (selectedScopes.includes('Head Swap')) {
            headSwapFields.classList.remove('hidden'); // Show Head Swap fields
        } else {
            headSwapFields.classList.add('hidden'); // Hide Head Swap fields
        }
    });
});

// Function to get selected work scopes
function getSelectedWorkScopes() {
    const selectedScopes = [];
    document.querySelectorAll('.workScopeCheckbox:checked').forEach(checkbox => {
        selectedScopes.push(checkbox.value);
    });
    return selectedScopes;
}

// Toggle carrier fields based on country selection
document.getElementById('country').addEventListener('change', function () {
    const country = this.value;
    const usCarriers = document.getElementById('usCarriers');
    const canadaCarriers = document.getElementById('canadaCarriers');

    if (country === 'US') {
        usCarriers.classList.remove('hidden');
        canadaCarriers.classList.add('hidden');
    } else if (country === 'Canada') {
        canadaCarriers.classList.remove('hidden');
        usCarriers.classList.add('hidden');
    } else {
        usCarriers.classList.add('hidden');
        canadaCarriers.classList.add('hidden');
    }
});

// Function to get carrier details with dBm
function getCarrierDetails(country) {
    let carrierDetails = '';
    if (country === 'US') {
        const tMobileDbm = document.getElementById('tMobileDbm').value;
        const attDbm = document.getElementById('attDbm').value;
        const verizonDbm = document.getElementById('verizonDbm').value;
        carrierDetails = `T-Mobile: ${tMobileDbm} dBm\nAT&T: ${attDbm} dBm\nVerizon: ${verizonDbm} dBm`;
    } else if (country === 'Canada') {
        const bellDbm = document.getElementById('bellDbm').value;
        const rogersDbm = document.getElementById('rogersDbm').value;
        const telusDbm = document.getElementById('telusDbm').value;
        carrierDetails = `Bell: ${bellDbm} dBm\nRogers: ${rogersDbm} dBm\nTelus: ${telusDbm} dBm`;
    }
    return carrierDetails;
}

document.getElementById('wireSetup').addEventListener('change', function () {
    const wireSetup = this.value;
    const threeWireFields = document.getElementById('threeWireFields');
    const fiveWireFields = document.getElementById('fiveWireFields');

    if (wireSetup === '3-wire') {
        threeWireFields.classList.remove('hidden');
        fiveWireFields.classList.add('hidden');
    } else if (wireSetup === '5-wire') {
        fiveWireFields.classList.remove('hidden');
        threeWireFields.classList.add('hidden');
    } else {
        // Hide both if no valid selection is made
        threeWireFields.classList.add('hidden');
        fiveWireFields.classList.add('hidden');
    }
});

// Generate Wiring and Voltage verification details
function generateWiringVoltageDetails() {
    const wireSetup = document.getElementById('wireSetup').value;
    let result = '';

    if (wireSetup === '3-wire') {
        const breakers = document.getElementById('threeBreakers').value;
        //const voltageAtBreakers = document.getElementById('threeVoltageAtBreakers').value;
        const jumpersConnected = document.getElementById('threeJumpersConnected').value;
        const connectorCondition = document.getElementById('threeConnectorCondition').value;
        //const neutralBonding = document.getElementById('threeNeutralBonding').value;
        const l1rL2r = document.getElementById('threeL1RL2R').value;
        const l1rGND = document.getElementById('threeL1RGND').value;
        const l2rGND = document.getElementById('threeL2RGND').value;
        const impedance = document.getElementById('threeImpedance').value;
        const wireGauge = document.getElementById('threeWireGauge').value;

        result += `
            <ul>
            <h4>Voltage and Wiring checks:</h4>
                <li>Is this a 3-wire or 5-wire setup?: 3 wire setup</li>
                <li>Voltage at Jumpers: ${jumpersConnected}</li>
                <li>Condition of Breakers: ${breakers}</li>
                <li>Jumpers Connected: ${jumpersConnected}</li>
                <li>Electrical Connector Condition: ${connectorCondition}</li>
                <li>Voltage Readings (L1R-L2R): ${l1rL2r}</li>
                <li>Voltage Readings (L1R-GND): ${l1rGND}</li>
                <li>Voltage Readings (L2R-GND): ${l2rGND}</li>
                <li>Impedance Measurement: ${impedance}</li>
                <li>Wire Gauge Used: ${wireGauge}</li>
            </ul>
        `;
    } else if (wireSetup === '5-wire') {
        const breakers = document.getElementById('fiveBreakers').value;
        //const voltageAtBreakers = document.getElementById('fiveVoltageAtBreakers').value;
        const connectorCondition = document.getElementById('fiveConnectorCondition').value;
        //const neutralBonding = document.getElementById('fiveNeutralBonding').value;
        const l1rL2r = document.getElementById('fiveL1RL2R').value;
        const l1lL2l = document.getElementById('fiveL1LL2L').value;
        const l1rGND = document.getElementById('fiveL1RGND').value;
        const l2rGND = document.getElementById('fiveL2RGND').value;
        const l1lGND = document.getElementById('fiveL1LGND').value;
        const l2lGND = document.getElementById('fiveL2LGND').value;
        const impedance = document.getElementById('fiveImpedance').value;
        const wireGauge = document.getElementById('fiveWireGauge').value;

        result += `
            <ul>
             <h4>Voltage and Wiring checks:</h4>
                <li>Is this a 3-wire or 5-wire setup?: 5 wire setup</li>
                <li>Condition of Breakers: ${breakers}</li>
                <li>Electrical Connector Condition: ${connectorCondition}</li>
                <li>Voltage Readings (L1R-L2R): ${l1rL2r}</li>
                <li>Voltage Readings (L1L-L2L): ${l1lL2l}</li>
                <li>Voltage Readings (L1R-GND): ${l1rGND}</li>
                <li>Voltage Readings (L2R-GND): ${l2rGND}</li>
                <li>Voltage Readings (L1L-GND): ${l1lGND}</li>
                <li>Voltage Readings (L2L-GND): ${l2lGND}</li>
                <li>Impedance Measurement: ${impedance}</li>
                <li>Wire Gauge Used: ${wireGauge}</li>
                <>
            </ul>
        `;
    }

    return result;
}

document.getElementById('addToTable').addEventListener('click', async function () {
    const caseNumber = document.getElementById('text1').value.trim();
    const customerName = document.getElementById('text2').value.trim();
    const callType = document.getElementById('dropdownCallType').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const stationName = document.getElementById('stationName').value.trim();
    let sdi = '';
    let workScopeDetails = '';
    let points = 0;

    // Retrieve issue description content from Quill editor
    let issueDescription = quill.root.innerHTML.trim();

    // Check if issueDescription is empty and handle accordingly
    if (!issueDescription) {
        issueDescription = "No description provided";
    }

    // Validation for required fields
    const missingFields = [];
    if (!caseNumber) missingFields.push("Case Number");
    if (!callType) missingFields.push("Call Type");

    // If there are missing fields, alert the user and stop execution
    if (missingFields.length > 0) {
        alert("Please enter required fields: " + missingFields.join(", "));
        return;
    }

 const manualDateInput = document.getElementById('manualDate').value;
let timestamp = "";

if (manualDateInput) {
    // Parse local datetime and convert it to PST by formatting in UTC and offsetting manually
    const localDate = new Date(manualDateInput);
    const pstDate = new Date(localDate.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));

    timestamp = pstDate.getFullYear() + '-' +
        String(pstDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(pstDate.getDate()).padStart(2, '0') + ' ' +
        String(pstDate.getHours()).padStart(2, '0') + ':' +
        String(pstDate.getMinutes()).padStart(2, '0') + ':' +
        String(pstDate.getSeconds()).padStart(2, '0');

} else {
    // Use current PST time if no input
    const now = new Date();
    const pstNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));

    timestamp = pstNow.getFullYear() + '-' +
        String(pstNow.getMonth() + 1).padStart(2, '0') + '-' +
        String(pstNow.getDate()).padStart(2, '0') + ' ' +
        String(pstNow.getHours()).padStart(2, '0') + ':' +
        String(pstNow.getMinutes()).padStart(2, '0') + ':' +
        String(pstNow.getSeconds()).padStart(2, '0');
}


    // Check call type and get appropriate fields
    if (callType === 'FT Call') {
        const selectedWorkScopes = getSelectedWorkScopes();
        const country = document.getElementById('country').value;
        const carrierDetails = getCarrierDetails(country);

        if (selectedWorkScopes.includes('Wiring and Voltage verification')) {
            workScopeDetails += `<strong>Station: ${stationName}</strong><br>`;
            workScopeDetails += generateWiringVoltageDetails();
        }
        if (selectedWorkScopes.includes('Cellular Survey')) {
            workScopeDetails += `<strong>Station: ${stationName}</strong><br>`;
            workScopeDetails += `
                <ul>
                    <li>Cellular Survey performed</li>
                    <li>Country: ${country}</li>
                    <li>Carriers:<br>${carrierDetails.replace(/\n/g, '<br>')}</li>
                </ul>`;
        }
        if (selectedWorkScopes.includes('Head Swap')) {
            const callerInfo = document.getElementById('callerInfo').value;
            const oldMac = document.getElementById('oldMac').value;
            const newMac = document.getElementById('newMac').value;
            const swapCompleted = document.getElementById('swapCompleted').value;
            const simActivated = document.getElementById('simActivated').value;
            const stationStatus = document.getElementById('stationStatus').value;
            const networkStatus = document.getElementById('networkStatus').value;
            const signalStrength = document.getElementById('signalStrength').value;

            workScopeDetails += `<strong>Station: ${stationName}</strong><br>`;
            workScopeDetails += `
                <ul>
                    <li>Caller Info: ${callerInfo}</li>
                    <li>Old MAC: ${oldMac}</li>
                    <li>New MAC: ${newMac}</li>
                    <li>Swap Completed in NOS: ${swapCompleted}</li>
                    <li>SIM Activated: ${simActivated}</li>
                    <li>Station Status: ${stationStatus}</li>
                    <li>Network Status: ${networkStatus}</li>
                    <li>Signal Strength: ${signalStrength}</li>
                </ul>`;
        }

        sdi = 'N/A';
        points = 1;  // Set points to 1 for FT Call
    } else if (callType === 'New') {
        sdi = document.getElementById('sdi').value;
        points = 1;
    } else if (callType === 'Existing') {
        sdi = document.getElementById('sdi').value;
        points = 0.25;
    } else if (callType === 'Assigned Case') {
        sdi = document.getElementById('sdi').value;
        points = 1;
    } else {
        sdi = document.getElementById('dropdown1').value;
        points = 1;
    }

    // Combine workScopeDetails with issueDescription
    issueDescription = `${workScopeDetails}<br><strong>Issue Description:</strong> ${issueDescription}`;

    // Prepare call log entry including timestamp
    const callLogEntry = {
        timestamp: timestamp,
        case_number: caseNumber,
        phone_number: phoneNumber,
        station_name: stationName,
        customer_name: customerName,
        call_type: callType,
        sdi: sdi,
        issue_description: issueDescription,
        points: points
    };

    try {
        // Send the entry to the backend to create or update
        const response = await fetch('/logs/call_log/update_or_create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(callLogEntry)
        });

        if (response.ok) {
            alert("Call log entry processed successfully");
            // Reload table data after updating to reflect the changes without duplication
            loadTableDataFromDatabase();
        } else {
            alert("Failed to process call log entry");
        }
    } catch (error) {
        console.error("Error processing call log entry:", error);
    }
});


// Function to load data from the database and display it in the table
async function loadTableDataFromDatabase() {
    try {
        const response = await fetch('/logs/call_log/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error("Failed to fetch call logs");

        const callLogs = await response.json();
        const tbody = document.querySelector('#dataTable tbody');
        tbody.innerHTML = '';  // Clear existing rows

        callLogs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><button class="delete-btn" onclick="removeRow(this)" data-id="${log.id}">−</button></td>
                <td>${log.timestamp || ''}</td>
                <td>${log.case_number}</td>
                <td>${log.phone_number}</td>
                <td>${log.station_name}</td>
                <td>${log.customer_name}</td>
                <td>${log.call_type}</td>
                <td>${log.sdi || ''}</td>
                <td>${log.issue_description || ''}</td>
                <td>${log.points}</td>
            `;
            console.log("Adding button with data-id:", log.id);  // Diagnostic
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading call logs:", error);
    }
}


document.addEventListener('DOMContentLoaded', function () {
    loadTableDataFromDatabase();
});

document.getElementById('doneButton').addEventListener('click', function () {
    const confirmDataAdded = confirm("Have you added the data to the table?");
    if (!confirmDataAdded) {
        return; // Exit if user says No/Cancel
    }

    const caseNumber = document.getElementById('text1').value;
    if (caseNumber !== '') {
        alert('Work scopes for FT Call completed. All fields will be cleared.');
        document.getElementById('text1').value = ''; // Clear case number
    }

    window.location.reload(); // Refresh the page after Done
});

// Generate summary
document.getElementById('generateSummary').addEventListener('click', function () {
    const caseNumber = document.getElementById('text1').value;
    const customerName = document.getElementById('text2').value;
    const callType = document.getElementById('dropdownCallType').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const stationName = document.getElementById('stationName').value;

    let sdi = '';
    let issueType = '';

    // Retrieve the content from Quill editor
    let issueDescription = quill.root.innerHTML.trim();  // Make sure to get content from Quill

    // Check if issueDescription is empty, and handle accordingly
    if (!issueDescription) {
        issueDescription = "No description provided";
    }

    // Check call type and get appropriate fields
    if (callType === 'FT Call') {
        const selectedWorkScopes = getSelectedWorkScopes();
        const country = document.getElementById('country').value;
        const carrierDetails = getCarrierDetails(country);

        if (selectedWorkScopes.includes('Wiring and Voltage verification')) {
            issueDescription += generateWiringVoltageDetails();
        }
        if (selectedWorkScopes.includes('Cellular Survey')) {
            issueDescription += `
                <ul>
                    <li>Cellular Survey performed</li>
                    <li>Country: ${country}</li>
                    <li>Carriers:<br>${carrierDetails.replace(/\n/g, '<br>')}</li>
                </ul>`;
        }
        if (selectedWorkScopes.includes('Head Swap')) {
            const callerInfo = document.getElementById('callerInfo').value;
            const oldMac = document.getElementById('oldMac').value;
            const newMac = document.getElementById('newMac').value;
            const swapCompleted = document.getElementById('swapCompleted').value;
            const simActivated = document.getElementById('simActivated').value;
            const stationStatus = document.getElementById('stationStatus').value;
            const networkStatus = document.getElementById('networkStatus').value;
            const signalStrength = document.getElementById('signalStrength').value;

            issueDescription += `
                <ul>
                    <li>Caller Info: ${callerInfo}</li>
                    <li>Old MAC: ${oldMac}</li>
                    <li>New MAC: ${newMac}</li>
                    <li>Swap Completed in NOS: ${swapCompleted}</li>
                    <li>SIM Activated: ${simActivated}</li>
                    <li>Station Status: ${stationStatus}</li>
                    <li>Network Status: ${networkStatus}</li>
                    <li>Signal Strength: ${signalStrength}</li>
                </ul>`;
        }
        sdi = 'N/A';
        issueType = 'Work Order';
    } else if (callType === 'New' || callType === 'Existing' || callType === 'Assigned Case') {
        sdi = document.getElementById('sdi').value;
        issueType = document.getElementById('issueType').value;
    } else {
        sdi = document.getElementById('dropdown1').value;
        issueType = document.getElementById('dropdownIssueType').value;
    }

    // Construct the summary with formatted Issue Description
    const summary = `
        <b>Case Number:</b> ${caseNumber}<br>
        <b>Phone Number:</b> ${phoneNumber}<br>
        <b>Station Name:</b> ${stationName}<br>
        <b>Customer Name:</b> ${customerName}<br>
        <b>Call Type:</b> ${callType}<br>
        <b>SDI:</b> ${sdi}<br>
        <b>Issue Type:</b> ${issueType}<br>
        <b>Issue Description:</b><br>${issueDescription}
    `.trim();


    // Display the summary container with formatted content
    document.getElementById('summaryContainer').classList.remove('hidden');
    document.getElementById('output').innerHTML = summary;  // Display summary with HTML formatting
});


// Clear all fields and delete all logs in the backend for the user
document.getElementById('clearFields').addEventListener('click', async function () {
    const userConfirmation = confirm("Are you sure you want to clear all fields and delete all logs?");
    if (userConfirmation) {
        // Clear input fields
        document.getElementById('text1').value = '';
        document.getElementById('phoneNumber').value = '';
        document.getElementById('text2').value = '';
        document.getElementById('stationName').value = '';
        document.getElementById('dropdownCallType').value = 'Standard Call';
        document.getElementById('sdi').value = 'N/A';
        document.getElementById('issueType').value = 'General';
        // Clear Quill editor content
        if (quill) {
            quill.setContents([{ insert: '\n' }]);
        }
        document.getElementById('manualDate').value = '';
        
        // Clear table and localStorage
        document.querySelector('#dataTable tbody').innerHTML = '';
        localStorage.removeItem('tableData');

        // Send DELETE request to clear all logs for the user on the backend
        try {
            const response = await fetch('/logs/call_log/clear_all/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert("All call logs cleared successfully");
            } else {
                throw new Error("Failed to clear call logs");
            }
        } catch (error) {
            console.error("Error clearing call logs:", error);
            alert("Error clearing call logs. Please try again.");
        }
    }
});


// Calculate total productivity points
document.getElementById('calculateProductivity').addEventListener('click', function () {
    let totalPoints = 0;
    const rows = document.querySelectorAll('#dataTable tbody tr');

    rows.forEach(row => {
        const pointsCell = row.querySelector('td:nth-child(10)'); // Adjusted to 10th column for Points
        const points = parseFloat(pointsCell.textContent) || 0; // Ensure points are a valid number
        totalPoints += points; // Add up points for each row
    });

    document.getElementById('productivityOutput').textContent = `Total Productivity Achieved: ${totalPoints.toFixed(2)}`;
});


document.getElementById('generateExcel').addEventListener('click', function () {
    const table = document.getElementById('dataTable');
    const rows = Array.from(table.querySelectorAll('tr'));
    
    // Create a new array to store the table data without the "Remove" column
    const data = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        return cells.slice(1).map(cell => cell.innerText); // Exclude the first column (Remove button)
    });

    // Create a new worksheet and add data to it
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Write the workbook and trigger download
    XLSX.writeFile(workbook, 'CallLog.xlsx');
});

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const closeButton = document.createElement('span');
    
    // Set up the toast class based on type
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<strong>${capitalize(type)}:</strong> ${message}`;
    
    // Configure close button
    closeButton.className = 'toast-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => toast.remove();
    
    // Append close button to toast and toast to container
    toast.appendChild(closeButton);
    toastContainer.appendChild(toast);
    
    // Automatically remove the toast after 4 seconds
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Helper function to capitalize the first letter of the toast type
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}