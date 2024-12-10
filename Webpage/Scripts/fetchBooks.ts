document.addEventListener("DOMContentLoaded", async function () {
    try {
        const books = await fetchBooks();

        // Get the table body where rows will be inserted
        const book_list = document.getElementById('book-list');
        if (!book_list) {
            console.warn("No book_list div found.");
            return;
        }

        book_list.innerHTML = ""; // Clear existing rows

        for (const book of books) {
            // generate book container element
            const book_element: HTMLLIElement = generateBookContainer(book);

            book_list.appendChild(book_element);
        }// End of inner for loop
    } catch (error) {
        console.error("Failed to fetch books:", error);
    }
});