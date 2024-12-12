document.addEventListener("DOMContentLoaded", () => {
    // load the email-address and the password field
    let emailAddressInput: HTMLInputElement = document.getElementById("email") as HTMLInputElement;
    let passwordInput: HTMLInputElement = document.getElementById("password") as HTMLInputElement;
    let loginButton: HTMLButtonElement = document.getElementById("loginButton") as HTMLButtonElement;
    let loginError: HTMLParagraphElement = document.getElementById("loginError") as HTMLParagraphElement;
    loginError.style.display = "none";

    async function handleLogin() {
        try {
            const email: string = emailAddressInput.value!.trim().toLowerCase(); // trim and lowercase the email address
            const password: string = passwordInput.value!; // read the password
            if (email.length == 0 || password.length == 0) return;
            const response = await login(email, password);
            if (response.code && response.code > 299) {
                loginError.style.display = "block";
                loginError.innerText = `${response.code}: ${response.message}`;
                return;
            }
            console.log("Logged in successfully");
            await fetchCurrentUser();
            window.location.href = "/Library/Webpage/index.html";
        } catch (e) {
            console.error(e);
        }
    }


    loginButton.onclick = async function () {
        await handleLogin();
    }
    document.addEventListener('keydown', async function (event) {
        if (event.key === "Enter") {
            await handleLogin();
        }
    });
});



