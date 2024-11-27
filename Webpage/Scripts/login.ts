document.addEventListener("DOMContentLoaded", () => {
    // load the email-address and the password field
    let email_address_input: HTMLInputElement = document.getElementById("email") as HTMLInputElement;
    let password_input: HTMLInputElement = document.getElementById("password") as HTMLInputElement;

    // load the login button
    let login_button: HTMLButtonElement = document.getElementById("loginButton") as HTMLButtonElement;

    // load the hidden error message
    // let loginError: HTMLParagraphElement = document.getElementById("loginError") as HTMLParagraphElement;

    login_button.onclick = async function () {
        try {
            // hide the error message for a retry
            // loginError.style.display = "none";  This doesnt work. Buttons are undefined.

            const email: String = email_address_input.value!.trim().toLowerCase(); // trim and lowercase the email address
            const password: String = password_input.value!; // read the password

            const response = await fetch(`http://localhost:3000/authentication/login`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // allow receiving cookies
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            if (!response.ok) {
                throw new Error(response.status + " - " + response.statusText);
            }

            console.log("Logged in successfully");
            window.location.href = "/Webpage/index.html";
        } catch (e) {
            // If the login failed, show an error message and log the error
            console.error(e);
            // loginError.style.display = "block";
        }
    }
});

