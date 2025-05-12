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
  renderPagination(result.prevPage, result.nextPage);
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

function renderPagination(prevPage, nextPage) {
  const prevPageNumber = prevPage ? prevPage.split('?page=')[1] : 0;
  const nextPageNumber = nextPage ? nextPage.split('?page=')[1] : 0;

  const nav = document.getElementById('pagination');
  nav.innerHTML = '';

  const ul = document.createElement('ul');
  ul.classList.add('pagination', 'justify-content-center', 'm-0');

  const liPrevPage = document.createElement('li');
  liPrevPage.classList.add('page-item');

  if (!prevPage) liPrevPage.classList.add('disabled');

  const buttonPrev = document.createElement('button');
  buttonPrev.setAttribute('type', 'button');
  buttonPrev.classList.add('page-link', 'btn-page');
  buttonPrev.innerText = 'Anterior';
  buttonPrev.addEventListener('click', () => loadMainContent(prevPageNumber));

  liPrevPage.appendChild(buttonPrev);

  const liNextPage = document.createElement('li');
  liNextPage.classList.add('page-item');

  if (!nextPage) liNextPage.classList.add('disabled');

  const buttonNext = document.createElement('button');
  buttonNext.setAttribute('type', 'button');
  buttonNext.classList.add('page-link', 'btn-page');
  buttonNext.innerText = 'Próxima';
  buttonNext.addEventListener('click', () => loadMainContent(nextPageNumber));

  liNextPage.appendChild(buttonNext);

  ul.appendChild(liPrevPage);
  ul.appendChild(liNextPage);

  nav.appendChild(ul);
}

function renderCharactersList(characters) {
  const row = document.getElementById('characters-list');
  row.innerHTML = '';

  for (const character of characters) {
    const cardHTML = `
      <div class="card overflow-hidden h-100">
        <div class="row g-0 h-100">
          <div class="mobile-w col-5 col-sm-4 col-lg-5 col-xl-4">
            <img src="${character.image}" class="img-fluid object-fit-cover h-100 w-100" alt="Foto do personagem ${character.name}">
          </div>

          <div class="mobile-w col-7 col-sm-8 col-lg-7 col-xl-8">
            <div class="card-body fw-bold text-white">
              <h5 class="card-title fw-bold mb-1">${character.name}</h5>

              <p class="card-text status">
                <i id="circle-status" class="bi bi-circle-fill text-${mapStatus(character.status).color}"></i>
                <span>${mapStatus(character.status).text} – ${mapSpecies(character.species)}</span>
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
    case 'Mythological Creature':
      return 'Criatura Mitológica';
    default: 
      return species;
  }
}