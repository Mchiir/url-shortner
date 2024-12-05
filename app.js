const host = "/";

// Event listener for sign-in button
document.querySelector("#signin-btn").addEventListener("click", handleSignIn);

// Function to handle user sign-in
function handleSignIn() {
    Swal.fire({
        title: 'Sign In',
        html: `
            <input type="text" id="firstname" class="swal2-input" placeholder="First Name">
            <input type="text" id="lastname" class="swal2-input" placeholder="Last Name">
            <input type="password" id="password" class="swal2-input" placeholder="Password">
            <input type="password" id="confirm-password" class="swal2-input" placeholder="Confirm password">
            <button type="submit" style="display:none;"></button>
        `,
        showCancelButton: true,
        confirmButtonText: 'Register',
        preConfirm: validateSignInInputs
    }).then((result) => {
        if (result.isConfirmed) {
            registerUser(result.value);
        }
    });
}

// Function to validate sign-in inputs
function validateSignInInputs() {
    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    // Validations
    if (!firstname || !lastname || !password || !confirmPassword) {
        Swal.showValidationMessage('All fields are required.');
        return false;
    }
    if (password !== confirmPassword) {
        Swal.showValidationMessage('Passwords do not match.');
        return false;
    }
    if (confirmPassword.length < 8) {
        Swal.showValidationMessage('The password must be at least 8 characters long.');
        return false;
    }

    return { firstname, lastname, password };
}

// Function to register user
function registerUser({ firstname, lastname, password }) {
    console.log("Registered User:", { firstname, lastname, password });

    fetch(host + "Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstname, lastname, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            Swal.fire("Success!", "You have registered successfully!", "success");
        } else if (data.error) {
            Swal.fire("Error", data.error, "error");
        } else {
            Swal.fire("Error", "Registration failed. Please try again.", "error");
        }
    })
    .catch((err) => {
        console.error("Error:", err);
        Swal.fire("Error", "Unable to process your request. Please try again later.", "error");
    });
}

// Event listener for creating short URL
document.querySelector("#create-short-url").addEventListener("click", handleCreateShortUrl);

// Function to handle creating short URL
function handleCreateShortUrl() {
    const longurl = document.querySelector("#longurl").value.trim();

    // Validate URL
    if (!validateUrl(longurl)) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Unauthorized: Please log in to create a short URL.");
        return;
    }

    createShortUrl(longurl, token);
}

// Function to validate URL
function validateUrl(longurl) {
    if (longurl.length === 0) {
        alert("Please enter a URL.");
        return false;
    }
    if (!(longurl.startsWith("http://") || longurl.startsWith("https://"))) {
        alert("The URL must start with 'http://' or 'https://'.");
        return false;
    }
    return true;
}

// Function to create short URL
function createShortUrl(longurl, token) {
    fetch(host + "api/create-short-url", {
        method: "POST",
        body: JSON.stringify({ longurl }),
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Authorization": `Bearer ${token}`,
        },
    })
    .then((response) => {
        if (!response.ok) {
            handleFetchError(response);
            return Promise.reject("Fetch error");
        }
        return response.json();
    })
    .then((data) => {
        if (data.status.toLowerCase() === "ok") {
            displayShortUrl(data.shorturlid, longurl);
        }
    })
    .catch((error) => {
        alert(error.message);
    });
}

// Function to handle fetch errors
function handleFetchError(response) {
    if (response.status === 401) {
        throw new Error("Unauthorized: Token is invalid or expired.");
    }
    if (response.status === 400) {
        throw new Error("Invalid request: Please check the URL format.");
    }
    throw new Error("An unexpected error occurred. Please try again.");
}

// Function to display the short URL
function displayShortUrl(shorturlid, longurl) {
    document.getElementById("short-url").innerText = `${host}${shorturlid}`;
    document.getElementById("short-url").href = `${host}${shorturlid}`;
    const html = `
        <tr>
            <td>${longurl}</td>
            <td><a href="${host}${shorturlid}">${host}${shorturlid}</a></td>
            <td>0</td>
        </tr>
    `;
    document.querySelector("#list_urls tbody").innerHTML += html;
    fetch(`${host}${shorturlid}`);
}

// Load all shortened URLs on page load
(function () {
    loadShortenedUrls();
})();

// Function to load all shortened URLs
function loadShortenedUrls() {
    fetch(host + "api/get-all-short-urls")
        .then((response) => {
            if (!response.ok) {
                handleFetchError(response);
                return Promise.reject("Fetch error");
            }
            return response.json();
        })
        .then((data) => {
            displayShortenedUrls(data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// Function to display shortened URLs
function displayShortenedUrls(data) {
    if (data.length === 0) {
        document.querySelector("#list_urls tbody").innerHTML = "<tr><td colspan='3'>No URLs found.</td></tr>";
        return;
    }

    let html = "";
    for (const url of data) {
        html += `
            <tr>
                <td>${url.longurl}</td>
                <td>
                    <a href="#" class="short-url" data-id="${url.shorturlid}">
                        ${host}${url.shorturlid}
                    </a>
                </td>
                <td>${url.count}</td>
            </tr>
        `;
    }
    document.querySelector("#list_urls tbody").innerHTML = html;

    // Attach click event listeners to short URLs
    document.querySelectorAll(".short-url").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const shorturlid = event.target.dataset.id;
            redirectToLongUrl(shorturlid);
        });
    });
}

// Function to redirect to the long URL
function redirectToLongUrl(shorturlid) {
    fetch(`${host}getshorturl/${shorturlid}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error retrieving the long URL.");
            }
            return response.json();
        })
        .then((longUrl) => {
            window.open(longUrl, "_blank"); // Open in a new tab
            loadShortenedUrls(); // update links counts
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Unable to redirect to the URL. Please try again later.");
        });
}