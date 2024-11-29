document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch(`http://localhost:3000/book`,
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

        // Get the table body where rows will be inserted
        const book_list = document.getElementById('book-list');
        if (!book_list) {
            console.warn("No book_list div found.");
            return;
        }

        book_list.innerHTML = ""; // Clear existing rows

        for (const book of entities) {
            const book_item = document.createElement('li');
            book_item.innerHTML = `
               <div class="book-container">
                    <img src="${book.cover_url ?? "Images/book-cover-placeholder.png"}" alt="book cover" height="150px">
                    <div class="book-info">
                        <h2>${book.title}</h2>
                        <p>${book.description}</p>
                        <p><b>Average Rating:</b></p>
                        <div class="rating-container">
                            <img src="Images/${getStarImageName(1, book.average_rating)}" alt="star">
                            <img src="Images/${getStarImageName(2, book.average_rating)}" alt="star">
                            <img src="Images/${getStarImageName(3, book.average_rating)}" alt="star">
                            <img src="Images/${getStarImageName(4, book.average_rating)}" alt="star">
                            <img src="Images/${getStarImageName(5, book.average_rating)}" alt="star">
                            <p>(${book.count_rating} Reviews)</p>
                        </div>
                    </div>
               </div>
                `;
            book_list.appendChild(book_item);
        }// End of inner for loop
    } catch (error) {
        console.error("Failed to fetch timetable data:", error);
    }
});