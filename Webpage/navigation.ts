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
    myBooksLink: {
        id: "myBooksLink",
        name: "My Books",
        href: "myBook.html"
    },
    newReleaseLink: {
        id: "newReleaseLink",
        name: "New Releases",
        href: "newRelease.html"
    },
    myAccountLink: {
        id: "myAccountLink",
        name: "My Account",
        href: "myAccount.html"
    },
    userOverviewLink: {
        id: "userOverviewLink",
        name: "Manage Users",
        href: "usersOverview.html"
    },
    borrowedBooksOverviewLink: {
        id: "borrowedBooksOverviewLink",
        name: "Manage Borrowed Books",
        href: "borrowedBooksOverview.html"
    },
    booksOverviewLink: {
        id: "booksOverviewLink",
        name: "Manage Books",
        href: "booksOverview.html"
    },
}

async function loadNavbar(): Promise<void> {
    let navbarHTML = `
        <img alt="Background" class="background" src="Images/background.jpg">
        <nav>`;
    const user = getUserFromSessionStorage();
    Object.values(elements).forEach(link => {
        if (link == elements.myAccountLink) {
            // If the user is not in the session Storage, forward him to the login page, as a non-authenticated user doesn't have an account and therefore no account information.
            user ? navbarHTML += `<a href="${link.href}" id="${link.id}">${link.name}</a>` : navbarHTML += `<a href="login.html" id="login">${link.name}</a>`;
        } else if (link == elements.borrowedBooksOverviewLink || link == elements.userOverviewLink) {
            if (user && (user.permissions == "ADMIN" || user.permissions == "EMPLOYEE")) navbarHTML += `<a href="${link.href}" id="${link.id}">${link.name}</a>`;
        } else if (link == elements.booksOverviewLink) {
            if (user && user.permissions == "ADMIN") navbarHTML += `<a href="${link.href}" id="${link.id}">${link.name}</a>`;
        } else navbarHTML += `<a href="${link.href}" id="${link.id}">${link.name}</a>`;
    });

    navbarHTML += `
        <label>
            <input placeholder="Search.." type="text">
        </label>
    </nav>`;

    const navbarContainer: HTMLElement | null = document.getElementById('navbar');
    if (!navbarContainer) {
        console.error("Navbar container with ID 'navbar' not found.");
        return;
    }
    navbarContainer.innerHTML = navbarHTML;
    let logoutButton: HTMLButtonElement = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.id = "logoutButton";
    logoutButton.innerText = "Logout";
    document.body.appendChild(logoutButton);
    logoutButton.addEventListener("click", async () => {
        await logoutUser();
        await delay(500);
        window.location.href = "/Library/Webpage/login.html";
    })

}
