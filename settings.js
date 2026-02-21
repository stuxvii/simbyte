let quick_css = localStorage.getItem("quick_css");

let QuickCSSStyle = document.createElement("style");
QuickCSSStyle.textContent = quick_css;
document.head.append(QuickCSSStyle);

let QuickCSSTitle = document.createElement("span");
QuickCSSTitle.textContent = "QuickCSS";

let QuickCSSTextArea = document.createElement("textarea");
QuickCSSTextArea.value = quick_css;

let QuickCSSDIV = document.createElement("div");
QuickCSSDIV.classList.add("flexColumn")
QuickCSSDIV.append(QuickCSSTitle);
QuickCSSDIV.append(QuickCSSTextArea);

let closeMenuBtn = document.createElement("button");
closeMenuBtn.textContent = "Close";

closeMenuBtn.addEventListener("click", () => {
    localStorage.setItem("quick_css", QuickCSSTextArea.value);
    toggleVisibility(popupContainer);
    space();
    print("refresh to see your changes");
    space();
});

showSettings.addEventListener("click", function (e) {
    popupBox.innerHTML = null;
    popupBox.append(QuickCSSDIV);
    popupBox.append(closeMenuBtn);
    toggleVisibility(popupContainer);
});

toggleFullscreen.addEventListener("click", () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
    }
    document.documentElement.requestFullscreen();
});

let eraseAllData = document.createElement("button");
eraseAllData.textContent = "Restart current run";
eraseAllData.style.backgroundColor = "brown";

eraseAllData.addEventListener("click", () => {
    if (confirm("Do you want to reset your save? This will be permanent.")) {
        localStorage.setItem("save", null);
        toggleVisibility(popupContainer);
        location.reload();
    }
});

let saveData = document.createElement("button");
saveData.textContent = "Save data";

saveData.addEventListener("click", () => {
    let text = generateSaveFile();

    // https://stackoverflow.com/a/18197341
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `simbyte_save for ${new Date}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
});

let loadDataInput = document.createElement("input");
loadDataInput.type = "file";

let loadData = document.createElement("button");
loadData.textContent = "Load data";

loadData.addEventListener("click", () => {
    if (!loadDataInput.files[0]) {
        return;
    }
    let file = loadDataInput.files[0];
    if (!file.type == "application/json") {
        return;
    }

    if (confirm("Do you want to load a save? This will overwrite your current game.")) {
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');

        // https://stackoverflow.com/a/40971885
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            localStorage.setItem("save", content);
            location.reload();
        }
    }
});

savePanel.addEventListener("click", function (e) {
    popupBox.innerHTML = null;
    popupBox.append(loadDataInput);
    popupBox.append(loadData);
    popupBox.append(saveData);
    popupBox.append(eraseAllData);
    popupBox.append(closeMenuBtn);
    toggleVisibility(popupContainer);
});