const Max_POKEMON = 1025;
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");
const pokemonGenerations = {};

let allPokemons = [];

fetch(`https://pokeapi.co/api/v2/pokemon-species?limit=10000&offset=0`)
.then((response)=> response.json())
.then((data) => {
    allPokemons = data.results;

    fetchGenerationData().then(() => {
        displayPokemons(allPokemons);
    });


    // console.log(data.results);
    // console.log(data.results[2]);
    // console.log(data.results[2].name);
    // console.log(data.results[2].url);
    //
});


async function fetchGenerationData() {
    
    for (let i = 1; i <= 9; i++) {
        const res = await fetch(`https://pokeapi.co/api/v2/generation/${i}`);
        const data = await res.json();

        data.pokemon_species.forEach(species => {
            const id = species.url.split("/")[6];
            pokemonGenerations[id] = data.name;  // e.g., "generation-i"
        });
    }
}


async function fetchPokemonDataBeforeRedirect(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(res => res.json())
        ]);

        console.log("Pokemon Data:", pokemon);
        console.log("Species Data:", pokemonSpecies);

        return true;
    } catch (error) {
        console.error("Failed to fetch Pokemon Data:", error);
        return false;
    }
} 

function displayPokemons(pokemon){
    listWrapper.innerHTML = "";

    let lastGeneration = null;

    pokemon.forEach((pokemon) => {
        const pokemonID = pokemon.url.split("/")[6];

        const generation = pokemonGenerations[pokemonID];

        // Add generation header if this Pokémon is from a new generation
        if (generation && generation !== lastGeneration) {
            const genHeader = document.createElement("div");
            genHeader.className = "generation-header";
            genHeader.innerHTML = `Generation ${generation.toUpperCase().replace("GENERATION-", "").replace("-", " ")}`;
            listWrapper.appendChild(genHeader);
            lastGeneration = generation;
        }


        const listItem = document.createElement("div");
        listItem.className = 'list-item';
        listItem.innerHTML = `
            <div class = "number-wrap">
                <p class= "caption-fonts">#${pokemonID}</p>
            </div>
            <div class = "img-wrap">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonID}.png" alt ="${pokemonID}"/>
            </div>
            <div class = "name-wrap">
                <p class="Body3-fonts">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
            </div>
        `;       


        listItem.addEventListener("click", async() => {
            const success = await fetchPokemonDataBeforeRedirect(pokemonID);

            if (success){
                window.location.href = `Details.html?id=${pokemonID}`;
            }
        });

        listWrapper.appendChild(listItem);


    });
}


searchInput.addEventListener("keyup", handleSearch);

function handleSearch(){
    const searchTerm = searchInput.value.toLowerCase();
    let filteredPokemons;

    if(numberFilter.checked){
        filteredPokemons = allPokemons.filter((pokemon) => {
            const pokemonID = pokemon.url.split("/")[6];
            return pokemonID.startsWith(searchTerm)
        });
    } else if(nameFilter.checked){
        filteredPokemons = allPokemons.filter((pokemon) => {
        return pokemon.name.toLowerCase().includes(searchTerm)
        });
    }else{
        filteredPokemons = allPokemons
    }
    displayPokemons(filteredPokemons);

    if(filteredPokemons.length === 0){
        notFoundMessage.style.display = "block"
    }else{
        notFoundMessage.style.display = "none"
    }
}


const closeButton = document.querySelector(".search-close-icon");
closeButton.addEventListener("click", clearSearch)

function clearSearch(){
    searchInput.value = "";
    displayPokemons(allPokemons);
    notFoundMessage.style.display = "none"
}

