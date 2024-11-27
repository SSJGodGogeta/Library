document.addEventListener("DOMContentLoaded", () => {
    // load the email-adress and the password field
    //let emailAdressInput: HTMLInputElement = document.getElementById("email") as HTMLInputElement;
    //let loginpasswordInput: HTMLInputElement = document.getElementById("password") as HTMLInputElement;

// load the login button
    let loginButton: HTMLButtonElement = document.getElementById("loginButton") as HTMLButtonElement;

// load the hidden error message
    //let loginError: HTMLParagraphElement = document.getElementById("loginError") as HTMLParagraphElement;

    loginButton.onclick = async function () {
        try {
            // hide the error message for a retry
            // loginError.style.display = "none";  This doesnt work. Buttons are undefined.

            //const  email: String = emailAdressInput.value!.trim().toLowerCase(); // trim and lowercase the email address
            // const password: String = loginpasswordInput.value!; // read the password
            // For the sake of testing im just going to fetch random data here, just to ensure that everything is working fine. We can remove it later.
            const response2 = await fetch(`http://localhost:3000/user`, {
                method: "GET",
                credentials: "include",
            });
            if (!response2.ok) {
                throw new Error(response2.status + " - " + response2.statusText);
            }
            const {message, entities} = await response2.json();
            console.log(message, entities);
            // TODO: add Post route. The fetch below wont work currently!!!
            /*
            const response = await fetch(`http://localhost:3000/authentication`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // allow receiving cookies
                body: JSON.stringify({
                    email: email,
                    password: password,
                }), // Sending the new role name
            });

            if (!response.ok) {
                throw new Error(response.status + " - " + response.statusText);
            }

            console.log("Logged in successfully");
            window.location.href = "/Webpage/";
             */
        } catch (e) {
            // If the login failed, show an error message and log the error
            console.error(e);
            //loginError.style.display = "block";
        }
    }
});

