document.addEventListener('DOMContentLoaded', async () => {
    await loadHomePage();
});

async function loadHomePage() {
    const greetUser: HTMLElement | null = document.getElementById('greetUser');
    const activities: HTMLElement | null = document.getElementById('activities');
    if (greetUser) {
        const user = getUserFromSessionStorage();
        if (user && user.loggedIn) {
            console.warn(`User logged in as: ${user.firstName}`);
            greetUser.innerHTML = `Hello ${user.firstName} ${user.lastName} &#128075`
        } else {
            console.warn(`User not logged in!`);
        }
    }
    // For now hardcoded. We could extend later to the db...
    const libActivities = [
        "Join our book club and connect with fellow readers to discuss this month's featured novel. New members are always welcome, and meetings are held every Saturday afternoon. Don't miss the chance to share your thoughts and discover new favorites!",
        "Explore the world of technology with our free coding workshops for beginners. These sessions are designed to teach basic programming skills in a fun and interactive way. No prior experience required—just bring your curiosity!",
        "Unwind with our weekly mindfulness and meditation sessions in the library garden. Led by certified instructors, these sessions are perfect for reducing stress and improving focus. All levels are welcome, and mats are provided!",
        "Bring your kids to our storytime hour, where books come to life through engaging storytelling and fun activities. It's the perfect way to spark a love for reading in your little ones. Every Tuesday and Thursday at 10 AM!"
    ];

    if (activities) {
        for (let i = 0; i < libActivities.length; i++) {
            activities.innerHTML += `<div class="activity">
                <div class="picture">
                    <img alt="activity 1" src="/Webpage/Images/activity1.jpg">
                </div>
                <div class="info">
                    <p>${libActivities[i]}</p>
                </div>
                <button>Read More</button>
            </div>`;
        }
        return;
    }
    console.error("Activities element with ID 'activities' not found.");

    //TODO: Add book recommendations after. We can use the book api and filter books by their rating. Use the bookRoute
}