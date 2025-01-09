document.addEventListener("DOMContentLoaded", async function () {
    // Get the current HTML file name
    const currentFile = window.location.pathname.split("/").pop();
    // Determine the boolean value based on the file name
    const all = currentFile !== "myAccount.html"; // Replace "allUsers.html" with your file name
    // Call generateAccountInformation with the appropriate boolean
    await generateAccountInformation(all);
});

async function generateAccountInformation(all: boolean = false) {
    const limiter: HTMLDivElement | null = (document.getElementsByClassName("limiter"))[0] as HTMLDivElement;
    if (!limiter) {
        console.error("Element with id 'limiter' not found.");
        return;
    }

    const currentUser = getUserFromSessionStorage();
    if (!currentUser) {
        alert("You have to login first before you can see any account related information");
        return;
    }
    const fetchedUser = all ? await fetchAllUsers() : await fetchUserById(currentUser.id);
    await updateSessionOfUser(currentUser.id);
    if (isFetchResponse(fetchedUser)) return;

    if (all && Array.isArray(fetchedUser)) {
        await createUserTable(fetchedUser, limiter);
    } else if (!all && !Array.isArray(fetchedUser)) {
        await createMyAccountInformation(fetchedUser, limiter, currentUser);
    } else console.error("This shouldnt be possible");


}


async function createUserTable(users: User[], limiter: HTMLDivElement) {
    // Create a container div for the table
    const containerDiv = document.createElement("div");
    containerDiv.className = "users";

    // Add heading
    const heading = document.createElement("h2");
    heading.textContent = "Authenticated Users:";
    containerDiv.appendChild(heading);

    // Create table element
    const table = document.createElement("table");
    table.className = "userTable";

    // Add table header
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th>ID:</th>
        <th>First name:</th>
        <th>Last name:</th>
        <th>Email:</th>
        <th>Role:</th>
        <th>Total Borrowed Books:</th>
        <th>Current Borrowed Books:</th>
        <th>Account created on:</th>
        <th>Last logged in:</th>
    `;
    table.appendChild(headerRow);

    // Use for...of loop to handle async/await properly
    for (const user of users) {
        const fetchedSession = await fetchSessionByUserId(user.user_id);
        let lastUsed = "N/A";
        if (!isFetchResponse(fetchedSession)) lastUsed = formatDateString(fetchedSession.last_used.toString());

        let borrowedBooksTotal = 0;
        let activeBorrowedBooks = 0;

        const allMyBorrowRecords = await fetchAllRecordsOfUser(user.user_id);
        if (!isFetchResponse(allMyBorrowRecords)) borrowedBooksTotal = allMyBorrowRecords.length;

        const myActiveRecords = await fetchActiveRecordsOfUser(user.user_id);
        if (!isFetchResponse(myActiveRecords)) activeBorrowedBooks = myActiveRecords.length;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.first_name}</td>
            <td>${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.permissions}</td>
            <td>${borrowedBooksTotal}</td>
            <td>${activeBorrowedBooks}</td>
            <td>${formatDateString(user.created_at.toString()) || "N/A"}</td>
            <td>${lastUsed}</td>
        `;
        table.appendChild(row);
    }

    // Append the table to the container div
    containerDiv.appendChild(table);

    // Append the container div to the limiter
    limiter.appendChild(containerDiv);
}


async function createMyAccountInformation(fetchedUser: User, limiter: HTMLDivElement, currentUser: any) {
    let div = document.createElement("div");
    const fetchedSession = await fetchSessionByUserId(currentUser.id);
    let lastUsed = "N/A";
    if (!isFetchResponse(fetchedSession)) lastUsed = formatDateString(fetchedSession.last_used.toString());
    div.id = "account-information";
    div.innerHTML = `<ol>Personal ID: ${fetchedUser.user_id}</ol>
    <ol>First name: ${fetchedUser.first_name}</ol>
    <ol>Last name: ${fetchedUser.last_name}</ol>
    <ol>Email: ${fetchedUser.email}</ol>
    <ol>Role: ${fetchedUser.permissions}</ol>
    <ol>Account created on: ${formatDateString(fetchedUser.created_at.toString()) || "N/A"}</ol>
    <ol>Last logged in: ${lastUsed}</ol>
`;
    let borrowedBooksTotal = 0;
    let activeBorrowedBooks = 0;
    const allMyBorrowRecords = await fetchAllRecordsOfUser();
    if (!isFetchResponse(allMyBorrowRecords)) borrowedBooksTotal = allMyBorrowRecords.length;
    const myActiveRecords = await fetchActiveRecordsOfUser();
    if (!isFetchResponse(myActiveRecords)) activeBorrowedBooks = myActiveRecords.length;

    div.innerHTML += `<ol>Total Borrowed Books: ${borrowedBooksTotal}</ol>
    <ol>Current Borrowed Books: ${activeBorrowedBooks}</ol>`
    limiter.append(div);
}

function formatDateString(dateString: string): string {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}
