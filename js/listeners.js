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

showShop.addEventListener("click", function (e) {
    if (!canInteract) return;
    currentIBPanel = infoBoxPanels.shop;
    update_meters();
    infoBox.style.display = "flex";
});

showFamilyTree.addEventListener("click", function (e) {
    if (!canInteract) return;
    currentIBPanel = infoBoxPanels.family;
    update_meters();
    infoBox.style.display = "flex";
});