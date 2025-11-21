document.addEventListener('DOMContentLoaded', () => {
  /* =============================
   *   FOOTER YEAR
   * ============================= */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* =============================
   *   WORK PAGE: GRID + MODAL
   *   (runs only if #projectGrid exists)
   * ============================= */
  const grid = document.getElementById('projectGrid');
  if (grid) {
    const projects = [
      {
        id: 'web-01',
        title: 'E-commerce Redesign',
        type: ['web','ux'],
        summary: 'Increased checkout conversion by 18% via streamlined IA and clearer CTAs.',
        cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
        role: 'UX/UI Designer',
        tools: 'Figma, Framer, GA4',
        timeline: '8 weeks',
        problem: 'High cart abandonment and confusing nav.',
        process: ['Heuristic eval + analytics','Card sort + tree test','Wireframes → hi-fi prototypes','Usability tests (n=8)'],
        outcome: ['+18% checkout conversion','-21% time to find products','Design system created']
      },
      {
        id: 'app-01',
        title: 'Wellness App Onboarding',
        type: ['app','ux'],
        summary: 'Reduced drop-off by 32% with progressive disclosure and social proof.',
        cover: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
        role: 'Product Designer',
        tools: 'Figma, After Effects',
        timeline: '4 weeks',
        problem: 'Complex sign-up causing friction.',
        process: ['Benchmarking','Flow redesign','Micro-interactions','A/B test'],
        outcome: ['+32% complete sign-ups','CSAT +0.6','NPS +8']
      },
      {
        id: 'anim-01',
        title: 'Micro-interaction Reel',
        type: ['animation'],
        summary: 'UI motion studies to convey affordances and states.',
        cover: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop',
        role: 'Motion Designer',
        tools: 'After Effects, Lottie',
        timeline: 'Ongoing',
        problem: 'Static mocks failed to communicate feedback.',
        process: ['Motion principles','Timing curves','Lottie export'],
        outcome: ['Improved dev handoff','Clearer state changes']
      },
      {
        id: 'photo-01',
        title: 'Brand Photography Set',
        type: ['photo'],
        summary: 'Natural-light set for a lifestyle brand; used across web and socials.',
        cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
        role: 'Photographer',
        tools: 'Lightroom, Sony A7C',
        timeline: '1 week',
        problem: 'Need cohesive visual tone.',
        process: ['Moodboard','Location scouting','Color grading'],
        outcome: ['Cohesive asset library','Engagement +24%']
      }
    ];

    const chips = document.querySelectorAll('.chip');
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    function card(p){
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <img class="thumb" src="${p.cover}" alt="${p.title} cover image" loading="lazy" />
        <div class="card-body">
          <h3 class="title">${p.title}</h3>
          <p class="pill">
            ${p.type.map(t=>`<span>#${t}</span>`).join(' ')} · 
            <span>${p.summary}</span>
          </p>
        </div>`;
      el.tabIndex = 0;
      el.setAttribute('role','button');
      el.setAttribute('aria-label', `${p.title} case study`);
      el.addEventListener('click', ()=> openModal(p));
      el.addEventListener('keypress', (e)=>{ if(e.key==='Enter') openModal(p) });
      return el;
    }

    function render(filter='all'){
      grid.innerHTML = '';
      const filtered = projects.filter(p => filter==='all' ? true : p.type.includes(filter));
      filtered.forEach(p => grid.appendChild(card(p)));
    }

    function openModal(p){
      if (!modal || !modalBody) return;
      modalBody.innerHTML = `
        <h3>${p.title}</h3>
        <p><strong>Role:</strong> ${p.role} · <strong>Tools:</strong> ${p.tools} · <strong>Timeline:</strong> ${p.timeline}</p>
        <div class="gallery">
          <img src="${p.cover}" alt="${p.title} screenshot" loading="lazy" />
          <img src="https://picsum.photos/seed/${p.id}/800/500" alt="Additional mock for ${p.title}" loading="lazy" />
        </div>
        <h4>Problem</h4>
        <p>${p.problem}</p>
        <h4>Process</h4>
        <ul>${p.process.map(step=>`<li>${step}</li>`).join('')}</ul>
        <h4>Outcome</h4>
        <ul>${p.outcome.map(o=>`<li>${o}</li>`).join('')}</ul>
      `;
      modal.showModal();
    }

    if (closeModal) {
      closeModal.addEventListener('click', ()=> modal.close());
    }

    chips.forEach(ch => ch.addEventListener('click', ()=>{
      chips.forEach(c=> c.setAttribute('aria-pressed','false'));
      ch.setAttribute('aria-pressed','true');
      render(ch.dataset.filter);
    }));

    render('all');
  }

  /* =============================
   *   FEATURE GALLERY LIGHTBOX
   * ============================= */
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

  /* =============================
   *   SMOOTH SCROLL TO CONTACT
   * ============================= */
  document.querySelectorAll('a[href="#contact"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  /* =============================
   *   MOBILE NAV TOGGLE
   * ============================= */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }
});
