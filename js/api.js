const api = axios.create({
  baseURL: 'https://rickandmortyapi.com/api'
});

async function getTotalByFeature(feature) {
  try {
    const result = await api.get(`/${feature}`);
    return result.data.info.count;
  } catch (error) {
    console.log(error);
  }
}

async function listCharactersByPage(page=1) {
  try {
    const result = await api.get('/character', {
      params: { page }
    });

    return {
      prevPage: result.data.info.prev,
      nextPage: result.data.info.next,
      charactersList: result.data.results
    };
  } catch (error) {
    console.log(error);
  }
}

async function getEpisodeDataFromURL(url) {
  try {
    const result = await api.get(url);
    return result.data.name;
  } catch (error) {
    console.log(error);
  }
}