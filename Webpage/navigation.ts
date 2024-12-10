document.addEventListener('DOMContentLoaded', async () => {
    await loadNavbar();
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
        href: "my_book.html"
    },
    myAccountLink: {
        id: "myAccountLink",
        name: "My Account",
        href: "myAccount.html"
    }
}

async function loadNavbar(): Promise<void> {
    let navbarHTML = `
        <img alt="Background" class="background" src="Images/Background.jpg">
        <nav>`;
    Object.values(elements).forEach(link => {
        if (link == elements.myAccountLink) {
            const user = getUserFromSessionStorage();
            // If the user is not in the session Storage, forward him to the login page, as a non-authenticated user doesn't have an account and therefore no account information.
            if (!user) {
                navbarHTML += `<a href="login.html" id="login">${link.name}</a>`;
            } else {
                navbarHTML += `<a href="${link.href}" id="${link.id}">${link.name}</a>`;
            }
        } else {
            navbarHTML += `<a href="${link.href}" id="${link.id}">${link.name}</a>`;
        }
    });

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
