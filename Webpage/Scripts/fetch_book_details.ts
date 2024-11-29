document.addEventListener("DOMContentLoaded", async function () {
    console.log("executing")

    try {
        // get the current url
        const urlParams = new URLSearchParams(window.location.search);
        // extract the book id out of the parameters
        const book_id = urlParams.get('book_id');

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

        const { entities } = await response.json();
        let book = entities;

        // Get the table body where rows will be inserted
        const bookDetailsContainer: HTMLDivElement | null = document.getElementById("book-details-container") as HTMLDivElement | null;
        if (!bookDetailsContainer) {
            console.warn("No book-details-container div found.");
            return;
        }

        bookDetailsContainer.innerHTML = `
            <img src="${book.cover_url}" alt="book cover" height="300px">
            <h1>${book.title}</h1>
            <div class="rating-container">
                <img src="Images/${getStarImageName(1, book.average_rating)}" alt="star">
                <img src="Images/${getStarImageName(2, book.average_rating)}" alt="star">
                <img src="Images/${getStarImageName(3, book.average_rating)}" alt="star">
                <img src="Images/${getStarImageName(4, book.average_rating)}" alt="star">
                <img src="Images/${getStarImageName(5, book.average_rating)}" alt="star">
                <p>(${book.count_rating} Reviews)</p>
            </div>
            <div class="borrow-button-container">
                <button ${book.available_copies <= 0 ? 'disabled' : ''}>Borrow</button>
                <button>Reserve</button>
            </div>
            <p>${book.description}</p>
            
            <h3>Information about the book:</h3>
            <p><b>ISBN:</b> ${book.isbn}</p>
            <p><b>Author:</b> ${book.author}</p>
            <p><b>Publisher:</b> ${book.publisher ?? "unknown"}</p>
            <p><b>Language:</b> ${book.language ?? "unknown"}</p>
            <p><b>Version:</b> ${book.version ?? 1}</p>
            <p><b>Release:</b> ${book.year ?? "unknown"}</p>
            
            <h3>Information for borrowing the book:</h3>
            <p><b>Total Copies:</b> ${book.total_copies}</p>
            <p><b>Available Copies:</b> ${book.available_copies}</p>
            
            <br>
            
            <p>If there is no copy available to borrow, you can reserve one instead.</p>
        `
    } catch (error) {
        console.error("Failed to fetch book:", error);
    }
});