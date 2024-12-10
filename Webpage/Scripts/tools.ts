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
function formatDateWithoutTime(dateString: string) {
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
 *                     - `"Full_Star_Yellow.png"` if the star is fully filled.
 *                     - `"Half_Star_Yellow.png"` if the star is half-filled.
 *                     - `"Empty_Star_Yellow.png"` if the star is empty.
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
 * // Example 1: Full star
 * const imageName = getStarImageName(1, 4.5);
 * console.log(imageName); // Output: "Full_Star_Yellow.png"
 *
 * // Example 2: Half star
 * const imageName = getStarImageName(5, 4.5);
 * console.log(imageName); // Output: "Half_Star_Yellow.png"
 *
 * // Example 3: Empty star
 * const imageName = getStarImageName(6, 4.5);
 * console.log(imageName); // Output: "Empty_Star_Yellow.png"
 * ```
 */
function getStarImageName(
    starIndex: number,
    averageRating: number | undefined
): string {
    if ((averageRating ?? 0) >= starIndex) return "Full_Star_Yellow.png";
    if ((averageRating ?? 0) <= starIndex - 1) return "Empty_Star_Yellow.png";
    return "Half_Star_Yellow.png";
}

/**
 * Creates a delay for a specified duration in milliseconds.
 *
 * @param {number} ms - The number of milliseconds to wait before the promise resolves.
 * @returns {Promise<void>} - A promise that resolves after the specified delay.
 *
 * @example
 * ```
 * // Example 1: Basic delay usage
 * await delay(1000);
 * console.log("This logs after 1 second.");
 *
 * // Example 2: Using delay in a loop
 * for (let i = 0; i < 3; i++) {
 *     console.log(`Iteration ${i}`);
 *     await delay(500); // Wait 500ms between iterations
 * }
 * ```
 */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let user = {
    first_name: "",
    last_name: "",
    loggedIn: false,
    email: "",
}

/**
 * Saves a user object to the session storage.
 *
 * @param {typeof user} user1 - The user object to save to session storage.
 *
 * @example
 * ```
 * const newUser = { first_name: "John", last_name: "Doe", loggedIn: true, email: "john.doe@example.com" };
 * saveUserToSessionStorage(newUser);
 * ```
 */
function saveUserToSessionStorage(user1: typeof user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user1));
}

/**
 * Retrieves the user object from session storage.
 *
 * @returns {typeof user | null} - The retrieved user object or null if no user is stored.
 *
 * @example
 * ```
 * const currentUser = getUserFromSessionStorage();
 * if (currentUser) {
 *     console.log(`User ${currentUser.first_name} is logged in.`);
 * } else {
 *     console.log("No user is currently stored.");
 * }
 * ```
 */
function getUserFromSessionStorage(): typeof user | null {
    const storedUser = sessionStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
}

/**
 * Clears the user object from session storage.
 *
 * @example
 * ```
 * clearUserFromSessionStorage();
 * console.log("User data cleared from session storage.");
 * ```
 */
function clearUserFromSessionStorage() {
    sessionStorage.removeItem('currentUser');
}

/**
 * Fetches the current user's data from the server and synchronizes it with the session storage.
 *
 * - If the user is already stored in the session storage, the in-memory `user` object is updated,
 *   and no server request is made.
 * - If no user data is stored, the function fetches the current user data from the server and updates
 *   both the in-memory `user` object and the session storage.
 *
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 *
 * @throws {Error} - Logs an error if the fetch request fails or the response is invalid.
 *
 * @example
 * ```
 * await fetchCurrentUser();
 * if (user.loggedIn) {
 *     console.log(`Welcome, ${user.first_name} ${user.last_name}!`);
 * } else {
 *     console.log("No user is logged in.");
 * }
 * ```
 *
 * @remarks
 * - This function assumes the presence of the `user` object and related helper functions like
 *   `getUserFromSessionStorage` and `saveUserToSessionStorage`.
 * - The server endpoint (`http://localhost:3000/authentication/currentUser`) must return a JSON
 *   response with an `entities` object containing the user's details.
 */
async function fetchCurrentUser(): Promise<void> {
    const storedUser = getUserFromSessionStorage();
    if (storedUser) {
        console.warn("User already fetched and stored for this session.");
        Object.assign(user, storedUser); // Synchronize the in-memory `user` object with the stored data
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/authentication/currentUser`, {
            method: "GET",
            credentials: 'include',
        });
        const {entities} = await response.json();

        if (!entities) {
            console.error("User is not logged in");
            return;
        }

        user.loggedIn = true;
        user.first_name = entities.first_name;
        user.last_name = entities.last_name;
        user.email = entities.email;

        saveUserToSessionStorage(user);
        console.warn("Finished fetching and saving user.");
    } catch (error) {
        console.error(error);
    }
}

/**
 * Logs out the current user by making a request to the server and clearing user data.
 *
 * - Sends a logout request to the server endpoint.
 * - Clears the in-memory `user` object and removes it from session storage.
 * - Redirects the user to the login page upon successful logout.
 *
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 *
 * @throws {Error} - Logs an error message if the logout request fails or the server response is invalid.
 *
 * @example
 * ```
 * await logoutUser();
 * console.log("User has been logged out successfully.");
 * ```
 *
 * @remarks
 * - Assumes the existence of a global `user` object that holds the current user's state.
 * - The server endpoint (`http://localhost:3000/authentication/logout`) must return a JSON response with a `message` field.
 * - Upon logout, the function redirects the user to `/Library/Webpage/login.html`.
 */
async function logoutUser(): Promise<void> {
    const response = await fetch(`http://localhost:3000/authentication/logout`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include' // allow receiving cookies
    });
    const {message} = await response.json();

    if (!response.ok) {
        console.error(message);
        return;
    }
    console.log(`Logout: ${message}`);

    user.first_name = "";
    user.last_name = "";
    user.loggedIn = false;
    user.email = "";
    clearUserFromSessionStorage();
    console.warn("User logged out and local storage cleared.");
    window.location.href = "/Library/Webpage/login.html";
}

/**
 * Redirects to the book details page of a specified book.
 * Goes to /Library/Webpage/bookDetails.html?book_id=$book_id
 *
 * @param {number} book_id - The id of the book
 *
 * @returns {void}
 *
 * @example
 * ```
 * routeToBookDetails(2);
 * ```
 */
function routeToBookDetails(book_id: number): void {
    window.location.href = "/Library/Webpage/bookDetails.html?book_id=" + book_id;
}

/**
 * Generates an HTML `<li>` element representing a book with its details and rating.
 *
 * @param {Book} book - The book object containing all necessary information.
 * @returns {HTMLLIElement} - An HTML list item element containing the book's details.
 *
 * @example
 * ```
 * generateBookContainer(myBook);
 * ```
 */
function generateBookContainer(book: any): HTMLLIElement {
    const book_item: HTMLLIElement = document.createElement('li');
    book_item.innerHTML = `
               <div class="book-container" onclick="routeToBookDetails('${book.book_id}')">
                    <img src="${book.cover_url ?? "Images/book-cover-placeholder.png"}" alt="book cover" height="200px">
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

    return book_item;
}

/**
 * Generates an HTML `<li>` element for a borrowed book, including return information.
 *
 * This function uses `generateBookContainer` to create the base book container and
 * then appends a paragraph containing the return information.
 *
 * @param {BorrowRecord} borrow_record - The borrow record containing a `book_copy` object with book data
 *                              and a `return_date` for the borrowed book.
 * @returns {HTMLLIElement} - An HTML list item element containing the book's details and return info.
 *
 * @requires generateBookContainer - Depends on `generateBookContainer` to create the base book container.
 * @requires formatDateWithoutTime - Depends on `generateBookContainer` to create the base book container.
 *
 * @example
 * ```
 * const bookContainer = generateMyBookContainer(borrowRecord);
 * document.body.appendChild(bookContainer);
 * ```
 */
function generateMyBookContainer(borrow_record: any): HTMLLIElement {
    const book_item = generateBookContainer(borrow_record.book_copy.book);

    const bookInfoDiv = book_item.querySelector('.book-info');

    if (bookInfoDiv) {
        const returnInfoParagraph = document.createElement('p');
        returnInfoParagraph.className = 'return-info';
        returnInfoParagraph.innerHTML = `<b>Return date:</b> ${formatDateWithoutTime(borrow_record.return_date)}`;
        bookInfoDiv.appendChild(returnInfoParagraph);
    }

    return book_item;
}

async function fetchBooks() {
    const response = await fetch(`http://localhost:3000/book`,
        {
            method: "GET",
            credentials: 'include', // allow receiving cookies
        }
    );
    if (!response.ok) {
        if (response.status == 401) {
            window.location.href = "/Webpage/login.html";
            return;

        }
        throw new Error("Network response was not ok " + response.statusText);
    }

    const {entities} = await response.json();
    return entities;
}

async function fetchBook(book_id: number) {
    const response = await fetch(`http://localhost:3000/book/${book_id}`,
        {
            method: "GET",
            credentials: 'include', // allow receiving cookies
        }
    );
    if (!response.ok) {
        if (response.status == 401) {
            window.location.href = "/Webpage/login.html";
            return;

        }
        throw new Error("Network response was not ok " + response.statusText);
    }

    const {entities} = await response.json();
    return entities;
}

async function fetchMyBooks() {
    const response = await fetch(`http://localhost:3000/borrowRecord/myRecords/`,
        {
            method: "GET",
            credentials: 'include', // allow receiving cookies
        }
    );
    if (!response.ok) {
        if (response.status == 401) {
            window.location.href = "/Webpage/login.html";
            return;

        }
        throw new Error("Network response was not ok " + response.statusText);
    }

    const {entities} = await response.json();
    return entities;
}

async function fetchBorrowRecordForBook(book_id: number | null, user: any) {
    if (user) {
        const current_borrow_record_response = await fetch(`http://localhost:3000/borrowRecord/myRecords/book/${book_id}`,
            {
                method: "GET",
                credentials: 'include', // allow receiving cookies
            }
        );
        if (!current_borrow_record_response.ok) {
            if (current_borrow_record_response.status == 401) {
                window.location.href = "/Webpage/login.html";
                return;

            }
            throw new Error("Network response was not ok " + current_borrow_record_response.statusText);
        }

        const {entities} = await current_borrow_record_response.json();
        return entities.current_borrow_record;
    }
}

/**
 * Sends a request to borrow a book by its ID.
 * Handles authentication and reloads the page upon success.
 *
 * @param {number} book_id - The ID of the book to be borrowed.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 *
 * @throws {Error} - Throws an error if the network response is not ok,
 *                   excluding unauthorized responses which redirect to the login page.
 *
 * @remarks
 * - If the user is not authenticated (HTTP 401), the function redirects to the login page.
 * - Reloads the page upon successful borrowing.
 *
 * @example
 * ```
 * try {
 *   await borrowBook(123);
 * } catch (error) {
 *   console.error("Failed to borrow book:", error);
 * }
 * ```
 */
async function borrowBook(book_id: number): Promise<void> {
    const response = await fetch(`http://localhost:3000/borrowRecord/borrow`,
        {
            method: "POST",
            credentials: 'include', // allow receiving cookies
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({book_id}),
        }
    );

    if (!response.ok) {
        if (response.status == 401) {
            window.location.href = "/Webpage/login.html";
            return;

        }
        throw new Error("Network response was not ok " + response.statusText);
    }

    window.location.reload();
}

async function generateBookList(options?: { only_borrowed_books: boolean }) {
    try {
        const only_borrowed_books: boolean = options?.only_borrowed_books ?? false;
        const books = only_borrowed_books ? await fetchMyBooks() : await fetchBooks();

        // Get the table body where rows will be inserted
        const book_list = document.getElementById('book-list');
        if (!book_list) {
            console.warn("No book_list div found.");
            return;
        }

        book_list.innerHTML = ""; // Clear existing rows

        for (const book of books) {
            // generate book container element
            const book_element: HTMLLIElement = only_borrowed_books ? generateMyBookContainer(book) : generateBookContainer(book);

            book_list.appendChild(book_element);
        }// End of inner for loop
    } catch (error) {
        console.error("Failed to fetch books:", error);
    }
}