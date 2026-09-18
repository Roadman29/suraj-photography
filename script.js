const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  });
}

document.addEventListener('contextmenu', (e) => {
  if (e.target && e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

document.addEventListener('dragstart', (e) => {
  if (e.target && e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;

if (!lightbox || !lightboxImg || !closeBtn) {
  console.warn('No portfolio lightbox found on this page; gallery interactions were skipped.');
} else {
  function bindGalleryImages() {
    document.querySelectorAll('.gallery-card img, .product-card img').forEach((img) => {
      img.onclick = () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
      };
    });
  }

  bindGalleryImages();

  function buildGallery(gallerySelector, folder, label, count = 5) {
    const gallery = document.querySelector(gallerySelector);
    if (!gallery) return;

    const captions = (gallery.getAttribute('data-captions') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const customImages = (gallery.getAttribute('data-images') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const imageFiles = customImages.length
      ? customImages
      : Array.from({ length: count }, (_, index) => `${folder}/photo-${String(index + 1).padStart(2, '0')}.jpg`);

    gallery.innerHTML = '';

    imageFiles.forEach((src, index) => {
      const article = document.createElement('article');
      article.className = 'gallery-card';

      if (gallery.classList.contains('gallery-editorial')) {
        if (index === 0) article.classList.add('hero');
        else if (index === 1) article.classList.add('tall');
        else if (index === 2) article.classList.add('feature');
        else if (index === 5) article.classList.add('tall');
        else if (index === 7) article.classList.add('feature');
      } else {
        if (index === 0) article.classList.add('large');
        if (index === 4) article.classList.add('wide');
      }

      const img = document.createElement('img');
      img.src = src;
      img.alt = `${label} image ${index + 1}`;
      img.loading = 'lazy';

      const labelEl = document.createElement('div');
      labelEl.className = 'card-label';
      const caption = captions[index] || label;
      labelEl.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><strong>${caption}</strong>`;

      article.appendChild(img);
      article.appendChild(labelEl);
      gallery.appendChild(article);
    });

    bindGalleryImages();
  }

  if (document.querySelector('#f1-gallery')) {
    buildGallery('#f1-gallery', 'images/f1', 'F1', 5);
  }

  if (document.querySelector('#other-motorsport-gallery')) {
    buildGallery('#other-motorsport-gallery', 'images/other-motorsport', 'OTHER', 8);
  }

  if (document.querySelector('#motogp-gallery')) {
    buildGallery('#motogp-gallery', 'images/motogp', 'MotoGP', 5);
  }

  function buildProductGallery(gallerySelector) {
    const gallery = document.querySelector(gallerySelector);
    if (!gallery) return;

    const captions = (gallery.getAttribute('data-captions') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const imageSources = (gallery.getAttribute('data-images') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const prices = (gallery.getAttribute('data-prices') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    gallery.innerHTML = '';

    imageSources.forEach((src, index) => {
      const card = document.createElement('article');
      card.className = 'product-card';

      const img = document.createElement('img');
      img.src = src;
      img.alt = (captions[index] || 'F1 card') + ' image';
      img.loading = 'lazy';

      const info = document.createElement('div');
      info.className = 'product-info';
      const price = prices[index] || '$0.00';
      info.innerHTML = `<h3>${captions[index] || 'F1 Card'}</h3><p>${price}</p>`;

      card.appendChild(img);
      card.appendChild(info);
      gallery.appendChild(card);
    });

    bindGalleryImages();
  }

  if (document.querySelector('#f1-cards-gallery')) {
    buildProductGallery('#f1-cards-gallery');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}


