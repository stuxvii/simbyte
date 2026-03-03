let activeWindowData;
let activeWindowElement;
let mouseIsDown;

let windows = [];
let windowElements = [];

let lastMouseMoveX = 0;
let lastMouseMoveY = 20;

const openWindow = (passedInWindow) => {
    if (windows.includes(passedInWindow)) return;
    let windowContainer = el("div", { className: "popupBox" });
    let windowContainerTopbar = el("div", { className: "window-topbar"}, [
        el("span", { textContent: passedInWindow.title}),
    ]);

    let windowCloseButton = el("span", { textContent: "X", className: "window-close-btn"});
    
    windowCloseButton.addEventListener("click", (_) => {
        windowElements.splice(windowElements.indexOf(windowContainer), 1);
        windows.splice(windows.indexOf(passedInWindow), 1);
        windowContainer.remove();
        windowContainerTopbar.remove();
        activeWindowData = null;
        activeWindowElement = null;
    })

    windowContainerTopbar.append(windowCloseButton);
    windowContainer.append(windowContainerTopbar);
    windowElements.push(windowContainer);

    if (passedInWindow.xpos == 0 && passedInWindow.ypos == 0) {
        passedInWindow.ypos = 22+(50*windows.length)
        passedInWindow.xpos = 50*windows.length
    }

    windowContainer.style.left = `${passedInWindow.xpos}px`;
    windowContainer.style.top = `${passedInWindow.ypos}px`;

    if (Array.isArray(passedInWindow.body)) { passedInWindow.body.forEach(c => windowContainer.append(c));
    } else { windowContainer.append(passedInWindow.body); }

    windowContainer.addEventListener("mousedown", (e) => {
        if (activeWindowData == passedInWindow) return;
        activeWindowElement = windowContainer;
        activeWindowData = passedInWindow;
        document.body.append(activeWindowElement);
    });
    windowContainerTopbar.addEventListener("mousedown", (e) =>{
        mouseIsDown = true;
        lastMouseMoveX = e.clientX;
        lastMouseMoveY = e.clientY;
        if (activeWindowElement) activeWindowElement.style.zIndex = null;
        activeWindowElement = windowContainer;
        windowContainer.style.zIndex = "99";
        activeWindowData = passedInWindow;
    });
    document.body.append(windowContainer)
    passedInWindow.containerElement = windowContainer;
    windows.push(passedInWindow)
};
    
window.addEventListener("mousemove", (e) => {
    if (!mouseIsDown) return;

    const deltaX = e.clientX - lastMouseMoveX;
    const deltaY = e.clientY - lastMouseMoveY;

    activeWindowData.xpos += deltaX;
    activeWindowData.ypos += deltaY;
    if (activeWindowData.ypos < 22) {
        activeWindowData.ypos = 22
    }
    if (activeWindowData.xpos < 0) {
        activeWindowData.xpos = 0
    }
    if (activeWindowData.xpos > window.innerWidth - activeWindowElement.getBoundingClientRect().width) {
        activeWindowData.xpos = window.innerWidth - activeWindowElement.getBoundingClientRect().width
    }

    activeWindowElement.style.left = `${activeWindowData.xpos}px`;
    activeWindowElement.style.top = `${activeWindowData.ypos}px`;
    lastMouseMoveX = e.clientX;
    lastMouseMoveY = e.clientY;
});

window.addEventListener("mouseup", (e) =>{
    mouseIsDown = false;
});