const host = "/";
    
    document.querySelector("#signin-btn").addEventListener("click", () => {
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
            preConfirm: () => {
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
                    Swal.showValidationMessage('The password must be atleast 8 long.');
                    return false;
                }

                return { firstname, lastname, password };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { firstname, lastname, password } = result.value;
                console.log("Registered User:", { firstname, lastname, password });

                // Call your registration API
                fetch(host + "Register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ firstname, lastname, password })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.token) {
                        // Store token in localStorage
                        localStorage.setItem("token", data.token);
    
                        // Show success message
                        Swal.fire("Success!", "You have registered successfully!", "success");
                    } else if (data.error) {
                        // Show server-side error message
                        Swal.fire("Error", data.error, "error");
                    } else {
                        // Fallback error message
                        Swal.fire("Error", "Registration failed. Please try again.", "error");
                    }
                })
                .catch((err) => {
                    console.error("Error:", err);
                    Swal.fire("Error", "Unable to process your request. Please try again later.", "error");
                });
            }
        });
    });


    document.querySelector("#create-short-url").addEventListener("click", () => {
        const longurl = document.querySelector("#longurl").value.trim();
        
        // Validate URL
        if (longurl.length === 0) {
            alert("Please enter a URL.");
            return;
        }
        if (!(longurl.startsWith("http://") || longurl.startsWith("https://"))) {
            alert("The URL must start with 'http://' or 'https://'.");
            return;
        }

        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized: Please log in to create a short URL.");
            return;
        }

        fetch(host + "api/create-short-url", {
            method: "POST",
            body: JSON.stringify({ longurl }),
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Authorization": `Bearer ${token}`, // Include JWT token
            },
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Unauthorized: Token is invalid or expired.");
                    }
                    if (response.status === 400) {
                        throw new Error("Invalid request: Please check the URL format.");
                    }
                    throw new Error("An unexpected error occurred. Please try again.");
                }
                return response.json();
            })
            .then((data) => {
                if (data.status.toLowerCase() === "ok") {
                    document.getElementById("short-url").innerText = `${host}${data.shorturlid}`;
                    document.getElementById("short-url").href = `${host}${data.shorturlid}`;
                    const html = `
                        <tr>
                            <td>${longurl}</td>
                            <td><a href="${host}${data.shorturlid}">${host}${data.shorturlid}</a></td>
                            <td>0</td>
                        </tr>
                    `;
                    document.querySelector("#list_urls tbody").innerHTML += html;
                    return fetch(`${host}${data.shorturlid}`);
                }
            })
            .then((response) => {
                if (response.ok) {
                    console.log("Redirected successfully");
                    window.location.href = window.location.origin + window.location.pathname;
                } else {
                    console.error("Error during redirect");
                }
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // Load all shortened URLs
    (function () {
        // Fetch all shortened URLs and display them
        fetch(host + "api/get-all-short-urls")
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Unauthorized: Token is invalid or expired.");
                    }
                    throw new Error("Failed to fetch shortened URLs.");
                }
                return response.json();
            })
            .then((data) => {
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
    
                        // Trigger API call and open the link in a new tab
                        fetch(`${host}getshorturl/${shorturlid}`)
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error("Error retrieving the long URL.");
                                }
                                return response.json(); // Expecting JSON with the long URL
                            })
                            .then((longUrl) => {
                                window.open(longUrl, "_blank"); // Open in a new tab
                            })
                            .catch((error) => {
                                console.error("Error:", error);
                                alert("Unable to redirect to the URL. Please try again later.");
                            });
                    });
                });
            })
            .catch((error) => {
                console.error("Error:", error);
                alert(error.message);
            });
    })(); 