document.addEventListener("DOMContentLoaded", async function () {
    await generateTable();
});

async function generateTable() {
    const limiter: HTMLDivElement | null = document.querySelector(".limiter");
    if (!limiter) {
        console.error("Element with class 'limiter' not found.");
        return;
    }

    const tableContainer = document.createElement("div");
    tableContainer.className = "borrowedBooks";
    const table = document.createElement("table");
    table.className = "borrowedBooksTable";
    const heading = document.createElement("h2");
    heading.textContent = "All borrowed books:";
    tableContainer.appendChild(heading);
    // Create the table header row
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th>ID:</th>
        <th>Borrow Date:</th>
        <th>Return Date:</th>
        <th>Status:</th>
        <th>Book-Info:</th>
        <th>Book Exemplar ID:</th>
        <th>User-Info:</th>
    `;
    table.appendChild(headerRow);

    const borrowRecords = await fetchAllBorrowRecords();
    if (isFetchResponse(borrowRecords)) {
        console.error("An error occurred while fetching data.");
        return;
    }

    if (borrowRecords.length === 0) {
        console.log("No borrowed books data found.");
        return;
    }
    // Populate the table with rows from the fetched data
    borrowRecords.forEach((record) => {
        const row = document.createElement("tr");

        // You can format the dates if needed (example: using toLocaleString or similar)
        const formattedBorrowDate = new Date(record.borrow_date).toLocaleString();
        const formattedReturnDate = new Date(record.return_date).toLocaleString();

        row.innerHTML = `
            <td>${record.borrow_record_id}</td>
            <td>${formattedBorrowDate}</td>
            <td>${formattedReturnDate}</td>
            <td>${record.status}</td>
            <td>ID: ${record.book_copy.book.book_id}, ${record.book_copy.book.title}</td>
            <td>${record.book_copy.book_copy_id}</td>
            <td>ID: ${record.user.user_id}, ${record.user.first_name} ${record.user.last_name}</td>
        `;
        table.appendChild(row);
    });

    // Append the table to the table container
    tableContainer.appendChild(table);

    // Append the table container to the limiter div
    limiter.appendChild(tableContainer);

}