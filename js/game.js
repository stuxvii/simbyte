function begin() {
    let saveJSON = localStorage.getItem("save");
    let save = JSON.parse(saveJSON);

    if (save && save.characterData) {
        your = save.characterData;
        your.birthday = new Date(your.birthday);
        if (save.history) {
            for (let id = 0; id < save.history.length; id++) {
                const element = save.history[id];
                switch (element.type) {
                    case "h2":
                        header(element.text);
                        break;
                    case "span":
                        print(element.text);
                        break;
                    case "br":
                        space();
                        break;
                
                    default:
                        break;
                }
            }
        }

        update_meters();
        return;
    }

    generateAncestors(your, pastGenerationsAmount)

    if (rand_int(500) == 255) {
        your.gender = "intersex";
    } else {
        your.gender = 0 == rand_int(2) ? "male" : "female";
    }

    your.name = your.gender == "male" ? boy_names[rand_int(boy_names.length)] : girl_names[rand_int(girl_names.length)];
    your.surname = your.family[rand_int(2)]["person"].surname;
    your.birth_reason = birth_reasons[rand_int(birth_reasons.length)];
    your.country = countries[rand_int(countries.length)];
    header("Age: 0. Welcome to simbyte.");
    print(`I was born ${your.gender}. My name is ${your.name} ${your.surname}.`);
    print(`I was born in ${your.country}. on the fateful day of ${your.birthday.toLocaleString('default', { month: 'long' })} ${your.birthday.getDate()}, as a ${new ZodiacSign(your.birthday).sign}. ${your.birth_reason}`);
    space();
    print(`You can check your family tree after pressing the 👪 icon.`);

    update_meters();
}

window.addEventListener('beforeunload', function (e) {e.preventDefault()});
begin();