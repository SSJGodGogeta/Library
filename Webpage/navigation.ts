document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
});
// All elements within nav bar. All <a></a>
const elements = {
    homeLink: {
        id: "homeLink",
        name: "Home",
        href: "index.html"
    },
    booksLink: {
        id: "booksLink",
        name: "Books",
        href: "book.html"
    },
    newReleaseLink: {
        id: "newReleaseLink",
        name: "New Releases",
        href: "newRelease.html"
    },
    myBooksLink: {
        id: "myBooksLink",
        name: "My Books",
        href: "myBook.html"
    },
    myAccountLink: {
        id: "myAccountLink",
        name: "My Account",
        href: "myAccount.html"
    }
}

function loadNavbar(): void {
    let navbarHTML = `
        <img alt="Background" class="background" src="Images/Background.jpg">
        <nav>`;

    Object.values(elements).forEach(link => {
        navbarHTML += `
            <a href="${link.href}" id="${link.id}">${link.name}</a>
        `;
    });

    // Add the search input at the end of the navbar
    navbarHTML += `
        <label>
            <input placeholder="Search.." type="text">
        </label>
    </nav>`;

    const navbarContainer: HTMLElement | null = document.getElementById('navbar');
    if (navbarContainer) {
        navbarContainer.innerHTML = navbarHTML;
        return;
    }
    console.error("Navbar container with ID 'navbar' not found.");

}
