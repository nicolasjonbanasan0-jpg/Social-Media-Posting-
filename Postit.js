/*
    POSTIT - Secure Caption Posting System

    This JavaScript file:
    1. Accepts the user's information only once.
    2. Allows the user to post captions.
    3. Displays the post thread below the posting box.
    4. Encrypts the username + post + date.
*/

/* Store the current user's information */
let currentUser = null;

/* Save the user information */
function saveUser() {

    const fullName = document.getElementById("fullName").value.trim();
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    const yearLevel = document.getElementById("yearLevel").value;
    const gender = document.getElementById("gender").value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    /* Check required fields */
    if (
        !fullName ||
        !dateOfBirth ||
        !yearLevel ||
        !gender ||
        !username ||
        !password
    ) {
        alert("Please complete all fields.");
        return;
    }

    /* Store user information */
    currentUser = {
        fullName: fullName,
        dateOfBirth: dateOfBirth,
        yearLevel: yearLevel,
        gender: gender,
        username: username,
        password: password
    };

    /* Hide signup/user form after one-time registration */
    document.getElementById("userSection").classList.add("hidden");

    /* Show posting section */
    document.getElementById("postSection").classList.remove("hidden");

    document.getElementById("welcomeUser").textContent =
        "Welcome, " + fullName + "!";

    alert("User created successfully. You can now post.");
}

/* Add a new post */
async function addPost() {

    const postText = document.getElementById("postText").value.trim();

    /* Do not allow empty captions */
    if (!postText) {
        alert("Please enter a caption.");
        return;
    }

    /* Get current date and time */
    const date = new Date().toLocaleString();

    /*
        Create the string that will be encrypted.

        Format:
        USERNAME + POST + DATE
    */
    const originalData =
        currentUser.username + postText + date;

    /* Encrypt the string using Web Crypto API */
    const encryptedValue = await encryptText(originalData);

    /* Create the post container */
    const post = document.createElement("div");
    post.className = "post";

    /* ORIGINAL POST label */
    const originalLabel = document.createElement("div");
    originalLabel.className = "original";
    originalLabel.textContent = "ORIGINAL POST";

    /* Display original caption */
    const originalText = document.createElement("p");
    originalText.textContent = postText;

    /* Encrypted label */
    const encryptedLabel = document.createElement("strong");
    encryptedLabel.textContent = "ENCRYPTED VALUE:";

    /* Display encrypted data */
    const encryptedText = document.createElement("div");
    encryptedText.className = "encrypted";
    encryptedText.textContent = encryptedValue;

    /* Add elements to post */
    post.appendChild(originalLabel);
    post.appendChild(originalText);
    post.appendChild(encryptedLabel);
    post.appendChild(encryptedText);

    /* Add post to the thread */
    document.getElementById("postThread").prepend(post);

    /* Clear caption box */
    document.getElementById("postText").value = "";
}


/*
    Encrypt text using the browser Web Crypto API.

    AES-GCM is used to provide authenticated encryption.
*/
async function encryptText(text) {

    /* Convert text into bytes */
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    /* Create a key from a fixed demonstration password */
    const password = encoder.encode("POSTIT-DEMO-KEY-2026");

    /*
        Hash the demonstration key using SHA-256.
        This creates a 256-bit encryption key.
    */
    const keyMaterial = await crypto.subtle.digest(
        "SHA-256",
        password
    );

    /* Import the SHA-256 result as an AES-GCM key */
    const key = await crypto.subtle.importKey(
        "raw",
        keyMaterial,
        {
            name: "AES-GCM"
        },
        false,
        ["encrypt"]
    );

    /* Generate a random initialization vector */
    const iv = crypto.getRandomValues(new Uint8Array(12));

    /* Encrypt the original data */
    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        data
    );

    /*
        Convert IV + encrypted data to Base64
        so it can easily be displayed as a string.
    */
    const combined = new Uint8Array(
        iv.length + encrypted.byteLength
    );

    combined.set(iv);
    combined.set(
        new Uint8Array(encrypted),
        iv.length
    );

    return arrayBufferToBase64(combined);
}


/* Convert encrypted bytes to Base64 */
function arrayBufferToBase64(buffer) {

    let binary = "";

    for (let i = 0; i < buffer.length; i++) {
        binary += String.fromCharCode(buffer[i]);
    }

    return btoa(binary);
}
