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