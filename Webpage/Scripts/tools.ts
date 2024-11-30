function getStarImageName(
    starIndex: number,
    averageRating: number | undefined
): string {
    if ((averageRating ?? 0) >= starIndex) return "Full_Star_Yellow.png";
    if ((averageRating ?? 0) <= starIndex - 1) return "Empty_Star_Yellow.png";
    return "Half_Star_Yellow.png";
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let user = {
    first_name: "",
    last_name: "",
    loggedIn: false,
    email: "",
}

function saveUserToSessionStorage(user1: typeof user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user1));
}

function getUserFromSessionStorage(): typeof user | null {
    const storedUser = sessionStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
}

function clearUserFromSessionStorage() {
    sessionStorage.removeItem('currentUser');
}

async function fetchCurrentUser() {
    const storedUser = getUserFromSessionStorage();
    if (storedUser) {
        console.warn("User already fetched and stored for this session.");
        Object.assign(user, storedUser); // Synchronize the in-memory `user` object with the stored data
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/authentication/currentUser`, {
            method: "GET",
            credentials: 'include',
        });
        const {entities} = await response.json();

        if (!entities) {
            console.error("User is not logged in");
            return;
        }

        user.loggedIn = true;
        user.first_name = entities.first_name;
        user.last_name = entities.last_name;
        user.email = entities.email;

        saveUserToSessionStorage(user);
        console.warn("Finished fetching and saving user.");
    } catch (error) {
        console.error(error);
    }
}

async function logoutUser() {
    const response = await fetch(`http://localhost:3000/authentication/logout`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include' // allow receiving cookies
    });
    const {message} = await response.json();

    if (!response.ok) {
        console.error(message);
        return;
    }
    console.log(`Logout: ${message}`);

    user.first_name = "";
    user.last_name = "";
    user.loggedIn = false;
    user.email = "";
    clearUserFromSessionStorage();
    console.warn("User logged out and local storage cleared.");
    window.location.href = "/Library/Webpage/login.html";
}

//TODO: Implement all other routes here as well to use in other .ts files.