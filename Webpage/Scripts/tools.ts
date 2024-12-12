/**
 * Formats a date string into a human-readable format without the time.
 *
 * The function converts an ISO 8601 date string into a format like "December 19, 2024".
 *
 * @param {string} dateString - The ISO 8601 date string to format (e.g., "2024-12-19T20:56:10.000Z").
 * @returns {string} - The formatted date string without the time.
 *
 * @example
 * const formattedDate = formatDateWithoutTime("2024-12-19T20:56:10.000Z");
 * console.log(formattedDate); // Output: "December 19, 2024"
 */
function formatDateWithoutTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

/**
 * Determines the image name for a star based on its index and the average rating.
 *
 * @param {number} starIndex - The index of the star (1-based) being evaluated.
 * @param {number | undefined} averageRating - The average rating, which can be undefined.
 *                                             Defaults to 0 if not provided.
 * @returns {string} - The file name of the star image:
 *                     - `"fullStarYellow.png"` if the star is fully filled.
 *                     - `"halfStarYellow.png"` if the star is half-filled.
 *                     - `"emptyStarYellow.png"` if the star is empty.
 *
 * @remarks
 * - If `averageRating` is undefined, it is treated as 0.
 * - A star is considered:
 *   - Full if `averageRating` is greater than or equal to the star's index.
 *   - Empty if `averageRating` is less than or equal to the star's index minus 1.
 *   - Half otherwise.
 *
 * @example
 * ```
 * // Example : Full star
 * const imageName = getStarImageName(1, 4.5); // Output: "fullStarYellow.png"
 * ```
 */
function getStarImageName(starIndex: number, averageRating: number | undefined): string {
    if ((averageRating ?? 0) >= starIndex) return "fullStarYellow.png";
    if ((averageRating ?? 0) <= starIndex - 1) return "emptyStarYellow.png";
    return "halfStarYellow.png";
}

/**
 * Creates a delay for a specified duration in milliseconds.
 * @param {number} ms - The number of milliseconds to wait before the promise resolves.
 * @returns {Promise<void>} - A promise that resolves after the specified delay.
 */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let user = {
    firstName: "",
    lastName: "",
    loggedIn: false,
    email: "",
    permissions: "",
}

/**
 * Saves a user object to the session storage.
 * @param {typeof user} user1 - The user object to save to session storage.
 */
function saveUserToSessionStorage(user1: typeof user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user1));
}

/**
 * Retrieves the user object from session storage.
 * @returns {typeof user | null} - The retrieved user object or null if no user is stored.
 */
function getUserFromSessionStorage(): typeof user | null {
    const storedUser = sessionStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) as typeof user : null;
}

/**
 * Clears the user object from session storage.
 */
function clearUserFromSessionStorage() {
    sessionStorage.removeItem('currentUser');
}

/**
 * Generates an HTML `<li>` element representing a book with its details and rating for the overview window in book.html.
 * @param {Book} book - The book object containing all necessary information.
 * @returns {HTMLLIElement} - An HTML list item element containing the book's details.
 */
function generateAllBooksContainer(book: Book): HTMLLIElement {
    const bookItem: HTMLLIElement = document.createElement('li');
    bookItem.innerHTML = `
               <div class="book-container" onclick="routeToBookDetails('${book.book_id}')">
                    <img src="${book.cover_url ?? "Images/bookCoverPlaceholder.png"}" alt="book cover" height="200px">
                    <div class="book-info">
                        <h2>${book.title}</h2>
                        <p class="author-info">${book.author}</p>
                        <p class="isbn-info">ISBN: ${book.isbn}</p>
                        <p class="book-overview-description">${book.description}</p>
                        <p><b>Average Rating:</b></p>
                        <div class="rating-container">
                            <img src="Images/${getStarImageName(1, book.average_rating)}" alt="star">
                            <img src="Images/${getStarImageName(2, book.average_rating)}" alt="star">
                            <img src="Images/${getStarImageName(3, book.average_rating)}" alt="star">
                            <img src="Images/${getStarImageName(4, book.average_rating)}" alt="star">
                            <img src="Images/${getStarImageName(5, book.average_rating)}" alt="star">
                            <p>(${book.count_rating} Reviews)</p>
                        </div>
                    </div>
               </div>
                `;
    return bookItem;
}

/**
 * Generates an HTML `<li>` element for a borrowed book, including return information.
 *
 * This function uses `generateBookContainer` to create the base book container and
 * then appends a paragraph containing the return information.
 *
 * @param {BorrowRecord} borrowRecord - The borrow record containing a `book_copy` object with book data
 *                              and a `return_date` for the borrowed book.
 * @returns {HTMLLIElement} - An HTML list item element containing the book's details and return info.
 *
 * @requires generateAllBooksContainer - Depends on `generateBookContainer` to create the base book container.
 * @requires formatDateWithoutTime - Depends on `generateBookContainer` to create the base book container.
 */
function generateMyBookContainer(borrowRecord: BorrowRecord): HTMLLIElement {
    const bookItem = generateAllBooksContainer(borrowRecord.book_copy.book);
    const bookInfoDiv = bookItem.querySelector('.book-info');

    if (bookInfoDiv) {
        const returnInfoParagraph = document.createElement('p');
        returnInfoParagraph.className = 'return-info';
        returnInfoParagraph.innerHTML = `<b>Return date:</b> ${formatDateWithoutTime(borrowRecord.return_date.toString())}`;
        bookInfoDiv.appendChild(returnInfoParagraph);
    }
    return bookItem;
}

async function generateBookList(options?: { onlyBorrowedBooks: boolean }) {
    try {
        const onlyBorrowedBooks: boolean = options?.onlyBorrowedBooks ?? false;
        const result = onlyBorrowedBooks ? await fetchMyRecords() : await fetchBooks();
        // Get the table body where rows will be inserted
        const bookList = document.getElementById('book-list');
        if (!bookList) {
            console.warn("No book-list div found.");
            return;
        }

        bookList.innerHTML = ""; // Clear existing rows
        if (!result) {
            console.error("generateBookList.result is undefined");
            return;
        }
        if (isFetchResponse(result)) return;
        for (const book of result) {
            // generate book container element
            const bookElement: HTMLLIElement = onlyBorrowedBooks ? generateMyBookContainer(book as BorrowRecord) : generateAllBooksContainer(book as Book);

            bookList.appendChild(bookElement);
        }// End of inner for loop
    } catch (error) {
        console.error("Failed to fetch books:", error);
    }
}