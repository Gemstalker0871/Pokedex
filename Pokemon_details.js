let currentPokemonID = null;
const Max_POKEMON = 1025;

document.addEventListener("DOMContentLoaded", () => {
    const Max_POKEMON = 1025;
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonID, 10);


    if (id < 1 || id > Max_POKEMON){
        return(window.location.href = "./index.html");
    }

    currentPokemonID = id;

    loadPokemon(id);
})

async function loadPokemon(id){
    try{

        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(res => res.json())
        ]);

        const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move")
        abilitiesWrapper.innerHTML = "";

        if(currentPokemonID === id){
            displayPokemonDetails(pokemon, pokemonSpecies);
            await displayForms(pokemonSpecies.varieties);
            const flavourText = getEnglishFlavourText(pokemonSpecies);
            document.querySelector(".body3-fonts.pokemon-description").textContent = flavourText;
            
            const[leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) => document.querySelector(sel)) 

            leftArrow.removeEventListener("click", navigatePokemon);
            rightArrow.removeEventListener("click", navigatePokemon);

            if(id !== 1){
                leftArrow.addEventListener("click", () => {
                    navigatePokemon(id - 1);
                })
            }
            if(id !== Max_POKEMON){
                rightArrow.addEventListener("click", () => {
                    navigatePokemon(id + 1);
                })
            }


            window.history.pushState({}, "", `./Details.html?id=${id}`)

        }

        return true;
    }
    catch(error){
        console.error("Error Occured", error);
        return false;
    }
}


async function navigatePokemon(id){
    currentPokemonID = id;
    await loadPokemon(id)
}

const typeColours = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    grass: "#7AC74C",
    electric: "#F7D02C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD"
};


function setElementStyles(elemnts, cssProperty, value){
    elemnts.forEach(element => {
        element.style[cssProperty] = value;
        
    });
}


function rgbaFromHex(hexColour){
    return [parseInt(hexColour.slice(1,3), 16), parseInt(hexColour.slice(3,5), 16), parseInt(hexColour.slice(5,7), 16)].join(", ");
}

function setTypeBackgroundColour(pokemon){
    const mainType = pokemon.types[0].type.name;
    const colour = typeColours[mainType];

    if(!colour){
        console.warn(`Colour Not Defined for Type: ${mainType}`)
        return;
    }

    const detailMainElement = document.querySelector(".detail-main"); 
    setElementStyles([detailMainElement], "backgroundColor", colour);
    setElementStyles([detailMainElement], "borderColor", colour);
    

    setElementStyles(document.querySelectorAll(".power-wrapper > p"), "backgroundColor", colour)
    setElementStyles(document.querySelectorAll(".stats-wrap  p.stats"), "color", colour)
    setElementStyles(document.querySelectorAll(".stats-wrap .progress-bar"), "color", colour)

    const rbgaColour = rgbaFromHex(colour);
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
        .stats-wrap .progress-bar::-webkit-progress-bar {
            background-color: rgba(${rbgaColour}, 0.5);
        }

        .stats-wrap .progress-bar::-webkit-progress-value {
            background-color: ${colour};
        }
    `;

    document.head.appendChild(styleTag);
}


function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

function createAndAppendElement(parent, tag, options ={}){
    const element = document.createElement(tag);
    Object.keys(options).forEach((key) => {
        element[key] = options[key];

    })

        parent.appendChild(element);
        return element;
}


function displayPokemonDetails(pokemon, pokemonSpecies){
    const speciesName = capitalizeFirstLetter(pokemonSpecies.name);
    const { name, id, types, weight, height, abilities, stats } = pokemon;

    // Use speciesName here instead of capitalizeFirstLetter(name)
    document.querySelector("title").textContent = speciesName;

    const detailMainElement = document.querySelector(".detail-main")
    detailMainElement.classList.add(name.toLowerCase());  // keep this as-is, for CSS

    document.querySelector(".name-wrap .name").textContent = speciesName;

    document.querySelector(".pokemon-id-wrap .body2-fonts").textContent = `#${String(id).padStart(3, "0")}`;

    const imageElement = document.querySelector(".detail-img-wrapper img");
    imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

    const typeWrapper = document.querySelector(".power-wrapper");
    typeWrapper.innerHTML = "";

    types.forEach(({type}) => {
        createAndAppendElement(typeWrapper, "p", {
            className: `body3-fonts type ${type.name}`,
            textContent: type.name,
        })
    });

    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight").textContent = `${weight / 10}Kg`
    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height").textContent = `${height / 10}m`

    const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move")
const abilityNames = abilities.map(({ ability }) => ability.name).join(", ");
const abilityElement = createAndAppendElement(abilitiesWrapper, "p", {
    className: "body3-fonts",
    textContent: abilityNames,
});
abilityElement.style.whiteSpace = "normal";
abilityElement.style.wordBreak = "keep-all";
abilityElement.style.overflowWrap = "break-word";
   

    const startsWrapper = document.querySelector(".stats-wrapper")
    startsWrapper.innerHTML= ""

    const statNameMapping = {
        hp: "HP",
        attack: "ATK",
        defense: "DEF",
        "special-attack": "SATK",
        "special-defense": "SDEF",
        speed: "SPD",
    }

    stats.forEach(({stat, base_stat}) => {
        const statDiv = document.createElement("div");
        statDiv.className = "stats-wrap"
        startsWrapper.appendChild(statDiv);


        createAndAppendElement(statDiv, "p", {
        className: "body3-fonts stats",
        textContent: statNameMapping[stat.name],
        })


        createAndAppendElement(statDiv, "p", {
        className: "body3-fonts",
        textContent: String(base_stat).padStart(3,"0"),
        })


        createAndAppendElement(statDiv, "progress", {
        className: "progress-bar",
        value: base_stat,
        max: 200,
        })
    })


    setTypeBackgroundColour(pokemon);

}


    function getEnglishFlavourText(pokemonSpecies){
        for (let entry of pokemonSpecies.flavor_text_entries)
        {
            if(entry.language.name === "en"){
                let flavour = entry.flavor_text.replace(/\f/g, " ");
                return flavour;
            }
        }

            return""
        
    }


    async function displayForms(varieties) {
    const formWrapper = document.querySelector(".form-wrapper");
    formWrapper.innerHTML = "";

     const alternateForms = varieties.filter(variety => !variety.is_default);

    for (let variety of alternateForms) {
        const res = await fetch(variety.pokemon.url);
        const data = await res.json();

        const imgSrc = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

        if (imgSrc) {
            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = data.name;
            img.title = capitalizeFirstLetter(data.name.replace(/-/g, " "));
            formWrapper.appendChild(img);
        }
    }
}