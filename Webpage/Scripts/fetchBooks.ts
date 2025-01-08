/**
 * If on the right page, it will either load all books or the books that u have borrowed. Doesn't load their details.
 */
document.addEventListener("DOMContentLoaded", async function () {
    // Get the current HTML file name
    const currentFile = window.location.pathname.split("/").pop();
    // Determine the boolean value based on the file name
    const all = currentFile !== "book.html";
    await generateBookList({onlyBorrowedBooks: all});
    const user = await fetchCurrentUser();
    if (user) await updateSessionOfUser(user.id);
});