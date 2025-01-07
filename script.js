const API_KEY = '25327b8f4f65efc67cd8ca1513833612';
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ko&page=1`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const movieList = document.getElementById('movieList');
const searchInput = document.getElementById('searchInput');
const showBookmarksBtn = document.getElementById('showBookmarksBtn');
const movieModal = document.getElementById('movieModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalOverview = document.getElementById('modalOverview');
const modalReleaseDate = document.getElementById('modalReleaseDate');
const modalRating = document.getElementById('modalRating');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const removeBookmarkBtn = document.getElementById('removeBookmarkBtn');
const closeModal = document.querySelector('.close');

let currentMovieId = null;

// Fetch popular movies from TMDB
async function fetchMovies(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("영화 데이터를 불러오는 중 오류가 발생했습니다:", error);
    }
}

// Display movies on the page
function displayMovies(movies) {
    movieList.innerHTML = ''; // 이전 영화 목록 삭제
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        movieCard.innerHTML = `
            <img src="${IMAGE_URL + movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>평점: ${movie.vote_average}</p>
        `;
        
        movieCard.addEventListener('click', () => showMovieDetails(movie.id));
        movieList.appendChild(movieCard);
    });
}

// Show movie details in modal
async function showMovieDetails(movieId) {
    const movieDetailURL = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=ko`;
    const response = await fetch(movieDetailURL);
    const movie = await response.json();

    currentMovieId = movie.id; // 현재 영화 ID 저장

    modalImage.src = IMAGE_URL + movie.poster_path;
    modalTitle.textContent = movie.title;
    modalOverview.textContent = movie.overview;
    modalReleaseDate.textContent = movie.release_date;
    modalRating.textContent = movie.vote_average;

    movieModal.style.display = 'block';

    // 북마크 상태에 따라 버튼 상태 업데이트
    updateBookmarkButtons();
}

// Close the modal
closeModal.addEventListener('click', () => {
    movieModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target == movieModal) {
        movieModal.style.display = 'none';
    }
});

// Bookmark the movie using localStorage
bookmarkBtn.addEventListener('click', () => {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    
    if (!bookmarks.includes(currentMovieId)) {
        bookmarks.push(currentMovieId);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        alert('영화가 북마크에 추가되었습니다!');
        updateBookmarkButtons(); // 버튼 상태 업데이트
    } else {
        alert('이미 북마크에 추가된 영화입니다.');
    }
});

// Remove bookmark from localStorage
removeBookmarkBtn.addEventListener('click', () => {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    
    if (bookmarks.includes(currentMovieId)) {
        bookmarks = bookmarks.filter(id => id !== currentMovieId);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        alert('영화가 북마크에서 제거되었습니다.');
        updateBookmarkButtons(); // 버튼 상태 업데이트
    } else {
        alert('이 영화는 북마크에 없습니다.');
    }
});

// Update bookmark button states
function updateBookmarkButtons() {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    
    if (bookmarks.includes(currentMovieId)) {
        bookmarkBtn.style.display = 'none';
        removeBookmarkBtn.style.display = 'block';
    } else {
        bookmarkBtn.style.display = 'block';
        removeBookmarkBtn.style.display = 'none';
    }
}

// Show bookmarked movies
showBookmarksBtn.addEventListener('click', () => {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    
    if (bookmarks.length === 0) {
        alert('북마크된 영화가 없습니다.');
        return;
    }

    // 북마크된 영화 목록 가져오기
    const promises = bookmarks.map(id => {
        const movieDetailURL = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=ko`;
        return fetch(movieDetailURL).then(response => response.json());
    });

    Promise.all(promises)
        .then(movies => {
            displayMovies(movies); // 북마크된 영화들만 표시
        })
        .catch(error => {
            console.error('북마크된 영화를 불러오는 중 오류가 발생했습니다:', error);
        });
});

// Search for movies by title
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const searchURL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}&language=ko`;
    
    if (searchTerm) {
        fetchMovies(searchURL);
    } else {
        fetchMovies(API_URL); // 검색어가 없으면 인기 영화 표시
    }
});

// Initial fetch of popular movies
fetchMovies(API_URL);
