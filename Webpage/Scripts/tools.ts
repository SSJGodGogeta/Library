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

//TODO: Implement all other routes here as well to use in other .ts files.