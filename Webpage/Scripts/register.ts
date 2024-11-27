// Load the input fields for registration
let emailInput: HTMLInputElement = document.getElementById("email") as HTMLInputElement;
let passwordInput: HTMLInputElement = document.getElementById("password") as HTMLInputElement;
let firstNameInput: HTMLInputElement = document.getElementById("first_name") as HTMLInputElement;
let lastNameInput: HTMLInputElement = document.getElementById("last_name") as HTMLInputElement;

// Load the registration button
let registerButton: HTMLButtonElement = document.getElementById("registerButton") as HTMLButtonElement;

// Load the hidden error message
let registerError: HTMLParagraphElement = document.getElementById("registerError") as HTMLParagraphElement;

registerButton.onclick = async function () {
    try {
        // Hide the error message for a retry
        registerError.style.display = "none";

        // Read and process the input values
        let email: string = emailInput.value!.trim().toLowerCase(); // Trim and lowercase the email
        let password: string = passwordInput.value!; // Read the password
        let firstName: string = firstNameInput.value!.trim(); // Trim the first name
        let lastName: string = lastNameInput.value!.trim(); // Trim the last name

        // Send the registration data to the backend
        const response = await fetch("http://localhost:3000/register", {
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

        if (!response.ok) {
            throw new Error(response.status + " - " + response.statusText);
        }

        console.log("Registered successfully");
        window.location.href = "Login.html"; // Redirect to login page after successful registration
    } catch (e) {
        // If registration failed, show an error message and log the error
        console.error(e);
        registerError.style.display = "block";
    }
};
