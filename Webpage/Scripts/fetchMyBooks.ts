document.addEventListener("DOMContentLoaded", async function() {
    await generateBookList({ only_borrowed_books: true });
});