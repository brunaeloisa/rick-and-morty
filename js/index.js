document.addEventListener('DOMContentLoaded', main);

async function main() {
  loadMainContent(1);
  renderFooterData();
}

async function loadMainContent(page) {
  const result = await listCharactersByPage(page);
  const characters = [...result.charactersList];

  for (const character of characters) {
    const episodeURL = character.episode[character.episode.length - 1];
    const episodeName = await getEpisodeDataFromURL(episodeURL);

    character.episode = {
      url: episodeURL,
      name: episodeName
    };
  }

  renderCharactersList(characters);
}

async function renderFooterData() {
  const totalCharacters = await getTotalByFeature('character');
  const totalLocations = await getTotalByFeature('location');
  const totalEpisodes = await getTotalByFeature('episode');
  const currentYear = new Date().getFullYear();

  document.getElementById('total-characters').innerText = totalCharacters;
  document.getElementById('total-locations').innerText = totalLocations;
  document.getElementById('total-episodes').innerText = totalEpisodes;
  document.getElementById('current-year').innerText = currentYear;
}

function renderCharactersList(characters) {
  const row = document.getElementById('characters-list');
  row.innerHTML = '';

  for (const character of characters) {
    const cardHTML = `
      <div class="card overflow-hidden h-100">
        <div class="row g-0 h-100">
          <div class="mobile-w col-5 col-xl-4">
            <img src="${character.image}" class="img-fluid object-fit-cover h-100 w-100" alt="Foto do personagem ${character.name}">
          </div>

          <div class="mobile-w col-7 col-xl-8">
            <div class="card-body fw-bold text-white">
              <h5 class="card-title fw-bold mb-1">${character.name}</h5>

              <p class="card-text status">
                <i id="circle-status" class="bi bi-circle-fill text-${mapStatus(character.status).color}"></i>
                <span>${mapStatus(character.status).text} - ${mapSpecies(character.species)}</span>
              </p>

              <p class="card-text">
                <small class="text-white-50">Última localização conhecida: </small><br>
                <small>${character.location.name === 'unknown' ? 'Indeterminada' : character.location.name}</small>
              </p>

              <p class="card-text">
                <small class="text-white-50">Visto a última vez em: </small><br>
                <small>${character.episode.name}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    const col = document.createElement('div');
    col.classList.add('col-12', 'col-lg-6');
    col.innerHTML = cardHTML;
    row.appendChild(col);
  }
}

function mapStatus(status) {
  switch(status) {
    case 'Alive':
      return {
        color: 'success',
        text: 'Vivo'
      };
    case 'Dead': 
      return {
        color: 'danger',
        text: 'Morto'
      };
    default: 
      return {
        color: 'white-50',
        text: 'Desconhecido'
      };
  }
}

function mapSpecies(species) {
  switch(species) {
    case 'Human':
      return 'Humano';
    case 'Alien': 
      return 'Alienígena';
    case 'Robot': 
      return 'Robô';
    case 'unknown': 
      return 'Espécie desconhecida';
    default: 
      return `Outro (${species})`;
  }
}