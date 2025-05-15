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
  buttonPrev.addEventListener('click', () => {
    location.href='#characters-list';
    loadSearchResults(prevPageQuery);
  });

  liPrevPage.appendChild(buttonPrev);

  const liPageNumber = document.createElement('li');
  liPageNumber.classList.add('page-item', 'page-info');
  liPageNumber.innerText = `${currentPage} de ${totalPages}`;

  const liNextPage = document.createElement('li');
  liNextPage.classList.add('page-item');

  if (!nextPage) liNextPage.classList.add('disabled');

  const buttonNext = document.createElement('button');
  buttonNext.setAttribute('type', 'button');
  buttonNext.classList.add('page-link', 'btn-page');
  buttonNext.innerText = 'Próxima';
  buttonNext.addEventListener('click', () => {
    location.href='#characters-list';
    loadSearchResults(nextPageQuery);
  });

  liNextPage.appendChild(buttonNext);

  ul.appendChild(liPrevPage);
  ul.appendChild(liPageNumber);
  ul.appendChild(liNextPage);

  nav.appendChild(ul);
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