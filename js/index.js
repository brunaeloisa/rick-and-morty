document.addEventListener('DOMContentLoaded', main);

async function main() {
  const params = new URLSearchParams(window.location.search);
  const searchTerm = params.get('name');

  if (searchTerm) {
    loadSearchResults(`?name=${searchTerm}`);
  } else {
    loadMainContent(1);
  }

  renderFooterData();
  searchSetUp();
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
  renderMainPagination(page, result.prevPage, result.nextPage, result.totalPages);
}

function renderMainPagination(currentPage, prevPage, nextPage, totalPages) {
  const prevPageNumber = prevPage ? prevPage.split('?page=')[1] : 0;
  const nextPageNumber = nextPage ? nextPage.split('?page=')[1] : 0;
  renderPaginationBase(currentPage, prevPageNumber, nextPageNumber, totalPages, loadMainContent);
}

function renderPaginationBase(currentPage, prevPage, nextPage, totalPages, loadFunction) {
  const nav = document.getElementById('pagination');
  nav.innerHTML = '';

  const ul = document.createElement('ul');
  ul.classList.add('pagination', 'justify-content-center', 'm-0');

  const liPrevPage = document.createElement('li');
  liPrevPage.classList.add('page-item');

  if (!prevPage) liPrevPage.classList.add('disabled');

  const buttonPrev = document.createElement('button');
  buttonPrev.setAttribute('type', 'button');
  buttonPrev.classList.add('page-link', 'btn-page', 'h-100');
  buttonPrev.addEventListener('click', () => {
    location.href='#characters-list';
    loadFunction(prevPage);
  });

  const iconPrev = document.createElement('i');
  iconPrev.classList.add('bi', 'bi-caret-left-fill');
  buttonPrev.appendChild(iconPrev);
  liPrevPage.appendChild(buttonPrev);

  const liPageNumber = document.createElement('li');
  liPageNumber.classList.add('page-item', 'text-center', 'page-info');
  liPageNumber.innerText = `${currentPage} de ${totalPages}`;

  const liNextPage = document.createElement('li');
  liNextPage.classList.add('page-item');

  if (!nextPage) liNextPage.classList.add('disabled');

  const buttonNext = document.createElement('button');
  buttonNext.setAttribute('type', 'button');
  buttonNext.classList.add('page-link', 'btn-page', 'h-100');
  buttonNext.addEventListener('click', () => {
    location.href='#characters-list';
    loadFunction(nextPage);
  });

  const iconNext = document.createElement('i');
  iconNext.classList.add('bi', 'bi-caret-right-fill');
  buttonNext.appendChild(iconNext);
  liNextPage.appendChild(buttonNext);

  ul.appendChild(liPrevPage);
  ul.appendChild(liPageNumber);
  ul.appendChild(liNextPage);

  nav.appendChild(ul);
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

async function renderCharacterDetail(characterId) {
  const modal = document.getElementById('character-detail');
  modal.innerHTML = '';

  const character = await getCharacterById(characterId);
  const episodeURL = character.episode[character.episode.length - 1];
  const episodeName = await getEpisodeDataFromURL(episodeURL);

  character.episode = {
    url: episodeURL,
    name: episodeName
  };
  
  const cardHTML = `
    <div class="card container overflow-hidden px-0">
      <div class="row card-body g-0">
        <button type="button" class="btn-close" data-bs-dismiss="modal" data-bs-theme="dark" aria-label="Close"></button>

        <div class="col-12 text-center">
          <h5 class="card-name text-center fw-bold text-white py-2">${character.name}</h5>
        </div>

        <div class="col-12 text-center">
          <img src="${character.image}" class="img-fluid object-fit-cover w-75 rounded-circle pt-2" alt="Foto do personagem ${character.name}">
        </div>
        
        <div class="col-12">
          <div class="fw-bold text-white py-2 px-content">
            <p class="card-text">
              <small class="text-green">Status: </small>
              <span class="status">
                <i id="circle-status" class="bi bi-circle-fill text-${mapStatus(character.status).color}"></i>
                ${mapStatus(character.status).text}
              </span>
            </p>

            <p class="card-text">
              <small class="text-green">Espécie: </small><br>
              <small>${mapSpecies(character.species)}</small>
            </p>

            <p class="card-text">
              <small class="text-green">Última localização conhecida: </small><br>
              <small>${character.location.name === 'unknown' ? 'Indeterminada' : character.location.name}</small>
            </p>

            <p class="card-text">
              <small class="text-green">Visto a última vez em: </small><br>
              <small>${character.episode.name}</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  const modalBody = document.createElement('div');
  modalBody.classList.add('modal-body');
  modalBody.innerHTML = cardHTML;
  modal.appendChild(modalBody);
}

function renderCharactersList(characters) {
  const row = document.getElementById('characters-list');
  row.innerHTML = '';

  for (const character of characters) {
    const cardHTML = `
      <div class="card overflow-hidden h-100" data-bs-toggle="modal" data-bs-target="#detailModal" onclick="renderCharacterDetail(${character.id})">
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