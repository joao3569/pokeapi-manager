const POKEAPI_URL = "https://pokeapi.co/api/v2";
const pokemonContainer = document.getElementById("pokemonContainer");
const loadingSpinner = document.getElementById("loadingSpinner");
const searchForm = document.getElementById("searchForm");
const typeDropdown = document.getElementById("typeDropdown");
let selectedType = null;


//serve para buscar o pokemon pelo nome e se nao encontrar ele mostra uma mensagem de erro por conta que o fecht serve para puxar ele mais se nao encontrar ele da erro 
// if e aquele conponente se existir aquele pokemon ele mostra se nao existir ele mostra a mensagem de erro 

async function fetchPokemon(pokemonName) {
  try {
    showSpinner(true);
    const response = await fetch(
      `${POKEAPI_URL}/pokemon/${pokemonName.toLowerCase()}`,
    );

    if (!response.ok) {
      throw new Error("Pokémon não encontrado");
    }
//const data e para puxar os dados do pokemon que foi buscado se ele existir ele nao vai mandar pro if
    const data = await response.json();     
    displayPokemonCard(data);
    showSpinner(false);
  } catch (error) {
    console.error("Erro ao buscar Pokémon:", error);
    pokemonContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Pokémon não encontrado!</div></div>`;
    showSpinner(false);
  }
}

// essa função serve para puxar a lista de pokemons da api e mostrar na tela e limitar o numero de pokemons mostrados por vez
async function fetchPokemonList(limit = 60, offset = 0) {
  try {
    showSpinner(true);
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const response = await fetch(
      `${POKEAPI_URL}/pokemon?limit=${limit}&offset=${offset}`,
    );
    const data = await response.json();
// esse innerHTML serve para limpar a tela antes de mostrar os pokemons
    pokemonContainer.innerHTML = "";

    for (let pokemon of data.results) {
      const details = await fetch(pokemon.url).then((r) => r.json());
      // esse if serve para verificar se o pokemon ja esta nos favoritos se estiver ele nao mostra na lista principal
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
// essa função serve para buscar os pokemons por tipo
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
    // essa parte serve para mostrar o spinner enquanto os pokemons estao sendo carregados e ele some quando os pokemons ja estao na tela e se os pokemon nao forem encontrados ele mostra uma mensagem de erro
    showSpinner(false);
  } catch (error) {
    console.error("Erro ao buscar por tipo:", error);
    showSpinner(false);
  }
}

// essa função serve para mostrar o card do pokemon na tela
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

// essa função serve para mostrar o spinner enquanto os pokemons estao sendo carregados
function showSpinner(show) {
  loadingSpinner.style.display = show ? "block" : "none";
}
//essa função serve para salvar os pokemons favoritos no localstorage
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

//essa função serve para atualizar a seção de favoritos e a lista principal de pokemons
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
//essa função serve para buscar a lista de pokemons filtrados por nome e tipo
async function fetchPokemonListFiltered(limit = 1025, offset = 0) {
  
  try {
    showSpinner(true);
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const searchValue = searchInput.value.trim().toLowerCase();
// esse fetch serve para puxar a lista de pokemons da api e pega o limite e o offset 
    const response = await fetch(
      `${POKEAPI_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();

    pokemonContainer.innerHTML = "";
// esse for serve para percorrer a lista de pokemons e mostrar na tela os pokemons que correspondem ao filtro de nome e tipo
    for (let pokemon of data.results) {
      const details = await fetch(pokemon.url).then((r) => r.json());
// essas constantes servem para verificar se o nome do pokemon corresponde ao valor do input de busca e se o tipo do pokemon corresponde ao tipo selecionado no dropdown
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

//essa função serve para buscar um pokemon pelo nome e mostrar na tela em um container especifico
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
// esse innerHTML serve para mostrar o card do pokemon na tela
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


//esse serve para adicionar um evento para manter os pokemons favoritos mesmo depois de atualizar a pagina
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  fetchPokemonListFiltered();
});

//serve para adicionar um evento para filtrar os pokemons por tipo quando o usuario selecionar um tipo no dropdown
document.querySelectorAll("#typeDropdown .dropdown-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();

    const type = e.target.getAttribute("data-type");
    const dropdownButton = document.querySelector(".dropdown-toggle");
// essa parte serve para atualizar o texto do dropdown com o tipo selecionado ou mostrar "Todos os tipos" se nenhum tipo for selecionado
    if (!type) {
      
      selectedType = null;
      dropdownButton.textContent = "Todos os tipos";
    } else {
      selectedType = type;
      dropdownButton.textContent =
        type.charAt(0).toUpperCase() + type.slice(1);
    }

    fetchPokemonListFiltered();
  });
});
//essa parte serve para carregar os pokemons quando a pagina for carregada
window.addEventListener("load", () => {
  refreshSections(); 
});

