document.addEventListener("DOMContentLoaded", () => {
    // load the email-address and the password field
    let email_address_input: HTMLInputElement = document.getElementById("email") as HTMLInputElement;
    let password_input: HTMLInputElement = document.getElementById("password") as HTMLInputElement;

    // load the login button
    let login_button: HTMLButtonElement = document.getElementById("loginButton") as HTMLButtonElement;

    // load the hidden error message
    let loginError: HTMLParagraphElement = document.getElementById("loginError") as HTMLParagraphElement;
    loginError.style.display = "none";

    login_button.onclick = async function () {
        try {
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
            const {message} = await response.json();

            if (!response.ok) {
                loginError.style.display = "block";
                loginError.innerText = message;
                return;
            }
            console.log("Logged in successfully");
            window.location.href = "/Library/Webpage/index.html";
        } catch (e) {
            console.error(e);
        }
    }
});

