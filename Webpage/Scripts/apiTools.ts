interface Book {
    //TODO: rename database attributes of typeorm.
    book_id: number,
    title: String,
    description?: String,
    publisher?: String,
    author?: String,
    year?: number,
    edition?: number
    isbn?: String,
    language_code?: String,
    total_copies?: number,
    available_copies?: number,
    average_rating?: number,
    times_borrowed?: number,
    sum_rating: number,
    count_rating: number,
    cover_url?: String,
    availability: "AVAILABLE" | "NOT_AVAILABLE" | "SOON_AVAILABLE",
}

interface BorrowRecord {
    borrow_record_id: number,
    borrow_date: Date,
    return_date: Date,
    status: "NOT_BORROWED" | "BORROWED",
    rating: number,
    book_copy: BookCopy,
    user: User,
}

interface BookCopy {
    book_copy_id: number,
    status: "NOT_BORROWED" | "BORROWED",
    book: Book,
}

interface User {
    user_id: number,
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    imageurl?: string,
    permissions: "ADMIN" | "EMPLOYEE" | "STUDENT" | "PROFESSOR"
}

interface Reservation {
    reservation_id: number,
    reservation_date: Date,
    book: Book,
    user: User
}

interface Session {
    session_id: number,
    ip: string,
    deviceInfo: string,
    token: string,
    created: Date,
    last_used: Date,
    user: User
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
 *     console.log(`Welcome, ${user.firstName} ${user.lastName}!`);
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
        const entities = await fetchRoute<User>('/authentication/currentUser');

        if (!entities) {
            console.error("User is not logged in");
            return;
        }

        user.loggedIn = true;
        user.firstName = entities.first_name;
        user.lastName = entities.last_name;
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
    // Use fetchAPI for the logout request
    const {message} = await fetchRoute<{ message: string }>('/authentication/logout', 'POST');

    console.log(`Logout: ${message}`);

    user.firstName = "";
    user.lastName = "";
    user.loggedIn = false;
    user.email = "";
    clearUserFromSessionStorage();
    console.warn("User logged out and local storage cleared.");
    window.location.href = "/Library/Webpage/login.html";
}

/**
 * Redirects to the book details page of a specified book.
 * Goes to /Library/Webpage/bookDetails.html?bookId=bookId
 *
 * @param {number} bookId - The id of the book
 *
 * @returns {void}
 *
 * @example
 * ```
 * routeToBookDetails(2);
 * ```
 */
function routeToBookDetails(bookId: number): void {
    //TODO: Create a function that gets all routes from one route and stores them in a object.
    window.location.href = "/Library/Webpage/bookDetails.html?bookId=" + bookId;
}

async function fetchBooks() {
    return fetchRoute<Book[]>('/book');
}

async function fetchBook(bookId: number) {
    return fetchRoute<Book>(`/book/${bookId}`);
}

async function fetchMyRecords() {
    return fetchRoute<BorrowRecord[]>(`/borrowRecord/myRecords/`);
}

async function fetchBorrowRecordForBook(bookId: number | null, user: any) {
    if (user) {
        return fetchRoute<BorrowRecord>(`/borrowRecord/myRecords/book/${bookId}`, "GET", undefined, "currentBorrowRecord");
    }
    return null;
}

/**
 * Sends a request to borrow a book by its ID.
 * Handles authentication and reloads the page upon success.
 *
 * @param {number} bookId - The ID of the book to be borrowed.
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
async function borrowBook(bookId: number): Promise<void> {
    await fetchRoute<void>("/borrowRecord/borrow", "POST", {bookId});
    window.location.reload();
}

async function fetchRoute<T>(endpoint: string, method: "GET" | "POST" = "GET", body?: any, responseKey: string = "entities"): Promise<T> {
    const url = `http://localhost:3000${endpoint}`;
    const options: RequestInit = {
        method,
        credentials: 'include', // allow receiving cookies
    };
    if (body) {
        options.headers = {
            'Content-Type': 'application/json',
        };
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = "/Webpage/login.html";
            return Promise.reject(new Error("Unauthorized, redirected to login."));
        }
        throw new Error(`Network response was not ok:\nStatus: ${response.statusText}`);
    }
    const json = await response.json();
    // Extract the desired key from the response JSON
    return json[responseKey] as T;
}
