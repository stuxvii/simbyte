let meter_elements = {};
const stats = {
    strength: "💪",
    respect: "🎖️",
    happiness: "☺️",
    intelligence: "💡",
    health: "💊",
    looks: "👁️",
    karma: "👼"
};

let your = new Person();
let canInteract = true;
let pastGenerationsAmount = 2;
let chatlogs = [];

Object.entries(stats).forEach(([key, icon]) => {
    const whateverdiv = document.createElement("div");

    const meter = document.createElement("span");
    meter.classList.add("piechart");
    meter.style.setProperty("--p", your[key]);

    const iconSpan = document.createElement("strong");

    iconSpan.textContent = icon;

    whateverdiv.addEventListener("mouseover", function (e) {
        iconSpan.textContent = your[key] + "%";
    });
    whateverdiv.addEventListener("mouseleave", function (e) {
        iconSpan.textContent = icon;
    });

    whateverdiv.append(iconSpan);
    whateverdiv.append(meter);
    yourStatistics.append(whateverdiv);
    meter_elements[key] = meter;
});

function toggleVisibility(element) {
    if (element.style.display == "none") {
        element.style.display = ""
    } else {
        element.style.display = "none"
    }
}

function alert(urtext) {
    let error = new InsideWindow({
        title: "Alert",
        body: el("div", {}, [
            el("span", { textContent: urtext})
        ]),
        xpos: window.innerWidth/3,
        ypos: window.innerHeight/3,
    });

    error.xpos += 10*windows.length;
    error.ypos += 10*windows.length;

    openWindow(error);
}

function print(urtext) {
    let txt = document.createElement("span");
    txt.textContent = urtext;
    textContainer.append(txt);
    let br = document.createElement("br");
    textContainer.append(br);

    chatlogs.push({
        text: urtext,
        type: "span"
    });
}

function space() {
    let br = document.createElement("br");
    textContainer.append(br);
    chatlogs.push({
        type: "br"
    });
}

function header(urtext) {
    let txt = document.createElement("h2");
    txt.textContent = urtext;
    textContainer.append(txt);
    chatlogs.push({
        text: urtext,
        type: "h2"
    });
}

const el = (tag, props = {}, children = []) => {
    const element = document.createElement(tag);
    Object.assign(element, props);
    children.forEach(child => element.append(child));
    return element;
};

function clamp(num, min, max) {
    return num<=min?min:num>=max?max:num
}

function generateSaveFile() {
    return JSON.stringify({characterData: your, seed: my_rng.seed, history: chatlogs});
}

function update_meters() {
    Object.entries(stats).forEach(([key, _]) => your[key] = Math.floor(clamp(your[key], 0, 100)));
    // dont update any game state beyond the line above.
    for (let key in meter_elements) {
        meter_elements[key].style.setProperty("--p", your[key]);
    }

    infoBox.innerHTML = null;

    let close_btn = document.createElement("span");
    close_btn.textContent = "x";
    close_btn.style.cursor = "pointer";
    close_btn.style.textDecoration = "underline";

    close_btn.addEventListener("click", function (e) {
        infoBox.style.display = "none";
    });

    infoBox.append(close_btn);

    effectsList.innerHTML = null;

    for (let e in [your.addictions, your.illnesses].flat()) {
        const effect = [your.addictions, your.illnesses].flat()[e];
        let effectDiv = document.createElement("div");
        let iconSpan = document.createElement("span");
        iconSpan.textContent = effect.icon;
        effectDiv.append(iconSpan);

        let infoDiv = document.createElement("div");
        infoDiv.style.display = "none";

        effectDiv.append(infoDiv);

        let nameDiv = document.createElement("div");
        let effectName = document.createElement("strong");
        effectName.textContent = effect.name;
        nameDiv.append(effectName);

        infoDiv.append(nameDiv);

        let descDiv = document.createElement("div");
        descDiv.classList.add("flexColumn")
        let descText = document.createElement("span");
        descText = effect.description;

        descDiv.append(descText);

        Object.entries(stats).forEach(([key, _]) => {
            if (effect[key]) {
                let textElement = document.createElement("span");
                textElement.textContent = effect[key] + " " + key + ".";
                descDiv.append(textElement);
            }
        });
        
        effectDiv.addEventListener("click", function (e) {
            if (infoDiv.style.display == "none") {
                infoDiv.style.display = ""
                nameDiv.prepend(iconSpan);
            } else {
                effectDiv.append(iconSpan);
                infoDiv.style.display = "none"
            }
        });

        infoDiv.append(descDiv);
        effectDiv.append(infoDiv);
        effectsList.append(effectDiv);
    }

    yourInfo.textContent = `${your.name} ${your.surname} - $${your.money}`;

    localStorage.setItem("save", generateSaveFile());

    textContainer.scrollTo({
        top: textContainer.scrollHeight,
        behavior: 'smooth'
    });
}

function presentChoice(description, options) {
    const choiceDiv = document.createElement("div");
    choiceDiv.className = "choice-modal";
    choiceDiv.innerHTML = `<p>${description}</p>`;
    twinkleSFX.play();
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt.text;
        btn.onclick = () => {
            opt.callback();
            choiceDiv.remove();
            canInteract = true;
            update_meters();
        };
        choiceDiv.appendChild(btn);
    });

    textContainer.appendChild(choiceDiv);
    canInteract = false;
}

function generateAncestors(person, generationsLeft) {
    if (generationsLeft <= 0) return;
    person.giveParents();

    person.family.forEach(parentEntry => {
        let parent = parentEntry.person;
        parent.age += person.age; 

        generateAncestors(parent, generationsLeft - 1);
    });

    person.inheritTraits();
}

/**
 * Creates a family tree using HTML
 * @param {person} node 
 * @returns HTML tree portion as string
 */
function createTreeHTML(node) {
    let el = node;
    if (!el.name) el = el["person"];
    
    let html = `<li><span href="#">${el.name} ${el.surname}</span>`;
    if (el.family && el.family.length > 0) {
        html += `<ul>`;
        el.family.forEach(member => {
            html += createTreeHTML(member); // RECURSION!!!!
        });
        html += `</ul>`;
    }

    html += `</li>`;
    return html;
}

function clearOutWindows() {
    Object.entries(windowElements).forEach(element => {
        windowElements.splice(windowElements.indexOf(element), 1);
    });
    Object.entries(windows).forEach(element => {
        windows.splice(windows.indexOf(element), 1);
    });
    windows = null;
    update_meters();
}

function processYearlyEvents(person) {
    if (person.lifeExpectancy <= person.age) {
        console.log(person)
        person.kill()
        clearOutWindows();
    }

    const eligibleEvents = eventPool.flat().filter(ev => ev.isEligible(person));

    for (let e in [person.addictions, person.illnesses].flat()) {
        const effect = [person.addictions, person.illnesses].flat()[e];
        Object.entries(stats).forEach(([key, _]) => {
            if (effect[key]) {
                person[key] += effect[key];
            }
        });
        person.lifeExpectancy -= effect.lifeExpectancyReduction;
        if (effect.monetary >= person.money) {
            person.money += effect.monetary;
        } else {
            person.happiness += effect.happiness;
        }
    }

    for (const event of eligibleEvents) {
        if (rand_int(100) / 100 < event.chance) {
            header(event.title);
            print(event.description);
            if (Object.hasOwn(event, 'effect'))
            event.effect(person);
            break
        }
    }

    Object.entries(stats).forEach(([key, _]) => {
        person[key] += 10-rand_int(20);
        person[key] = clamp(person[key], 0, 100);
    });
}