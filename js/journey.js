(function () {
  const nav = document.getElementById('monthNav');
  const content = document.getElementById('content');
  const banner = document.getElementById('countdownBanner');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const switchBtn = document.getElementById('switchBtn');

  switchBtn.addEventListener('click', () => {
    localStorage.removeItem('aa_profile');
    window.location.href = 'index.html';
  });

  let months = MONTHS; // local data.js, replaced in place once Supabase loads

  // Each month runs from the 28th to the 28th (see js/data.js). Rather than
  // relying on a manually-toggled `current` flag that drifts if nobody
  // remembers to update it, work out "today's" month straight from the
  // calendar so this is always correct with zero upkeep.
  const JOURNEY_START = new Date('2025-10-28T00:00:00');

  function monthEndDate(n) {
    const d = new Date(JOURNEY_START);
    d.setMonth(d.getMonth() + n);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  function todaysMonthNumber(totalMonths) {
    const now = new Date();
    for (let n = 1; n <= totalMonths; n++) {
      if (now.getTime() <= monthEndDate(n).getTime()) return n;
    }
    return totalMonths; // past the last month we have data for — show the latest
  }

  let activeIndex = months.findIndex((m) => m.number === todaysMonthNumber(months.length));
  if (activeIndex === -1) activeIndex = months.length - 1;

  function renderCountdown() {
    const now = new Date();
    const diffMs = ANNIVERSARY_DATE - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      banner.textContent = `🎉 ${diffDays} day${diffDays === 1 ? '' : 's'} until our 10 months (${ANNIVERSARY_DAY_LABEL})!`;
    } else if (diffDays === 0) {
      banner.textContent = `🎉 Happy 10 months together today! 🎉`;
    } else {
      banner.textContent = `💕 ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} since our 10-month milestone!`;
    }
  }

  function photoSrc(month, photo) {
    if (/^https?:\/\//.test(photo)) return photo;
    return `photos/month-${String(month.number).padStart(2, '0')}/${photo}`;
  }

  function renderTabs() {
    nav.innerHTML = '';
    const todayNumber = todaysMonthNumber(months.length);
    months.forEach((month, i) => {
      const btn = document.createElement('button');
      btn.className = 'month-tab' + (month.number === todayNumber ? ' current' : '');
      btn.textContent = `Month ${month.number}`;
      btn.dataset.index = i;
      btn.addEventListener('click', () => setActive(i));
      nav.appendChild(btn);
    });
  }

  function renderPanels() {
    content.innerHTML = '';
    const todayNumber = todaysMonthNumber(months.length);
    months.forEach((month, i) => {
      const panel = document.createElement('section');
      panel.className = 'month-panel';
      panel.dataset.index = i;

      const card = document.createElement('div');
      card.className = 'card';

      if (month.number === todayNumber) {
        const badge = document.createElement('span');
        badge.className = 'milestone-badge';
        badge.textContent = '✨ Current month';
        card.appendChild(badge);
      }

      const title = document.createElement('h2');
      title.className = 'month-title';
      title.textContent = `Month ${month.number} · ${month.title}`;
      card.appendChild(title);

      const range = document.createElement('div');
      range.className = 'month-range';
      range.textContent = month.range;
      card.appendChild(range);

      const desc = document.createElement('p');
      desc.className = 'month-desc';
      desc.textContent = month.description;
      card.appendChild(desc);

      panel.appendChild(card);

      const photoCard = document.createElement('div');
      photoCard.className = 'card';

      if (month.photos && month.photos.length > 0) {
        const grid = document.createElement('div');
        grid.className = 'photo-grid';
        month.photos.forEach((photo) => {
          const img = document.createElement('img');
          img.src = photoSrc(month, photo);
          img.alt = `${month.title} photo`;
          img.loading = 'lazy';
          img.addEventListener('click', () => openLightbox(img.src));
          grid.appendChild(img);
        });
        photoCard.appendChild(grid);
      } else {
        const empty = document.createElement('div');
        empty.className = 'photo-empty';
        empty.textContent = `📸 Drop photos into the month-${String(month.number).padStart(2, '0')} folder in Supabase Storage`;
        photoCard.appendChild(empty);
      }

      panel.appendChild(photoCard);

      const arrows = document.createElement('div');
      arrows.className = 'nav-arrows';

      const prevBtn = document.createElement('button');
      prevBtn.textContent = '← Prev';
      prevBtn.disabled = i === 0;
      prevBtn.addEventListener('click', () => setActive(i - 1));

      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next →';
      nextBtn.disabled = i === months.length - 1;
      nextBtn.addEventListener('click', () => setActive(i + 1));

      arrows.appendChild(prevBtn);
      arrows.appendChild(nextBtn);
      panel.appendChild(arrows);

      content.appendChild(panel);
    });
  }

  function setActive(i) {
    if (i < 0 || i >= months.length) return;
    activeIndex = i;

    [...nav.children].forEach((tab, idx) => {
      tab.classList.toggle('active', idx === i);
    });
    [...content.children].forEach((panel, idx) => {
      panel.classList.toggle('active', idx === i);
    });

    const activeTab = nav.children[i];
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('open');
  }

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
  });

  // swipe support on content area
  let touchStartX = null;
  content.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  content.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(deltaX) > 60) {
      if (deltaX < 0) setActive(activeIndex + 1);
      else setActive(activeIndex - 1);
    }
    touchStartX = null;
  }, { passive: true });

  function rerender() {
    const preservedIndex = Math.min(activeIndex, months.length - 1);
    renderTabs();
    renderPanels();
    setActive(preservedIndex);
  }

  async function loadFromSupabase() {
    if (!supabaseClient) return;
    try {
      const { data: rows, error } = await supabaseClient
        .from('months')
        .select('number,title,range,description,current')
        .order('number', { ascending: true });
      if (error || !rows || rows.length === 0) throw error || new Error('No rows returned');

      const merged = rows.map((row) => {
        const local = MONTHS.find((m) => m.number === row.number) || {};
        return { ...local, ...row, photos: local.photos || [] };
      });

      await Promise.all(
        merged.map(async (month) => {
          const folder = `month-${String(month.number).padStart(2, '0')}`;
          const { data: files, error: listErr } = await supabaseClient.storage
            .from('photos')
            .list(folder, { sortBy: { column: 'name', order: 'asc' } });
          if (listErr || !files) return;

          const realFiles = files.filter((f) => f.name && !f.name.startsWith('.'));
          month.photos = realFiles.map(
            (f) => supabaseClient.storage.from('photos').getPublicUrl(`${folder}/${f.name}`).data.publicUrl
          );
        })
      );

      months = merged;
      rerender();
    } catch (e) {
      console.warn('Supabase load failed, staying on local js/data.js content:', e);
    }
  }

  renderCountdown();
  renderTabs();
  renderPanels();
  setActive(activeIndex);

  loadFromSupabase();
})();
