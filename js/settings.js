const getCSS = () => localStorage.getItem("quick_css") || "";
const getCustomJS = () => localStorage.getItem("custom_js") || "";
const getTwemojiEnabled = () => localStorage.getItem("twemoji") || false;
console.log(getTwemojiEnabled())
const getRemoteJS = () => {
    try {
        const remote_js = localStorage.getItem("remote_js");
        const json = JSON.parse(remote_js);
        if (json) {
            const result = json.join('\n');
            return result;
        }
        return "";
    } catch (error) {
        console.error("Error when parsing the JSON array of remote JavaScript scripts!!!", error);
        return "";
    }
};

const updateCSS = (val) => {
    localStorage.setItem("quick_css", val);
    document.getElementById("dynamic-style").textContent = val;
};

const fontStyleTag = el("style", { id: "dynamic-font-style" });
document.head.append(fontStyleTag);

const updateJS = (val) => localStorage.setItem("custom_js", val);
const updateTwemojiEnabled = (val) => {
    localStorage.setItem("twemoji", val)
    document.getElementById("dynamic-font-style").textContent = val ? "body{font-family: var(--font), twemoji}" : "";
};

const updateRemoteJS = (val) => {
    const split = val.split(/\r\n?|\n/);
    const parsed = JSON.stringify(split);
    localStorage.setItem("remote_js", parsed);
};

const styleTag = el("style", { id: "dynamic-style", textContent: getCSS() });
document.head.append(styleTag);

const createSettingsView = () => {
    let twemojiCheckbox = el("input", {
        type: "checkbox",
        id: "twemojiCheckbox",
        oninput: (e) => updateTwemojiEnabled(e.target.checked)
    });
    if (getTwemojiEnabled() === "true") {
        twemojiCheckbox.checked = true;
    } else if (getTwemojiEnabled() == "false") {
        twemojiCheckbox.checked = false;
    }

    const customJsTextarea = el("textarea", {
        value: getCustomJS(),spellcheck: false,
        oninput: (e) => updateJS(e.target.value)
    });
    const remoteJsTextarea = el("textarea", {
        value: getRemoteJS(),spellcheck: false,
        oninput: (e) => updateRemoteJS(e.target.value)
    });
    const quickCssTextarea = el("textarea", {
        value: getCSS(),spellcheck: false,
        oninput: (e) => updateCSS(e.target.value)
    });

    return [
        el("div", {}, [
            twemojiCheckbox,
            el("label", {
                textContent: " Twemoji",
                htmlFor: "twemojiCheckbox",
            }),
        ]),
        el("div", { className: "flexColumn" }, [
            el("span", {textContent: "CustomJS",}),
            customJsTextarea
        ]),
        el("div", { className: "flexColumn" }, [
            el("span", {textContent: "Remote JS (Links separated by newlines)",}),
            remoteJsTextarea
        ]),
        el("div", { className: "flexColumn" }, [
            el("span", {textContent: "QuickCSS",}),
            quickCssTextarea
        ]),
    ]
};

const createSaveView = () => {
    const fileInput = el("input", { type: "file", style: "display: none;" });

    return [
        el("button", {
            textContent: "Load data",
            onclick: () => handleLoad(fileInput)
        }),
        el("button", {
            textContent: "Save data",
            onclick: handleSave
        }),
        el("button", {
            textContent: "Restart current run",
            className: "btn-danger",
            onclick: handleReset
        })
    ];
};

const createInfoView = () => {
    return [
        el("h1", {
            textContent: "simbyte",
            className: "old-font"
        }),
        el("span", {textContent: "2026, Licensed under the AGPL",}),
        el("span", {textContent: "Programmed by acidbox (aka stuxvii)",}),
        el("span", {textContent: "Concept by oxycodone",}),
        el("span", {textContent: "Content by acidbox, oxycodone, hydrosu, and all contributors",}),
        el("div", {}, [
            el("a", {textContent: "GitHub", href: "https://github.com/stuxvii/simbyte"}),
            el("a", {textContent: "Discord", href: "https://discord.gg/UhYpXxKxzY"}),
        ]),
    ];
};

function handleSave() {
    const blob = new Blob([generateSaveFile()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = el("a", {
        href: url,
        download: `simbyte_save_${Date.now()}.json`
    });
    link.click();
    URL.revokeObjectURL(url);
}

function handleLoad(fileInputElement) {
    fileInputElement.value = "";
    fileInputElement.addEventListener("change", () => {
        const file = fileInputElement.files[0]
        if (!file || !confirm("Overwrite current game?")) return;
        const reader = new FileReader();
        reader.onload = e => {
            localStorage.setItem("save", e.target.result);
            location.reload();
        };
        reader.readAsText(file);
    });
        
    fileInputElement.click();
}

function handleReset() {
    if (confirm("Reset save permanently?")) {
        localStorage.setItem("save", null);
        location.reload();
    }
}

const openMenu = (content) => {
    popupBox.replaceChildren();
    if (Array.isArray(content)) {
        content.forEach(c => popupBox.append(c));
    } else {
        popupBox.append(content);
    }
    popupBox.append(el("button", {
        textContent: "Close",
        onclick: () => toggleVisibility(popupContainer)
    }));
    toggleVisibility(popupContainer);
};

if (getTwemojiEnabled() == "true") {
    document.getElementById("dynamic-font-style").textContent = "body{font-family: var(--font), twemoji}";
} else {
    document.getElementById("dynamic-font-style").textContent = "";
}

const js = getCustomJS();
if (js) {
    console.log("Loading quick scripts...")
    const scriptTag = document.createElement("script");
    scriptTag.textContent = js;
    injectedScripts.append(scriptTag);
}

const getRemoteJSArray = () => {
    try {
        const remote_js = localStorage.getItem("remote_js");
        const json = JSON.parse(remote_js);
        return json;
    } catch (error) {
        console.error("Error when parsing the JSON array of remote JavaScript scripts!!!", error);
        return [];
    }
};
const rem_js = getRemoteJSArray() || [];
rem_js.forEach(link => {
    if (link == "") return;
    console.log(`Loading scripts from ${link}...`)
    const scriptTag = document.createElement("script");
    scriptTag.src = link;
    injectedScripts.append(scriptTag);
});

let windowSettings = new InsideWindow({
    title: "Settings",
    body: createSettingsView()
})

let windowInfo = new InsideWindow({
    title: "simver",
    body: createInfoView(),
})

let windowSave = new InsideWindow({
    title: "Save management",
    body: createSaveView(),
})

savePanel.addEventListener("click", () => openWindow(windowSave));
showInfo.addEventListener("click", () => openWindow(windowInfo));
showSettings.addEventListener("click", () => openWindow(windowSettings));

if (navigator.maxTouchPoints > 0) alert("simbyte is best enjoyed in a desktop.");