import axios from "axios";
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery-item', {
  captionsData: 'alt',
  captionDelay: 250,
});

const form = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const spinner = document.getElementById('loading-spinner');
const loadMoreBtn = document.getElementById('load-more');

let page = 1; // Sayfa numarası
const perPage = 40; // Sayfa başına görüntü sayısı
let totalHits = 0; // Toplam görüntü sayısı
let query = ''; // Arama terimi

document.addEventListener("DOMContentLoaded", () => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        query = document.getElementById('search-input').value.trim();
        
        if (!query) {
            iziToast.warning({
                title: 'Uyarı',
                message: 'Lütfen bir arama terimi girin!',
            });
            return;
        }
        
        page = 1; // Yeni arama için sayfayı sıfırla
        loadMoreBtn.style.display = 'none'; // "Load more" butonunu gizle
        
        try {
            // Spinner'ı göster
            spinner.style.display = 'block';

            const response = await axios.get(`https://pixabay.com/api/?key=46164011-db8308970fd829f53e85acb75&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`);
            const data = response.data;
              
            totalHits = data.totalHits; // Toplam görüntü sayısını ayarla

            if (data.hits.length === 0) {
                iziToast.error({
                    title: 'Hata',
                    message: 'Görsel bulunamadı. Lütfen tekrar deneyin!',
                });
                return;
            }

            // Eski sonuçları temizle
            gallery.innerHTML = '';
              
            // Yeni görselleri ekle ve her görsel için bilgileri göster
            appendImages(data.hits);

            if (data.hits.length >= perPage && gallery.children.length < totalHits) {
                loadMoreBtn.style.display = 'block';
            }
            // SimpleLightbox'u güncelle
            lightbox.refresh();

        } catch (error) {
            // Hata durumunda spinner'ı kapat
            spinner.style.display = 'none';

            iziToast.error({
                title: 'Hata',
                message: 'Bir sorun oluştu. Lütfen tekrar deneyin!',
            });
            console.error('Bir hata oluştu:', error);
        } finally {
            // Spinner'ı kapat
            spinner.style.display = 'none';
        }
    });

    loadMoreBtn.addEventListener('click', async () => {
        page += 1; // Sayfayı bir artır
        try {
            const response = await axios.get(`https://pixabay.com/api/?key=46164011-db8308970fd829f53e85acb75&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`);
            const data = response.data;

            appendImages(data.hits);

            // Eğer toplam görüntü sayısı aşılmışsa "Load more" butonunu gizle
            if (gallery.children.length >= totalHits) {
                loadMoreBtn.style.display = 'none';
                iziToast.info({
                    message: "We're sorry, but you've reached the end of search results.",
                });
            }

            // SimpleLightbox'u güncelle
            lightbox.refresh();
            
        } catch (error) {
            iziToast.error({
                title: 'Hata',
                message: 'Bir sorun oluştu. Lütfen tekrar deneyin!',
            });
            console.error('Bir hata oluştu:', error);
        }
    });
});

// Yeni görselleri ekle ve her görsel için bilgileri göster
function appendImages(images) {
    images.forEach(image => {
        const imgElement = document.createElement('a');
        imgElement.href = image.largeImageURL;
        imgElement.classList.add('gallery-item');
        imgElement.innerHTML = `
          <li id="gallery-items">
            <img src="${image.webformatURL}" alt="${image.tags}" />
          </li>
          <div class="gallery-items-info">
            <p class="gallery-items-info-alt"><strong>Likes:</strong> ${image.likes}</p>
            <p class="gallery-items-info-alt"><strong>Comments:</strong> ${image.comments}</p>
            <p class="gallery-items-info-alt"><strong>Views:</strong> ${image.views}</p>
            <p class="gallery-items-info-alt"><strong>Downloads:</strong> ${image.downloads}</p>
          </div>
        `;
        gallery.appendChild(imgElement);
    });
}
