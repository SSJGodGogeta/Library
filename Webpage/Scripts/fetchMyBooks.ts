document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch(`http://localhost:3000/borrowRecord/myRecords/`,
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
        const book_list = document.getElementById('my-book-list');
        if (!book_list) {
            console.warn("No book_list div found.");
            return;
        }

        book_list.innerHTML = ""; // Clear existing rows

        for (const borrowRecord of entities) {
            // generate book container element
            const book_element: HTMLLIElement = generateMyBookContainer(borrowRecord);

            book_list.appendChild(book_element);
        }// End of inner for loop
    } catch (error) {
        console.error("Failed to fetch books:", error);
    }
});