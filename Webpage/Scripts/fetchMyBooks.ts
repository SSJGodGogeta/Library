/**
 * Only loads all books as a list in the Books page that the user has borrowed. Doesn't load their details
 */
document.addEventListener("DOMContentLoaded", async function () {
    await generateBookList({onlyBorrowedBooks: true});
});