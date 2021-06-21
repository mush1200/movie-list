// 宣告變數
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const movie_per_page = 12
let filteredMovies = []
const data_panel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const search_form = document.querySelector('#search-form')
const search_input = document.querySelector('#search-input')
// 把電影清單渲染至畫面中，card mode
function renderMovieCardMode(data) {
  // let rawHTML = ''
  // data.forEach(movie => rawHTML += `<div class="card col-sm-3" style="width: 18rem;">
  //   <img src="${POSTER_URL + movie.image}" class="movie-photo" alt="movie-photo">
  //     <div class="movie-body">
  //       <h5 class="movie-name">${movie.title}</h5>
  //       <a id="more-button" href="#" class="btn btn-primary">MORE</a>
  //       <a id="add-button" href="#" class="btn btn-danger">ADD</a>
  //     </div>
  //     </div>`)
  //  data_panel.innerHTML = rawHTML

  data_panel.innerHTML = data.map(movie => `<div class="card col-sm-3 mb-3" style="width: 18rem;">
  <img src="${POSTER_URL + movie.image}" class="movie-photo" alt="movie-photo">
   <div class="movie-body">
         <h5 class="movie-name">${movie.title}</h5>
        <button class="btn btn-primary" id="more-button" data-toggle="modal" data-target="#movie-modal" data-id="${movie.id}">More</button>

        <button data-id="${movie.id}" id="add-button" class="btn btn-danger">ADD</button>
      </div>
       </div>`).join('')
}

//API
axios.get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    // renderMovieCardMode(movies)//顯示全部電影清單 
    renderMovieCardMode(getMovieByPage(1))//用頁碼顯示電影清單
    renderPaginator(movies.length)//顯示正確分頁數量
  })
  .catch((err) => console.log(err))


//顯示正確分頁數量
function renderPaginator(amount) {
  let numberOfpages = Math.ceil(amount / movie_per_page)
  let rawHTML = ''
  for (let page = 1; page <= numberOfpages; page++) {
    rawHTML += `<li class="page-item"><a data-page="${page}" class="page-link" href="#">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//用頁碼顯示電影清單
function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  let startIndex = (page - 1) * movie_per_page
  return data.slice(startIndex, startIndex + movie_per_page)
}


//Modal電影詳細內容
function renderModalMovie(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Realese date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}


//ADD加入favorite頁面
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('FavoriteMovies'))|| []
  const addmovie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('這部電影已經收藏了')
  }
  list.push(addmovie)
  localStorage.setItem('FavoriteMovies', JSON.stringify(list))
}


// 事件委託
//點該頁碼會渲染該頁碼的電影清單
paginator.addEventListener('click', function onPaginatorClicked (event) {
  if (event.target.tagName = 'A') {
    let onPage = Number(event.target.dataset.page)
    renderMovieCardMode(getMovieByPage(onPage))
  }
})

// 點MORE，會modal出該電影詳細介紹
data_panel.addEventListener('click', function onPanelClick (event) {
  if (event.target.matches('#more-button')) {
    let dataID = Number(event.target.dataset.id)
    renderModalMovie(dataID)
  } else if (event.target.matches('#add-button')) {
    let dataID = Number(event.target.dataset.id)
    addToFavorite(dataID)
  }
})

//點search，可以用關鍵字搜尋電影
search_form.addEventListener('submit', function onSearchSubmitted(event) {
  event.preventDefault()
  const keyword = search_input.value.trim().toLowerCase()
  
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  if (!filteredMovies) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }
  renderPaginator(filteredMovies.length)
  renderMovieCardMode(getMovieByPage(1))
})