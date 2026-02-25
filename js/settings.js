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

const createOldFontCheckbox = () => {
    const input = el("input", {
        checked: getOldFont(),
        type: "checkbox",
        id: "oldFontCheckbox",
        oninput: (e) => updateOldFont(e.target.checked)
    });

    return el("div", {}, [
        input,
        el("label", { 
            textContent: " Old font",
            for: "oldFontCheckbox",
        }),
    ]);
};

const createCustomJSView = () => {
    const textarea = el("textarea", {
        value: getCustomJS(),
        spellcheck: false,
        oninput: (e) => updateJS(e.target.value)
    });

    return el("div", { className: "flexColumn" }, [
        el("span", { 
            textContent: "CustomJS", 
        }),
        textarea
    ]);
};

const createRemoteJSView = () => {
    const textarea = el("textarea", {
        value: getRemoteJS(),
        spellcheck: false,
        oninput: (e) => updateRemoteJS(e.target.value)
    });

    return el("div", { className: "flexColumn" }, [
        el("span", { 
            textContent: "Remote JS (Links separated by newlines)", 
        }),
        textarea
    ]);
};

const createQuickCSSView = () => {
    const textarea = el("textarea", {
        value: getCSS(),
        spellcheck: false,
        oninput: (e) => updateCSS(e.target.value)
    });

    return el("div", { className: "flexColumn" }, [
        el("span", { 
            textContent: "QuickCSS", 
        }),
        textarea
    ]);
};

const createSaveView = () => {
    const fileInput = el("input", { type: "file" });

    return [
        fileInput,
        el("button", {
            textContent: "Load data",
            onclick: () => handleLoad(fileInput.files[0])
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

function handleLoad(file) {
    if (!file || !confirm("Overwrite current game?")) return;
    const reader = new FileReader();
    reader.onload = e => {
        localStorage.setItem("save", e.target.result);
        location.reload();
    };
    reader.readAsText(file);
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

document.getElementById("dynamic-font-style").textContent = getOldFont() ? ":root{--font: pixel}" : "";

savePanel.addEventListener("click", () => openMenu(createSaveView()));
showSettings.addEventListener("click", () => openMenu([createOldFontCheckbox(), createQuickCSSView(), createRemoteJSView(), createCustomJSView()]));
