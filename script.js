const POKEAPI_URL = "https://pokeapi.co/api/v2";
const pokemonContainer = document.getElementById("pokemonContainer");
const loadingSpinner = document.getElementById("loadingSpinner");
const searchForm = document.getElementById("searchForm");
const typeDropdown = document.getElementById("typeDropdown");
let selectedType = null;



async function fetchPokemon(pokemonName) {
  try {
    showSpinner(true);
    const response = await fetch(
      `${POKEAPI_URL}/pokemon/${pokemonName.toLowerCase()}`,
    );

    if (!response.ok) {
      throw new Error("Pokémon não encontrado");
    }

    const data = await response.json();
    displayPokemonCard(data);
    showSpinner(false);
  } catch (error) {
    console.error("Erro ao buscar Pokémon:", error);
    pokemonContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Pokémon não encontrado!</div></div>`;
    showSpinner(false);
  }
}

async function fetchPokemonList(limit = 60, offset = 0) {
  try {
    showSpinner(true);
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const response = await fetch(
      `${POKEAPI_URL}/pokemon?limit=${limit}&offset=${offset}`,
    );
    const data = await response.json();

    pokemonContainer.innerHTML = "";

    for (let pokemon of data.results) {
      const details = await fetch(pokemon.url).then((r) => r.json());
      
      if (!favorites.includes(details.name)) {
        displayPokemonCard(details);
      }
    }
    showSpinner(false);
  } catch (error) {
    console.error("Erro ao buscar lista:", error);
    showSpinner(false);
  }
}

async function fetchPokemonByType(type) {
  try {
    showSpinner(true);
    const response = await fetch(`${POKEAPI_URL}/type/${type.toLowerCase()}`);
    const data = await response.json();

    pokemonContainer.innerHTML = "";

    for (let pokemon of data.pokemon.slice(0, 20)) {
      const details = await fetch(pokemon.pokemon.url).then((r) => r.json());
      displayPokemonCard(details);
    }
    showSpinner(false);
  } catch (error) {
    console.error("Erro ao buscar por tipo:", error);
    showSpinner(false);
  }
}

function displayPokemonCard(pokemon) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const isFavorite = favorites.includes(pokemon.name);

  const card = document.createElement("div");
  card.className = "col-md-4 col-lg-3";

  const types = pokemon.types.map((t) => t.type.name).join(", ");
  const image =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;

  card.innerHTML = `
    <div class="card h-100 shadow-sm">
      <img src="${image}" class="card-img-top p-3" alt="${pokemon.name}" style="height: 200px; object-fit: contain;">
      <div class="card-body">
        <h5 class="card-title text-capitalize">${pokemon.name}</h5>
        <p class="card-text">
          <small class="text-muted">Tipos: ${types}</small>
        </p>
        <div class="d-flex justify-content-between">
          <button class="btn btn-sm ${isFavorite ? "btn-danger" : "btn-outline-danger"}"
            onclick="saveFavorite('${pokemon.name}')">
            ❤️
          </button>
        </div>
      </div>
    </div>
  `;

  pokemonContainer.appendChild(card);
}


function showSpinner(show) {
  loadingSpinner.style.display = show ? "block" : "none";
}

function saveFavorite(pokemonName) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (!favorites.includes(pokemonName)) {
    favorites.push(pokemonName);
  } else {
    favorites = favorites.filter((f) => f !== pokemonName);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));

  refreshSections(); 
}


function refreshSections() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const favoritesList = document.getElementById("favoritesList");
  const pokemonContainer = document.getElementById("pokemonContainer");

  favoritesList.innerHTML = "";
  pokemonContainer.innerHTML = "";

  if (favorites.length > 0) {
    favoritesList.style.display = "";
    favorites.forEach((pokemon) => {
      fetchPokemonAndDisplay(pokemon, favoritesList);
    });
  } else {
    favoritesList.style.display = "none";
  }

  fetchPokemonListFiltered();
}

async function fetchPokemonListFiltered(limit = 151, offset = 0) {
  try {
    showSpinner(true);
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const searchValue = searchInput.value.trim().toLowerCase();

    const response = await fetch(
      `${POKEAPI_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();

    pokemonContainer.innerHTML = "";

    for (let pokemon of data.results) {
      const details = await fetch(pokemon.url).then((r) => r.json());

      const nameMatch = details.name.includes(searchValue);
      const typeMatch = selectedType
        ? details.types.some((t) => t.type.name === selectedType)
        : true;

      if (nameMatch && typeMatch && !favorites.includes(details.name)) {
        displayPokemonCard(details);
      }
    }
      if (!favorites.includes(details.name)) {
  displayPokemonCard(details);
}

    showSpinner(false);
  } catch (error) {
    console.error("Erro ao buscar lista filtrada:", error);
    showSpinner(false);
  }
}


async function fetchPokemonAndDisplay(pokemonName, container) {
  try {
    const response = await fetch(
      `${POKEAPI_URL}/pokemon/${pokemonName.toLowerCase()}`,
    );
    if (response.ok) {
      const data = await response.json();
      const card = document.createElement("div");
      card.className = "col-md-4 col-lg-3";

      const types = data.types.map((t) => t.type.name).join(", ");
      const image =
        data.sprites.other["official-artwork"].front_default ||
        data.sprites.front_default;

      card.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${image}" class="card-img-top p-3" alt="${data.name}" style="height: 200px; object-fit: contain;">
          <div class="card-body">
            <h5 class="card-title text-capitalize">${data.name}</h5>
            <p class="card-text">
              <small class="text-muted">ID: ${data.id}</small><br>
              <small class="text-muted">Tipos: ${types}</small>
            </p>
            <div class="d-flex justify-content-between">
              
              <button class="btn btn-sm btn-danger" onclick="saveFavorite('${data.name}')">❤️</button>
            </div>
          </div>
        </div>
      `;

      container.appendChild(card);
    }
  } catch (error) {
    console.error("Erro ao buscar pokémon:", error);
  }
}



searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  fetchPokemonListFiltered();
});



document.querySelectorAll("#typeDropdown .dropdown-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
   selectedType = e.target.getAttribute("data-type") || null;


    const dropdownButton = document.querySelector(".dropdown-toggle");
    dropdownButton.textContent =
      selectedType.charAt(0).toUpperCase() + selectedType.slice(1);

    pokemonContainer.innerHTML = "";
    fetchPokemonListFiltered(); 
  });
});

window.addEventListener("load", () => {
  refreshSections(); 
});

