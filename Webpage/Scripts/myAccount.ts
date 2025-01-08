async function generateMyAccountInformation() {
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
    const fetchedUser = await fetchUserById(currentUser.id);
    if (isFetchResponse(fetchedUser)) return;
    const fetchedSession = await fetchSessionByUserId(currentUser.id);
    if (isFetchResponse(fetchedSession)) return;

    let div = document.createElement("div");
    div.id = "account-information";
    div.innerHTML = `<ol>Personal ID: ${fetchedUser.user_id}</ol>
    <ol>First name: ${fetchedUser.first_name}</ol>
    <ol>Last name: ${fetchedUser.last_name}</ol>
    <ol>Email: ${fetchedUser.email}</ol>
    <ol>Role: ${fetchedUser.permissions}</ol>
    <ol>Account created on: ${fetchedUser.created_at || "N/A"}</ol>
    <ol>Last logged in: ${fetchedSession.last_used || "N/A"}</ol>
`;
    let borrowedBooksTotal = 0;
    let activeBorrowedBooks = 0;
    const allMyBorrowRecords = await fetchAllMyRecords();
    if (!isFetchResponse(allMyBorrowRecords)) borrowedBooksTotal = allMyBorrowRecords.length;
    const myActiveRecords = await fetchMyActiveRecords();
    if (!isFetchResponse(myActiveRecords)) activeBorrowedBooks = myActiveRecords.length;

    div.innerHTML += `<ol>Total Borrowed Books: ${borrowedBooksTotal}</ol>
    <ol>Current Borrowed Books: ${activeBorrowedBooks}</ol>`
    /*
        <ol>Total Borrowed Books: ${fetchedUser.totalBorrowedBooks || "N/A"}</ol>
    <ol>Current Borrowed Books: ${fetchedUser.currentBorrowedBooks || "N/A"}</ol>

     */
    limiter.append(div);
}

document.addEventListener("DOMContentLoaded", async function () {
    await generateMyAccountInformation();
});