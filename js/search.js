function searchSetUp() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  searchForm.addEventListener('submit', handleSearch);
  searchInput.addEventListener('input', handleSearch);
}

function handleSearch(event) {
  event.preventDefault();
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    const novaUrl = `${window.location.pathname}?name=${searchTerm}`;
    window.history.pushState({ path: novaUrl }, '', novaUrl);
    loadSearchResults(`?name=${searchTerm}`);
  } else {
    const novaUrl = `${window.location.pathname}`;
    window.history.pushState({ path: novaUrl }, '', novaUrl);
    loadMainContent(1);
  }
}

async function loadSearchResults(query) {
  const result = await getSearchResults(query);

  if (!result) {
    displayNotFoundMessage();
    return;
  }

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
  renderPaginationResults(result.prevPage, result.nextPage, result.totalPages);
}

function renderPaginationResults(prevPage, nextPage, totalPages) {
  const prevPageQuery = prevPage ? prevPage.split('/character/')[1] : '';
  const nextPageQuery = nextPage ? nextPage.split('/character/')[1] : '';
  const currentPage = prevPageQuery ? (parseInt(prevPageQuery.match(/page=(\d+)/)[1]) + 1) : 1;
  renderPaginationBase(currentPage, prevPageQuery, nextPageQuery, totalPages, loadSearchResults);
}

function displayNotFoundMessage() {
  const row = document.getElementById('characters-list');
  row.innerHTML = '';

  const col = document.createElement('div');
  col.classList.add('col-12');
  
  const h3 = document.createElement('h3');
  h3.classList.add('text-center', 'text-white-50', 'mb-2');
  h3.innerText = 'Nenhum resultado foi encontrado.';

  const div = document.createElement('div');
  div.classList.add('d-flex', 'justify-content-center');

  const backButton = document.createElement('a');
  backButton.classList.add('btn', 'btn-page');
  backButton.setAttribute('href', '/');
  backButton.innerText = 'Voltar';
  div.appendChild(backButton);

  const nav = document.getElementById('pagination');
  nav.innerHTML = '';
  nav.appendChild(div);

  col.appendChild(h3);
  row.appendChild(col);
}