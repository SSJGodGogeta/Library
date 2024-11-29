document.addEventListener("DOMContentLoaded", () => {
// Load the input fields for registration
    let firstNameInput: HTMLInputElement = document.getElementById("firstname") as HTMLInputElement;
    let lastNameInput: HTMLInputElement = document.getElementById("lastname") as HTMLInputElement;
    let emailInput: HTMLInputElement = document.getElementById("email") as HTMLInputElement;
    let passwordInput: HTMLInputElement = document.getElementById("password") as HTMLInputElement;
    let registerButton: HTMLButtonElement = document.getElementById("registerButton") as HTMLButtonElement;
    let registerError: HTMLParagraphElement = document.getElementById("registerError") as HTMLParagraphElement;
    registerError.style.display = "none";

    async function handleRegistration() {
        try {
            let email: string = emailInput.value!.trim().toLowerCase(); // Trim and lowercase the email
            let password: string = passwordInput.value!; // Read the password
            let firstName: string = firstNameInput.value!.trim(); // Trim the first name
            let lastName: string = lastNameInput.value!.trim(); // Trim the last name
            if (email.length == 0 || password.length == 0 || firstName.length == 0 || lastName.length == 0) return;
            // Send the registration data to the backend
            const response = await fetch("http://localhost:3000/authentication/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    first_name: firstName,
                    last_name: lastName,
                }),
            });

            const {message} = await response.json();

            if (!response.ok) {
                registerError.style.display = "block";
                registerError.innerText = message;
                return;
            }

            console.log("Registered successfully");
            window.location.href = "/Library/Webpage/login.html";
        } catch (e) {
            console.error(e);
        }
    }

    registerButton.onclick = async function () {
        await handleRegistration();
    };
    document.addEventListener('keydown', async function (event) {
        if (event.key === "Enter") {
            await handleRegistration();
        }
    });
});
