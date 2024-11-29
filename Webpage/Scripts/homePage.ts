document.addEventListener('DOMContentLoaded', async () => {
    await loadHomePage();
});

//TODO WIP
async function loadHomePage() {
    const greetUser: HTMLElement | null = document.getElementById('greetUser');
    const activities: HTMLElement | null = document.getElementById('activities');
    if (greetUser) {
        const response = await fetch(`http://localhost:3000/authentication/currentUser`,
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

        const {entities} = await response.json();
        if (entities) {
            greetUser.innerHTML = `Hello ${entities.first_name} ${entities.last_name} &#128075`
        }
    }
    if (activities) {
        const elements = `
        <div class="activity">
                <div class="picture">
                    <img alt="activity 1" src="/Webpage/Images/activity1.jpg">
                </div>
                <div class="info">
                    <p>Borrow a book today!</p>
                </div>
                <button>Read More</button>
            </div>`;
        if (activities) {
            for (let i = 0; i < 4; i++) {
                activities.innerHTML += elements;
            }
            return;
        }
        console.error("Activities element with ID 'activities' not found.");
    }
}