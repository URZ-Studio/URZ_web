/* Shared portfolio controls and page-specific interactions. */
(() => {
  'use strict';

  const root = document.documentElement;
  const theme = document.getElementById('themeToggle');
  const menu = document.getElementById('menuToggle');
  const nav = document.getElementById('siteNav');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let userTheme;
  try { userTheme = localStorage.getItem('urz-theme'); } catch {}

  function applyTheme(mode) {
    root.dataset.theme = mode;
    theme.setAttribute('aria-pressed', String(mode === 'dark'));
    document.querySelector('meta[name="theme-color"]').content = mode === 'dark' ? '#0F1924' : '#F7FAFC';
  }
  applyTheme(root.dataset.theme);
  theme.hidden = false;
  theme.addEventListener('click', () => {
    userTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(userTheme);
    try { localStorage.setItem('urz-theme', userTheme); } catch {}
  });
  systemTheme.addEventListener('change', ({matches}) => {
    if (userTheme !== 'light' && userTheme !== 'dark') applyTheme(matches ? 'dark' : 'light');
  });

  function showMenu(open, restoreFocus = false) {
    menu.setAttribute('aria-expanded', String(open));
    if (restoreFocus) menu.focus();
  }
  menu.hidden = false;
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'false';
    showMenu(open);
    if (open) nav.querySelector('a').focus();
  });
  document.addEventListener('pointerdown', event => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) showMenu(false);
  });
  document.addEventListener('focusin', event => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) showMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') showMenu(false, true);
  });
  matchMedia('(max-width: 740px)').addEventListener('change', () => showMenu(false));

  for (const year of document.querySelectorAll('.year')) year.textContent = new Date().getFullYear();

  let toastTimer;
  window.urzToast = message => {
    const parent = document.querySelector('dialog[open]') || document.body;
    let wrap = parent.querySelector(':scope > .toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      wrap.setAttribute('role', 'status');
      parent.append(wrap);
    }
    clearTimeout(toastTimer);
    document.querySelectorAll('.toast').forEach(el => el.remove());
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    wrap.append(toast);
    toastTimer = setTimeout(() => toast.remove(), 3800);
  };

  // Native dialog handles inert background, keyboard containment and Escape.
  // A backdrop click must begin and end outside the content.
  window.urzBackdrop = (dialog, close) => {
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', event => { pressedOutside = event.target === dialog; });
    dialog.addEventListener('click', event => {
      if (pressedOutside && event.target === dialog) close();
      pressedOutside = false;
    });
  };

  const projectDialog = document.getElementById('projectDetail');
  if (projectDialog) {
    const content = projectDialog.querySelector('[data-project-content]');
    for (const opener of document.querySelectorAll('[data-project]')) {
      const template = document.getElementById('project-' + opener.dataset.project);
      opener.hidden = false;
      opener.addEventListener('click', () => {
        content.replaceChildren(template.content.cloneNode(true));
        projectDialog.scrollTop = 0;
        projectDialog.showModal();
      });
    }
    const close = () => projectDialog.close();
    projectDialog.querySelector('[data-close-detail]').addEventListener('click', close);
    window.urzBackdrop(projectDialog, close);
  }

  const filters = document.querySelector('.filter-row');
  if (filters) {
    const buttons = [...filters.querySelectorAll('[data-filter]')];
    const cards = [...document.querySelectorAll('#projectsGrid .work-card')];
    const status = document.getElementById('projectCount');
    filters.hidden = false;
    filters.addEventListener('click', event => {
      const active = event.target.closest('[data-filter]');
      if (!active) return;
      for (const button of buttons) button.setAttribute('aria-pressed', String(active === button));
      let count = 0;
      for (const card of cards) {
        card.hidden = active.dataset.filter !== 'all' && active.dataset.filter !== card.dataset.category;
        if (!card.hidden) count++;
      }
      status.textContent = count + '개 프로젝트';
    });
  }

  const tabList = document.querySelector('.case-tabs');
  if (tabList) {
    const tabs = [...tabList.querySelectorAll('[data-case-tab]')];
    const panels = tabs.map(tab => document.getElementById('panel-' + tab.dataset.caseTab));
    tabList.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      tab.hidden = false;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].tabIndex = 0;
      tab.addEventListener('click', () => selectTab(index));
    });

    function selectTab(index) {
      tabs.forEach((tab, position) => {
        const selected = position === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[position].hidden = !selected;
      });
    }
    selectTab(0);
    tabList.addEventListener('keydown', event => {
      const current = tabs.indexOf(event.target);
      if (current === -1) return;
      let next;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(next);
      tabs[next].focus();
    });
  }

  const gallery = document.getElementById('galleryPreview');
  if (gallery) {
    const section = gallery.closest('section');
    new IntersectionObserver((entries, observer) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      loadGalleryPreview();
    }, {rootMargin: '350px'}).observe(section);
  }

  async function loadGalleryPreview() {
    try {
      const response = await fetch('/api/gallery?limit=3', {signal: AbortSignal.timeout(8000)});
      if (!response.ok) return;
      const {items} = await response.json();
      for (const item of items || []) {
        const link = document.createElement('a');
        link.href = 'gallery.html?art=' + encodeURIComponent(item.id);
        const image = document.createElement('img');
        const title = document.createElement('span');
        image.src = item.src;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        title.textContent = item.title;
        link.append(image, title);
        gallery.append(link);
      }
      gallery.hidden = !gallery.childElementCount;
    } catch {
      // The public gallery page provides connection feedback and retry.
    }
  }
})();
