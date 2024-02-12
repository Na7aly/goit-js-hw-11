import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '42280985-7d985928ef43c44dee148ab18'; 

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let currentQuery = '';
let totalImagesFound = 0;

function displayImages(images) {
  images.forEach(image => {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const link = document.createElement('a');
    link.href = image.largeImageURL;
    link.setAttribute('data-lightbox', 'gallery'); 
    link.innerHTML = `
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
    `;

    const info = document.createElement('div');
    info.classList.add('info');
    info.innerHTML = `
      <p class="info-item"><b>Likes:</b> ${image.likes}</p>
      <p class="info-item"><b>Views:</b> ${image.views}</p>
      <p class="info-item"><b>Comments:</b> ${image.comments}</p>
      <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
    `;

    card.appendChild(link);
    card.appendChild(info);

    gallery.appendChild(card);
  });

  const lightbox = new SimpleLightbox('.gallery a', {
    captionPosition: 'outside', 
  });
  
  lightbox.refresh();
}

async function fetchImages(query, page = 1) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40 
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch images from Pixabay.');
  }
}

async function searchImages(query) {
  try {
    const searchData = await fetchImages(query);
    if (searchData.hits.length === 0) {
      Notiflix.Notify.failure('No images found. Please try another search query.');
    } else {
      totalImagesFound = searchData.totalHits;
      displayImages(searchData.hits);
      Notiflix.Notify.success(`Hooray! ${totalImagesFound} images found.`);
      loadMoreBtn.style.display = 'block';
      loadMoreBtn.dataset.page = 1;
    }
  } catch (error) {
    console.error('An error occurred:', error);
    Notiflix.Notify.failure('An error occurred while fetching images. Please try again later.');
  }
}

async function loadMoreImages(event) {
  event.preventDefault();
  const query = currentQuery;
  const currentPage = parseInt(event.target.dataset.page);
  const nextPage = currentPage + 1;

  try {
    const searchData = await fetchImages(query, nextPage);
    if (searchData.hits.length === 0) {
      Notiflix.Notify.info('No more images found.');
    } else {
      displayImages(searchData.hits);
      event.target.dataset.page = nextPage;
    }
  } catch (error) {
    console.error('An error occurred:', error);
    Notiflix.Notify.failure('An error occurred while loading more images. Please try again later.');
  }
}

function initApp() {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    gallery.innerHTML = '';
    page = 1;
    const formData = new FormData(event.target);
    currentQuery = formData.get('searchQuery');
    searchImages(currentQuery);
  });

  loadMoreBtn.addEventListener('click', loadMoreImages);
  loadMoreBtn.style.display = 'none';
}

initApp();
