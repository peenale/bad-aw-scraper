const ANIMEWORLD_BASE = 'https://www.animeworld.ac';
const ANIMEWORLD_API = '/api/episode/serverPlayerAnimeWorld?id=';
const PROXY = 'https://api.allorigins.win/raw?url=';
const POSTER_BASE = 'https://img.animeworld.ac/locandine/';

async function getAnimes(title) {
    const searchLink = '/search?keyword=';
    const queryTitle = encodeURIComponent(title);

    try {
        const response = await fetch(`${PROXY}${encodeURIComponent(ANIMEWORLD_BASE + searchLink + queryTitle)}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const mainDiv = doc.getElementById('main');
        const links = mainDiv.querySelectorAll('a.name');
        const posters = mainDiv.querySelectorAll('a.poster img');

        let found = [];
        for(let i = 0; i < links.length && i < posters.length; i++) {
            found.push({
                id: links[i].getAttribute('href').split('.')[1],
                link: `${ANIMEWORLD_BASE}${links[i].getAttribute('href')}`,
                title: links[i].textContent.trim(),
                poster_link: posters[i].getAttribute('src')
            })
        }

        let listHtml = generateAnimeList(found)

        document.getElementById('result').innerHTML = listHtml;
        
    } catch (error) {
        console.error("Fetch failed:", error);
        document.getElementById('result').innerHTML = "Error loading episodes.";
    }
}

function generateAnimeList(titles) {
    let POSTER_ID;
    let listHtml = "";
    titles.forEach((item) => {
        POSTER_ID = item.link.split('.')[1];
        console.log(POSTER_ID);

        // <a href='./title.html?id=${item.id}' onclick='selectAnime(event, this, ${JSON.stringify(item)})'>
        listHtml += `
<a href='./title.html?title=${btoa(JSON.stringify(item))}'>
    <div class='row title'>
        <div class='col-2 poster'>
            <img src='${item.poster_link}'>
        </div>
        <div class='col desc align-self-center'>
            <h4>${item.title}</4>
        </div>
    </div>
</a>
        `;
    });

    return listHtml;
}

async function generatePage(anime) {
    const IDs = await getEpisodes(anime);
    /*
    getEpisodes(anime).then((IDsRet) => {
        IDs = IDsRet;
    });
    */

    document.getElementById('poster-div').innerHTML = `<img src="${anime.poster_link}">`
    document.getElementById('anime-title').innerText = anime.title;
    document.getElementById('anime-episodes').innerText = `${IDs.length} episodi.`

    let options = '';
    for (let i = 0; i < IDs.length; i++) {
        options += `<option value=${IDs[i]}> Episodio ${i+1} </option>`
    }
    document.getElementById('selector').innerHTML = options;
}

async function getEpisodes(anime) {
    try {
        const response = await fetch(`${PROXY}${anime.link}`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        const episodesTab = doc.getElementById('animeId');
        const anchors = episodesTab.querySelectorAll('li.episode a');

        let episodeIDs = [];
        anchors.forEach((a) => {
            episodeIDs.push(a.getAttribute('data-id'))
        })

        console.log(episodeIDs);
        return episodeIDs;
    } catch (error) {
        console.error("Fetch failed:", error);
        document.getElementById('result').innerHTML = "Error loading episodes.";
    }
}


async function selectEpisode(event, ID) {
    event.preventDefault();
    console.log(ID);

    const response = await fetch(`${PROXY}${ANIMEWORLD_BASE}${ANIMEWORLD_API}${ID}`);
    const text = await response.text();
    const parser = new DOMParser();

    const doc = parser.parseFromString(text, 'text/html');
    const videoTag = doc.getElementById('video-player');
    const videoLink = videoTag.children[0].getAttribute('src');

    document.getElementById('video').innerHTML = `<source src="${videoLink}">`;
    document.getElementById('video').load();
}
/*
function selectAnime(event, element, selected) {
    event.preventDefault();

    localStorage.setItem(selected.id, JSON.stringify(selected));

    window.location.href = element.href;
}
    */