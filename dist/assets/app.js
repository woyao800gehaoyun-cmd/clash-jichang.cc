const menuButton = document.querySelector('[data-menu]');
const nav = document.querySelector('[data-nav]');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const toolSections = [...document.querySelectorAll('[data-tool-section]')];
const toolCards = [...document.querySelectorAll('[data-tool-card]')];
const searchInput = document.querySelector('[data-tool-search]');
const emptyState = document.querySelector('[data-empty]');
let activeFilter = 'all';

function filterTools() {
  const query = (searchInput?.value || '').trim().toLowerCase();
  let visibleCount = 0;
  toolCards.forEach((card) => {
    const matchesGroup = activeFilter === 'all' || card.dataset.group === activeFilter;
    const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
    const visible = matchesGroup && matchesQuery;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  toolSections.forEach((section) => {
    section.hidden = !section.querySelector('[data-tool-card]:not([hidden])');
  });
  if (emptyState) emptyState.style.display = visibleCount ? 'none' : 'block';
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    filterTools();
  });
});

searchInput?.addEventListener('input', filterTools);

const articleSearch = document.querySelector('[data-article-search]');
const articleCards = [...document.querySelectorAll('[data-article-card]')];
articleSearch?.addEventListener('input', () => {
  const query = articleSearch.value.trim().toLowerCase();
  articleCards.forEach((card) => {
    card.hidden = query && !card.textContent.toLowerCase().includes(query);
  });
});
