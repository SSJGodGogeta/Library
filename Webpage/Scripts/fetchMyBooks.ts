document.addEventListener("DOMContentLoaded", async function () {
    await generateBookList({onlyBorrowedBooks: true});
});