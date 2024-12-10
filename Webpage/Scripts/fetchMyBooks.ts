document.addEventListener("DOMContentLoaded", async function () {
    try {
        const my_books = await fetchMyBooks();

        // Get the table body where rows will be inserted
        const book_list = document.getElementById('my-book-list');
        if (!book_list) {
            console.warn("No book_list div found.");
            return;
        }

        book_list.innerHTML = ""; // Clear existing rows

        for (const borrowRecord of my_books) {
            // generate book container element
            const book_element: HTMLLIElement = generateMyBookContainer(borrowRecord);

            book_list.appendChild(book_element);
        }// End of inner for loop
    } catch (error) {
        console.error("Failed to fetch books:", error);
    }
});