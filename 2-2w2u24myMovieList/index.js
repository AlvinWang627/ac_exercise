const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
let filteredMovies = []
const changeMode = document.querySelector('#btn-change-mode')
// 用currentPage去抓每頁現在頁數
let currentPage = 1
// 用currentMode去抓現在是圖片還是列表模式
let currentMode = 'pictureMode'
function renderMovieListToCardMode(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}


//做渲染成列表的function
function renderMoviesListToListMode(data) {
  let rawHTML = []
  data.forEach((item) => {
    rawHTML += 
      `<li class="list-group-item d-flex justify-content-between">
          <h5>${item.title}</h5>
            <div>
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
              data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
        </li> `
  })
  dataPanel.innerHTML = `
    <ul class="list-group flex-grow-1 " id='list-mode'>
    ${rawHTML}
    </ul >
    `
}

function showMovieModal (id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="image-fluid"></img>`
  })
}

function addToFavorite (id) {
 const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
 const movie = movies.find((movie) => movie.id === id)
 list.push(movie)
 localStorage.setItem('favoriteMovies', JSON.stringify(list))
 console.log(movie)
 console.log(list)
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 2; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item">
      <a class="page-link" href="#" data-page="${page}">${page}</a>
    </li>`
  }
  paginator.innerHTML = `
    <li class="page-item active">
      <a class="page-link" href="#" data-page="1">1</a>
    </li>
    ${rawHTML}
  `


}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  // 監聽paginator，按下去就更新currentPage
  currentPage = Number(event.target.dataset.page)
  //更新畫面
  //用currentMode內容去建立判斷式，判斷要用哪個渲染function
  if (currentMode === 'pictureMode') {
    renderMovieListToCardMode(getMoviesByPage(page))
  } else if (currentMode === 'listMode')  {
    renderMoviesListToListMode(getMoviesByPage(page))
  }

  // 視覺上凸顯目前顯示頁面
  const active = document.querySelector('#paginator .active')
  if (active) {   
    active.classList.remove('active')
  }
  event.target.parentElement.classList.add('active')
})

dataPanel.addEventListener('click', function onPanelClicked (event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    // renderMovieListToCardMode(getMoviesByPage(1))
    renderMovieListToCardMode(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  
  if(!keyword.length) {
    return alert('請輸入有效字串')
  }
  filteredMovies = movies.filter((movie) => 
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  if (currentMode === 'pictureMode') {
    renderMovieListToCardMode(getMoviesByPage(1))
  } else if (currentMode === 'listMode') {
    renderMoviesListToListMode(getMoviesByPage(1))
  }
})

//綁定圖片mode功能 及list function
//綁定圖片監聽器
changeMode.addEventListener(('click'), function clickChangeMode(event) {
  if (event.target.matches('.btn-pic-mode')) {
    //按下圖片模式圖片就更新currentMode為圖片模式，並且渲染頁面成圖片版
    currentMode = 'pictureMode'
    renderMovieListToCardMode(getMoviesByPage(currentPage))
  } else if (event.target.matches('.btn-list-mode')) {
    //按下列表模式圖片就更新currentMode為列表模式，並且渲染頁面成列表版
    currentMode = 'listMode'
    renderMoviesListToListMode(getMoviesByPage(currentPage))
  }
})
