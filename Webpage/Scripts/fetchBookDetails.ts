document.addEventListener("DOMContentLoaded", async function () {
    try {
        // get the current url
        const urlParams = new URLSearchParams(window.location.search);
        // extract the book id out of the parameters
        const bookId = parseInt(urlParams.get('bookId')!);

        let book = await fetchBook(bookId);

        // check if the user (if one is logged in) already has a copy of the book borrowed
        const user = getUserFromSessionStorage();

        const currentBorrowRecord = await fetchBorrowRecordForBook(bookId, user);
        // Get the table body where rows will be inserted
        const bookDetailsContainer: HTMLDivElement | null = document.getElementById("book-details-container") as HTMLDivElement | null;
        if (!bookDetailsContainer) {
            console.warn("No book-details-container div found.");
            return;
        }
        if (!book) {
            console.warn("Book not found");
            return;
        }
        if (!currentBorrowRecord) console.warn("Current Borrow Record not found");
        if (isFetchResponse(book) || isFetchResponse(currentBorrowRecord)) return;
        generateBookDetails(bookDetailsContainer, book, currentBorrowRecord);

    } catch (error) {
        console.error("Failed to fetch book:", error);
    }
});

/**
 * Generated the book information that appears after clicking on a book.
 * @param bookDetailsContainer the book container to edit
 * @param book the book object to get info from
 * @param currentBorrowRecord the borrow record from the db.
 */
function generateBookDetails(bookDetailsContainer: HTMLDivElement, book: Book, currentBorrowRecord: BorrowRecord | null) {
    bookDetailsContainer.innerHTML = `
            <img src="${book.cover_url}" alt="book cover" height="300px">
            <h1>${book.title}</h1>
            <div class="rating-container">
                <img src="Images/${getStarImageName(1, book.average_rating)}" alt="star">
                <img src="Images/${getStarImageName(2, book.average_rating)}" alt="star">
                <img src="Images/${getStarImageName(3, book.average_rating)}" alt="star">
                <img src="Images/${getStarImageName(4, book.average_rating)}" alt="star">
                <img src="Images/${getStarImageName(5, book.average_rating)}" alt="star">
                <p>(${book.count_rating} Reviews)</p>
            </div>
            <div class="borrow-button-container">
                <button id="btn-borrow" ${currentBorrowRecord !== null || book.available_copies! <= 0 ? 'disabled' : ''} onclick="borrowBook(${book.book_id})">Borrow</button>
                <button id="btn-reserve" ${currentBorrowRecord !== null ? 'disabled' : ''}>Reserve</button>
                ${currentBorrowRecord ? `<button id="btn-return">Return</button>` : ``}
            </div>
            <p>${book.description}</p>
            
            <h3>Information about the book:</h3>
            <p><b>ISBN:</b> ${book.isbn}</p>
            <p><b>Author:</b> ${book.author}</p>
            <p><b>Publisher:</b> ${book.publisher ?? "unknown"}</p>
            <p><b>Language:</b> ${book.language_code ?? "unknown"}</p>
            <p><b>Version:</b> ${book.edition ?? 1}</p>
            <p><b>Release:</b> ${book.year ?? "unknown"}</p> 
            <br>`;

    if (!currentBorrowRecord) {
        // Doesn't make sense to show this message to someone who has already borrowed the book...
        bookDetailsContainer.innerHTML += `<h3>Information for borrowing the book:</h3>
                <p><b>Total Copies:</b> ${book.total_copies}</p>
                <p><b>Available Copies:</b> ${book.available_copies}</p>
                <p>If there is no copy available to borrow, you can reserve one instead.</p>
                <br>`;
        return;
    }
    const returnInfoParagraph = document.createElement('p');
    returnInfoParagraph.className = 'return-info';
    returnInfoParagraph.innerHTML = `<b>Return date:</b> ${formatDateWithoutTime(currentBorrowRecord.return_date.toString())}`;
    bookDetailsContainer.appendChild(returnInfoParagraph);
}