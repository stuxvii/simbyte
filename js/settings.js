const el = (tag, props = {}, children = []) => {
    const element = document.createElement(tag);
    Object.assign(element, props);
    children.forEach(child => element.append(child));
    return element;
};

const getCSS = () => localStorage.getItem("quick_css") || "";
const getCustomJS = () => localStorage.getItem("custom_js") || "";
const getOldFont = () => localStorage.getItem("old_font") || false;
const getRemoteJS = () => {
    try {
        const remote_js = localStorage.getItem("remote_js");
        const json = JSON.parse(remote_js);
        const result = json.join('\n');
        return result;
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
const updateOldFont = (val) => {
    localStorage.setItem("old_font", val)
    document.getElementById("dynamic-font-style").textContent = val ? ":root{--font: pixel}" : "";
};

const updateRemoteJS = (val) => {
    const split = val.split(/\r\n?|\n/);
    const parsed = JSON.stringify(split);
    localStorage.setItem("remote_js", parsed);
};

const styleTag = el("style", { id: "dynamic-style", textContent: getCSS() });
document.head.append(styleTag);

const createSettingsView = () => {
    const oldFontCheckbox = el("input", {
        checked: getOldFont(),
        type: "checkbox",
        id: "oldFontCheckbox",
        oninput: (e) => updateOldFont(e.target.checked)
    });
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
            oldFontCheckbox,
            el("label", {
                textContent: " Old font",
                for: "oldFontCheckbox",
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
        el("a", {textContent: "GitHub", href: "https://github.com/stuxvii/simbyte"}),
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

if (getOldFont() == "true") {
    document.getElementById("dynamic-font-style").textContent = ":root{--font: pixel}";
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

class InsideWindow {
    constructor({
        title = "",
        body,
        resizeable = false,
        xpos = 50,
        ypos = 20,
    }) {
        this.title = title;
        this.body = body;
        this.resizeable = resizeable;
        this.xpos = xpos;
        this.ypos = ypos;
    }
}

let activeWindowData;
let activeWindowElement;

let windows = [];

let lastMouseMoveX = 0;
let lastMouseMoveY = 20;

const openWindow = (passedInWindow) => {
    if (windows.includes(passedInWindow)) return;
    let windowContainer = el("div", { className: "popupBox" });
    let windowContainerTopbar = el("div", { className: "window-topbar"}, [
        el("span", { textContent: passedInWindow.title}),
    ]);

    let windowCloseButton = el("span", { textContent: "X"});
    windowCloseButton.addEventListener("click", (_) => {
        windowContainer.remove();
        windowContainerTopbar.remove();
        windows.splice(windows.indexOf(passedInWindow), 1);
        activeWindowData = null;
        activeWindowElement = null;
    })

    windowContainerTopbar.append(windowCloseButton);
    windowContainer.append(windowContainerTopbar);

    windowContainer.style.left = `${passedInWindow.xpos}px`;
    windowContainer.style.top = `${passedInWindow.ypos}px`;

    if (Array.isArray(passedInWindow.body)) { passedInWindow.body.forEach(c => windowContainer.append(c));
    } else { windowContainer.append(passedInWindow.body); }

    windowContainer.addEventListener("mousedown", (e) => {document.body.append(windowContainer)});
    windowContainerTopbar.addEventListener("mousedown", (e) =>{
        lastMouseMoveX = e.clientX;
        lastMouseMoveY = e.clientY;
        if (activeWindowElement) activeWindowElement.style.zIndex = null;
        activeWindowElement = windowContainer;
        activeWindowData = passedInWindow;
    });
    document.body.append(windowContainer)
    windows.push(passedInWindow)
};
    
window.addEventListener("mousemove", (e) => {
    if (!activeWindowElement) return;

    const deltaX = e.clientX - lastMouseMoveX;
    const deltaY = e.clientY - lastMouseMoveY;

    activeWindowData.xpos += deltaX;
    activeWindowData.ypos += deltaY;

    activeWindowElement.style.left = `${activeWindowData.xpos}px`;
    activeWindowElement.style.top = `${activeWindowData.ypos}px`;
    lastMouseMoveX = e.clientX;
    lastMouseMoveY = e.clientY;
});

window.addEventListener("mouseup", (e) =>{
    activeWindowElement = null;
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