// Dummy data for users and their call logs
const usersData = [
    {
        username: "John Doe",
        email: "john@example.com",
        callLogs: [
            { date: "2025-01-05", caseNumber: "12345678", callType: "Standard Call", points: 1.0 },
            { date: "2025-01-05", caseNumber: "22334455", callType: "FT Call", points: 1.5 },
        ],
    },
    {
        username: "Jane Smith",
        email: "jane@example.com",
        callLogs: [
            { date: "2025-01-05", caseNumber: "87654321", callType: "New Call", points: 0.5 },
            { date: "2025-01-06", caseNumber: "99887766", callType: "Existing Call", points: 0.25 },
        ],
    },
    {
        username: "Alice Johnson",
        email: "alice@example.com",
        callLogs: [
            { date: "2025-01-06", caseNumber: "33334444", callType: "FT Call", points: 2.0 },
        ],
    },
    {
        username: "Bob Brown",
        email: "bob@example.com",
        callLogs: [
            { date: "2025-01-06", caseNumber: "55556666", callType: "Standard Call", points: 0.75 },
        ],
    },
];

// Populate user tables dynamically
function populateUserTables() {
    const container = document.getElementById("user-tables-container");
    container.innerHTML = ""; // Clear existing tables

    usersData.forEach(user => {
        // Calculate total productivity
        const totalPoints = user.callLogs.reduce((sum, log) => sum + log.points, 0);

        // Create a container for the user's call log table
        const userTableDiv = document.createElement("div");
        userTableDiv.classList.add("user-table");

        // Add user header
        const userHeader = document.createElement("h3");
        userHeader.textContent = `${user.username} (${user.email})`;
        userTableDiv.appendChild(userHeader);

        // Create table for user
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Case Number</th>
                    <th>Call Type</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
                ${user.callLogs.map(log => `
                    <tr>
                        <td>${log.date}</td>
                        <td>${log.caseNumber}</td>
                        <td>${log.callType}</td>
                        <td>${log.points}</td>
                    </tr>
                `).join("")}
                <tr class="total-row">
                    <td colspan="3" style="font-weight: bold; text-align: right;">Total Productivity:</td>
                    <td style="font-weight: bold;">${totalPoints.toFixed(2)}</td>
                </tr>
            </tbody>
        `;
        userTableDiv.appendChild(table);

        // Append user table to container
        container.appendChild(userTableDiv);
    });
}

// Populate the summary table
function populateSummaryTable(filterDate = "") {
    const summaryTableBody = document.querySelector("#summary-table tbody");
    summaryTableBody.innerHTML = ""; // Clear existing rows

    usersData.forEach(user => {
        // Filter call logs based on date
        const filteredLogs = user.callLogs.filter(log => !filterDate || log.date === filterDate);
        const numberOfCases = filteredLogs.length;

        // Add a row for each user if they have logs
        if (numberOfCases > 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${filterDate || "All Dates"}</td>
                <td>${numberOfCases}</td>
            `;
            summaryTableBody.appendChild(row);
        }
    });
}

// Filter call logs by date and update both tables
document.getElementById("filter-btn").addEventListener("click", () => {
    const filterDate = document.getElementById("filter-date").value;

    // Update user data with filtered call logs
    usersData.forEach(user => {
        user.callLogs = user.callLogs.filter(log => !filterDate || log.date === filterDate);
    });

    // Refresh tables
    populateSummaryTable(filterDate);
    populateUserTables();
});

// Initialize tables on page load
document.addEventListener("DOMContentLoaded", () => {
    populateSummaryTable(); // Populate the summary table
    populateUserTables(); // Populate user call log tables
});
