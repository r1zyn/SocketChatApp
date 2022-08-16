const socket = io("https://socketchatapp.midnightdevelop.repl.co", {
    extraHeaders: {
        "Access-Control-Allow-Origin": "*"
    }
});
const messageContainer = document.getElementById("message-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const fileUploader = document.getElementById("file-uploader");

const _name = prompt("What is your name? (If blank, name will be displayed as \"Anonymous User\")", "Anonymous User");
if (_name == null) close();
appendMessage(`[${new Date().toLocaleTimeString()}] You joined`);
socket.emit("new-user", _name);

onAppend(messageContainer, () => {
    window.scrollTo(0, document.body.scrollHeight);
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
    appendMessage(`[${new Date().toLocaleTimeString()}] ${name} connected`);
});

socket.on("user-disconnected", name => {
    appendMessage(`[${new Date().toLocaleTimeString()}] ${name} disconnected`);
});

let fileToUpload = null;

fileUploader.addEventListener("change", e => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file.type.match(/image.*/)) {
        const image = document.createElement("img");
        image.src = window.URL.createObjectURL(file);
        image.style.maxWidth = "80%";

        fileToUpload = {
            file: image,
            type: "image"
        };
    } else {
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

        fileToUpload = {
            file: uploadFile,
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

document.body.addEventListener("", () => {
    window.scrollTo(0, document.body.scrollHeight);
});

/**
 * @param {string} message
 * @param {{ file: HTMLImageElement, type: "image" | "file" }} fileOptions
 */
function appendMessage(message, fileOptions) {
    const urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g);
    const messageElement = document.createElement("div");
    messageElement.style.display = "flex";
    messageElement.style.flexDirection = "column";
    messageElement.style.justifyContent = "flex-start";
    messageElement.style.alignItems = "flex-start";

    if (message.match(urlRegex)) {
        const hyperlink = document.createElement("a");
        hyperlink.href = message.slice(4), hyperlink.innerText = message.slice(4), hyperlink.target = "_blank";
        if (fileOptions) {
            messageElement.innerHTML = `[${new Date().toLocaleTimeString()}] You: ${hyperlink.outerHTML}
            ${fileOptions.file.outerHTML}
            `;
        } else messageElement.innerHTML = `[${new Date().toLocaleTimeString()}] You: ${hyperlink.outerHTML}`;
    } else {
        if (fileOptions) {
            messageElement.innerHTML = `${message}
            ${fileOptions.file.outerHTML}
            `;
        } else {
            messageElement.innerText = message;
        }
    }

    messageContainer.appendChild(messageElement);

    return messageElement;
};

function onAppend(elem, f) {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function (m) {
            if (m.addedNodes.length) f(m.addedNodes);
        });
    });

    observer.observe(elem, { childList: true });
};