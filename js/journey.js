(async function () {
  const nav = document.getElementById('monthNav');
  const content = document.getElementById('content');
  const streakBadge = document.getElementById('streakBadge');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const signOutBtn = document.getElementById('signOutBtn');

  const journeyView = document.getElementById('journeyView');
  const profileView = document.getElementById('profileView');
  const wallView = document.getElementById('wallView');
  const bottomNavBtns = document.querySelectorAll('.bottom-nav-btn');
  const profileAvatar = document.getElementById('profileAvatar');
  const profileName = document.getElementById('profileName');
  const statDays = document.getElementById('statDays');
  const statMonths = document.getElementById('statMonths');

  const noteForm = document.getElementById('noteForm');
  const noteInput = document.getElementById('noteInput');
  const noteSubmitBtn = document.getElementById('noteSubmitBtn');
  const wallEmpty = document.getElementById('wallEmpty');
  const pinnedNotesEl = document.getElementById('pinnedNotes');
  const allNotesEl = document.getElementById('allNotes');

  const JOURNEY_START = new Date('2025-10-28T00:00:00');
  const CACHE_KEY = 'aa_journey_cache_v1';

  // Real auth gate: no session, no journey. Redirect before rendering
  // anything so there's nothing to flash on screen for an unauthenticated
  // visitor.
  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (!sessionData.session) {
    window.location.replace('index.html');
    return;
  }
  const currentUser = sessionData.session.user;
  const displayName = (currentUser.user_metadata && currentUser.user_metadata.name) || currentUser.email;

  if (displayName === 'Angelos') {
    document.documentElement.classList.add('theme-blue');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#e8f1fe');
  }

  signOutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  });

  let months = MONTHS; // local data.js, replaced in place once Supabase loads

  // Cheap perceived-speed win: if we loaded real data from Supabase before
  // (this browser session), use it for the very first paint instead of the
  // static local fallback, while still refreshing from the network below.
  const cached = loadCachedMonths();
  if (cached && cached.length) months = cached;

  // The "current" month is simply whichever month has the highest number
  // in the data — i.e. the most recently added one. You add a new month
  // row/folder when that month starts, so this always matches reality
  // with zero manual flags and no assumptions about exact calendar dates.
  function latestMonthNumber(monthsList) {
    return monthsList.reduce((max, m) => Math.max(max, m.number), 0);
  }

  let activeIndex = months.findIndex((m) => m.number === latestMonthNumber(months));
  if (activeIndex === -1) activeIndex = months.length - 1;

  // Only true once the user has actually picked a tab themselves — lets
  // rerender() (called once Supabase's full month list arrives) jump to
  // the real latest month instead of freezing on whatever a smaller/stale
  // starting list guessed at first.
  let userHasNavigated = false;

  function loadCachedMonths() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed && parsed.months) ? parsed.months : null;
    } catch (e) {
      return null;
    }
  }

  function saveCachedMonths(monthsToCache) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ months: monthsToCache, savedAt: Date.now() }));
    } catch (e) {
      // sessionStorage unavailable (e.g. private mode) — fine to skip caching
    }
  }

  function renderCountdown() {
    const now = new Date();
    const diffMs = ANNIVERSARY_DATE - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      streakBadge.textContent = `${diffDays}d`;
      streakBadge.title = `${diffDays} day${diffDays === 1 ? '' : 's'} until our 10 months (${ANNIVERSARY_DAY_LABEL})`;
    } else if (diffDays === 0) {
      streakBadge.textContent = `🎉`;
      streakBadge.title = `Happy 10 months together today!`;
    } else {
      const daysSince = Math.abs(diffDays);
      streakBadge.textContent = `💕 +${daysSince}d`;
      streakBadge.title = `${daysSince} day${daysSince === 1 ? '' : 's'} since our 10-month milestone`;
    }
  }

  function photoSrc(month, photo) {
    if (/^https?:\/\//.test(photo)) return photo;
    return `photos/month-${String(month.number).padStart(2, '0')}/${photo}`;
  }

  function renderTabs() {
    nav.innerHTML = '';
    const todayNumber = latestMonthNumber(months);
    months.forEach((month, i) => {
      const btn = document.createElement('button');
      btn.className = 'month-tab' + (month.number === todayNumber ? ' current' : '');
      btn.textContent = `Month ${month.number}`;
      btn.dataset.index = i;
      btn.addEventListener('click', () => {
        userHasNavigated = true;
        setActive(i);
      });
      nav.appendChild(btn);
    });
  }

  function renderPanels() {
    content.innerHTML = '';
    const todayNumber = latestMonthNumber(months);
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
      prevBtn.addEventListener('click', () => {
        userHasNavigated = true;
        setActive(i - 1);
      });

      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next →';
      nextBtn.disabled = i === months.length - 1;
      nextBtn.addEventListener('click', () => {
        userHasNavigated = true;
        setActive(i + 1);
      });

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
      userHasNavigated = true;
      if (deltaX < 0) setActive(activeIndex + 1);
      else setActive(activeIndex - 1);
    }
    touchStartX = null;
  }, { passive: true });

  function rerender() {
    if (!userHasNavigated) {
      activeIndex = months.findIndex((m) => m.number === latestMonthNumber(months));
      if (activeIndex === -1) activeIndex = months.length - 1;
    }
    const preservedIndex = Math.min(activeIndex, months.length - 1);
    renderTabs();
    renderPanels();
    setActive(preservedIndex);
    renderProfileStats();
  }

  // ---------------- bottom nav / profile view ----------------

  function switchView(view) {
    bottomNavBtns.forEach((b) => b.classList.toggle('active', b.dataset.view === view));

    nav.classList.toggle('hidden', view !== 'journey');
    journeyView.classList.toggle('hidden', view !== 'journey');
    profileView.classList.toggle('hidden', view !== 'profile');
    wallView.classList.toggle('hidden', view !== 'wall');

    if (view === 'profile') renderProfileStats();
  }

  bottomNavBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  function renderProfileStats() {
    const daysTogether = Math.floor((Date.now() - JOURNEY_START.getTime()) / (1000 * 60 * 60 * 24));

    profileAvatar.textContent = displayName.slice(0, 2);
    profileName.textContent = displayName;
    statDays.textContent = daysTogether;
    statMonths.textContent = months.length;
  }

  // ---------------- Supabase load (parallelized + cached) ----------------

  async function listMonthPhotos(number) {
    const folder = `month-${String(number).padStart(2, '0')}`;
    const { data: files, error } = await supabaseClient.storage
      .from('photos')
      .list(folder, { sortBy: { column: 'name', order: 'asc' } });
    if (error || !files) return [];
    return files
      .filter((f) => f.name && !f.name.startsWith('.'))
      .map((f) => supabaseClient.storage.from('photos').getPublicUrl(`${folder}/${f.name}`).data.publicUrl);
  }

  async function loadFromSupabase() {
    if (!supabaseClient) return;
    try {
      // Fire the months query and photo listings for every month we
      // already know about (local + cached) at the same time, instead of
      // waiting for the table to answer before starting any storage
      // calls — cuts one full network round trip off the load.
      const monthsPromise = supabaseClient
        .from('months')
        .select('number,title,range,description')
        .order('number', { ascending: true });

      const photoPromises = new Map(months.map((m) => [m.number, listMonthPhotos(m.number)]));

      const { data: rows, error } = await monthsPromise;
      if (error || !rows || rows.length === 0) throw error || new Error('No rows returned');

      // Any month not already covered above (e.g. a brand-new one) starts now.
      rows.forEach((row) => {
        if (!photoPromises.has(row.number)) {
          photoPromises.set(row.number, listMonthPhotos(row.number));
        }
      });

      const merged = await Promise.all(
        rows.map(async (row) => {
          const local = MONTHS.find((m) => m.number === row.number) || {};
          const photos = await photoPromises.get(row.number);
          return { ...local, ...row, photos };
        })
      );

      months = merged;
      saveCachedMonths(merged);
      rerender();
    } catch (e) {
      console.warn('Supabase load failed, staying on local content:', e);
    }
  }

  // ---------------- Wall ----------------

  let wallNotes = [];

  function formatRelativeTime(iso) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = `note-card note-color-${note.color === 'blue' ? 'blue' : 'pink'}`;

    const content = document.createElement('p');
    content.className = 'note-content';
    content.textContent = note.content;
    card.appendChild(content);

    const meta = document.createElement('div');
    meta.className = 'note-meta';

    const author = document.createElement('span');
    author.className = 'note-author';
    author.textContent = `${note.author_name} · ${formatRelativeTime(note.created_at)}`;
    meta.appendChild(author);

    const actions = document.createElement('span');
    actions.className = 'note-actions';

    const pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.className = 'note-action-btn' + (note.pinned ? ' pinned' : '');
    pinBtn.textContent = '📌';
    pinBtn.title = note.pinned ? 'Unpin' : 'Pin to top';
    pinBtn.addEventListener('click', () => togglePin(note));
    actions.appendChild(pinBtn);

    if (note.user_id === currentUser.id) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'note-action-btn';
      deleteBtn.textContent = '🗑️';
      deleteBtn.title = 'Delete';
      deleteBtn.addEventListener('click', () => deleteNote(note.id));
      actions.appendChild(deleteBtn);
    }

    meta.appendChild(actions);
    card.appendChild(meta);
    return card;
  }

  function renderWallNotes() {
    pinnedNotesEl.innerHTML = '';
    allNotesEl.innerHTML = '';

    wallEmpty.classList.toggle('hidden', wallNotes.length > 0);

    const pinned = wallNotes.filter((n) => n.pinned);
    const rest = wallNotes.filter((n) => !n.pinned);

    if (pinned.length > 0) {
      const heading = document.createElement('div');
      heading.className = 'wall-section-heading';
      heading.textContent = '📌 Pinned';
      pinnedNotesEl.appendChild(heading);
      pinned.forEach((note) => pinnedNotesEl.appendChild(createNoteCard(note)));
    }

    if (rest.length > 0 && pinned.length > 0) {
      const heading = document.createElement('div');
      heading.className = 'wall-section-heading';
      heading.textContent = 'Everything else';
      allNotesEl.appendChild(heading);
    }
    rest.forEach((note) => allNotesEl.appendChild(createNoteCard(note)));
  }

  async function loadWallNotes() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from('wall_notes')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Wall load failed:', error);
      return;
    }
    wallNotes = data || [];
    renderWallNotes();
  }

  async function togglePin(note) {
    const { error } = await supabaseClient.from('wall_notes').update({ pinned: !note.pinned }).eq('id', note.id);
    if (error) console.warn('Pin toggle failed:', error);
    loadWallNotes();
  }

  async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    const { error } = await supabaseClient.from('wall_notes').delete().eq('id', id);
    if (error) console.warn('Delete failed:', error);
    loadWallNotes();
  }

  noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = noteInput.value.trim();
    if (!text) return;

    noteSubmitBtn.disabled = true;
    const { error } = await supabaseClient.from('wall_notes').insert({
      user_id: currentUser.id,
      author_name: displayName,
      content: text,
      color: displayName === 'Angelos' ? 'blue' : 'pink',
    });
    noteSubmitBtn.disabled = false;

    if (error) {
      console.warn('Post note failed:', error);
      return;
    }
    noteInput.value = '';
    loadWallNotes();
  });

  // Live updates: if the other person posts/pins/deletes a note while
  // you're both looking at the Wall, it updates without a manual refresh.
  supabaseClient
    .channel('wall_notes_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'wall_notes' }, () => loadWallNotes())
    .subscribe();

  renderCountdown();
  renderTabs();
  renderPanels();
  setActive(activeIndex);

  loadFromSupabase();
  loadWallNotes();
})();
