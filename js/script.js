const socket = io("https://socketchatapp.midnightdevelop.repl.co");
const chatContainer = document.getElementById("chat-container");
const messageContainer = document.getElementById("message-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const fileUploader = document.getElementById("file-uploader");
const loginForm = document.getElementById("logi-form");
const passwordInput = document.getElementById("password-input");

let authenticated = false;

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (passwordInput.value !== "ym gets bitches") { // Doesn't matter if people find this anyways
        alert("Invalid password provided");
    } else {
        authenticated = true;
        chatContainer.style.display = "block";
        loginForm.style.display = "none";
    }
});

if (authenticated) {
    let _name = prompt("What is your name? (If blank, name will be displayed as \"Anonymous User\")") || "Anonymous User";
    if (_name === "Anonymous User") socket.emit("send-users");

    appendMessage(`[${new Date().toLocaleTimeString()}] You joined the chat as ${_name}`);
    socket.emit("new-user", _name);

    onAppend(messageContainer, () => {
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on("users-sent", (users) => {
        const anonymousUsers = Object.values(users).filter((username) => username.startsWith("Anonymous User #")).length;
        _name = `Anonymous User #${anonymousUsers + 1}`;
    });

    socket.on("chat-message", data => {
        const message = document.createElement("div");
        message.innerHTML = data.message
            .replaceAll("You", data.name)
            .replaceAll("<div>", "")
            .replaceAll("</div>", "");

        messageContainer.append(message);
    });

    socket.on("user-connected", name => {
        appendMessage(`[${new Date().toLocaleTimeString()}] ${name} joined the chat`);
    });

    socket.on("user-disconnected", name => {
        appendMessage(`[${new Date().toLocaleTimeString()}] ${name} left the chat`);
    });

    let fileToUpload = null;

    fileUploader.addEventListener("change", e => {
        e.preventDefault();
        const file = e.target.files[0];
        if (file.type.match(/image.*/)) {
            const image = document.createElement("img");
            image.src = window.URL.createObjectURL(file);
            image.style.width = "100%";

            fileToUpload = {
                file: image,
                type: "image"
            };
        } else {
            const uploadContainer = document.createElement("div");
            uploadContainer.style.width = "100%";
            const uploadFile = document.createElement("a");
            const icon = document.createElement("svg");
            icon.innerHTML = '<svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16.293 9.293L17.707 10.707L12 16.414L6.29297 10.707L7.70697 9.293L11 12.586V2H13V12.586L16.293 9.293ZM18 20V18H20V20C20 21.102 19.104 22 18 22H6C4.896 22 4 21.102 4 20V18H6V20H18Z"></path></svg>';
            icon.style.width = "24px";
            icon.style.height = "25px";
            icon.style.color = "hsl(216,calc(var(--saturation-factor, 1)*3.7%),73.5%)";
            const innerText = document.createElement("span");
            uploadFile.appendChild(icon);
            uploadFile.appendChild(innerText);
            uploadFile.style.display = "flex";
            uploadFile.style.flexDirection = "row";
            uploadFile.style.justifyContent = "center";
            uploadFile.style.alignContent = "center";
            uploadFile.style.borderRadius = "3px";
            uploadFile.style.backgroundColor = "#2f3136";
            uploadFile.style.borderColor = "#222326";
            uploadFile.style.borderStyle = "solid";
            uploadFile.style.borderWidth = "2px";
            uploadFile.style.padding = "10px";
            uploadFile.style.textDecoration = "none";
            innerText.style.textDecoration = "none";
            innerText.style.color = "#00B8DE";
            innerText.innerText = file.name;
            uploadFile.download = file.name.replaceAll(/(\.[a-z]{3,})$/g, "");
            uploadFile.href = window.URL.createObjectURL(file);
            uploadFile.style.width = "max-content";
            uploadContainer.appendChild(uploadFile);

            fileToUpload = {
                file: uploadContainer,
                type: "file"
            }
        }
    });

    messageForm.addEventListener("submit", e => {
        e.preventDefault();
        const message = messageInput.value;
        if (message === "" && !fileToUpload) return;
        const messageElement = appendMessage(`[${new Date().toLocaleTimeString()}] You: ${message}`, fileToUpload);
        socket.emit("send-chat-message", messageElement.outerHTML);
        messageForm.reset();
        fileToUpload = null;
    });

    /**
     * @param {string} message
     * @param {{ file: HTMLImageElement, type: "image" | "file" }} fileOptions
     */
    function appendMessage(message, fileOptions) {
        const urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g);
        const messageElement = document.createElement("div");
        messageElement.style.display = "flex";
        messageElement.style.flexDirection = "row";
        messageElement.style.justifyContent = "flex-start";
        messageElement.style.alignItems = "flex-start";
        messageElement.style.flexWrap = "wrap";
        messageElement.style.columnGap = "4px";
        messageElement.innerHTML = message;

        if (urlRegex.test(messageElement.innerHTML)) {
            message.match(urlRegex).forEach((url) => {
                const hyperlink = document.createElement("a");
                hyperlink.href = url, hyperlink.innerText = url, hyperlink.target = "_blank", hyperlink.style.position = "inline-flex", hyperlink.style.display = "inline-block";
                messageElement.innerHTML = messageElement.innerHTML.replace(url, hyperlink.outerHTML);
            });
        }

        if (fileOptions) {
            messageElement.innerHTML = `${messageElement.innerHTML}
            ${fileOptions.file.outerHTML}
            `;
        }

        messageContainer.appendChild(messageElement);

        return messageElement;
    };

    function onAppend(elem, f) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                if (m.addedNodes.length) f(m.addedNodes);
            });
        });

        observer.observe(elem, { childList: true });
    };
}