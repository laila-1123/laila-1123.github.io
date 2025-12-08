document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

//featuerd 
  const featureGallery = document.getElementById('featureGallery');
  const featureLightbox = document.getElementById('featureLightbox');
  const featureLightboxImg = document.getElementById('featureLightboxImg');
  const featureLightboxVideo = document.getElementById('featureLightboxVideo');
  const featureLightboxCaption = document.getElementById('featureLightboxCaption');
  const featureLightboxClose = document.getElementById('featureLightboxClose');

  if (featureGallery && featureLightbox && featureLightboxImg && featureLightboxVideo && featureLightboxCaption && featureLightboxClose) {
    featureGallery.querySelectorAll('.feature-shot').forEach(item => {
      item.addEventListener('click', () => {
        const { full = '', caption = '', video = '' } = item.dataset;
        const img = item.querySelector('img');
        const hasVideo = Boolean(video);

        if (hasVideo) {
          featureLightboxVideo.src = video;
          featureLightboxVideo.style.display = 'block';
          featureLightboxVideo.play().catch(()=>{});
          featureLightboxImg.src = '';
          featureLightboxImg.style.display = 'none';
        } else {
          featureLightboxImg.src = full || img?.src || '';
          featureLightboxImg.alt = caption || img?.alt || '';
          featureLightboxImg.style.display = 'block';
          featureLightboxVideo.pause();
          featureLightboxVideo.removeAttribute('src');
          featureLightboxVideo.style.display = 'none';
        }

        featureLightboxCaption.textContent = caption || img?.alt || '';
        featureLightbox.showModal();
      });
    });

    featureLightboxClose.addEventListener('click', () => featureLightbox.close());
    featureLightbox.addEventListener('click', (e) => {
      if (e.target === featureLightbox) {
        featureLightbox.close();
      }
    });
  }

//scroll to contact
  document.querySelectorAll('a[href="#contact"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

//mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }
});
