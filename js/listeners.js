toggleFullscreen.addEventListener("click", () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
    }
    document.documentElement.requestFullscreen();
});

ageUp.addEventListener("click", function () {
    if (!canInteract) return;
    your.age++
    for (let entry in your.family) {
        let person = your.family[entry]["person"];
        if (person.age >= person.lifespan) {
            print(`Your ${Relation.getString(person.relation).toLowerCase()}, ${person.name}, has passed away at the age of ${person.age}`)
            return;
        }
        person.age++
    }
    header("Age: " + your.age);
    processYearlyEvents(your);
    update_meters();
    tickingSFX.play();
});

let activitiesWindow = new InsideWindow({
    title: "Activities",
    body: el("div"),
})

showActivities.addEventListener("click", (e) => {
    if (!canInteract) return;
    const tempElement = el("div", { className: "flexColumn"});
    Object.entries(activitiesList).forEach(activity => {
        if (your.age < activity[1].minAge) return;
        let activityElement = el("span", { className: "button", textContent: activity[1].name});
        activityElement.addEventListener("click", () => {
            openWindow(activity[1].callback());
        })
        tempElement.append(activityElement);
    });
    activitiesWindow.body = tempElement;
    console.log(!!activitiesWindow.body.childNodes.length)
    if (!activitiesWindow.body.childNodes.length) activitiesWindow.body = el("span", {textContent: "You have no available activities."})
    openWindow(activitiesWindow);
});

let familyTree = new InsideWindow({
    title: "Family Tree",
    body: el("div", { classList: "tree" }, [el("ul", { innerHTML: createTreeHTML(your) })]),
})

showFamilyTree.addEventListener("click", (e) => {
    if (!canInteract) return;
    familyTree.body = el("div", { classList: "tree" }, [el("ul", { innerHTML: createTreeHTML(your) })]);
    openWindow(familyTree);
});