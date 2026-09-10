const cardsGrid = document.getElementById('cardsGrid');
const filtersContainer = document.getElementById('filters');
const standingsList = document.getElementById('standingsList');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('detailModal');
const modalTitle = document.getElementById('modalTitle');
const modalBadge = document.getElementById('modalBadge');
const modalDriver = document.getElementById('modalDriver');
const modalTeam = document.getElementById('modalTeam');
const modalCircuit = document.getElementById('modalCircuit');
const modalRarity = document.getElementById('modalRarity');
const rarityFill = document.getElementById('rarityFill');
const modalSummary = document.getElementById('modalSummary');
const closeModal = document.getElementById('closeModal');
const collectionSummary = document.getElementById('collectionSummary');
const collectionCount = document.getElementById('collectionCount');
const collectionProgress = document.getElementById('collectionProgress');
const nextRaceName = document.getElementById('nextRaceName');
const nextRaceLocation = document.getElementById('nextRaceLocation');
const nextRaceDate = document.getElementById('nextRaceDate');
const nextRaceCountry = document.getElementById('nextRaceCountry');
const nextRaceFocus = document.getElementById('nextRaceFocus');
const raceTrackSvg = document.getElementById('raceTrackSvg');
const raceTrackName = document.getElementById('raceTrackName');
const calendarList = document.getElementById('calendarList');
const calendarSummary = document.getElementById('calendarSummary');
const standingsTableBody = document.getElementById('standingsTableBody');
const standingsSortButtons = document.querySelectorAll('.sort-btn');
const backToTopButton = document.getElementById('backToTop');
const AUTH_USERS_KEY = 'f1-card-tracker-users';

const fallbackStandings = [
  { position: 1, driver: 'Max Verstappen', team: 'Red Bull', points: 310 },
  { position: 2, driver: 'Charles Leclerc', team: 'Ferrari', points: 272 },
  { position: 3, driver: 'Lando Norris', team: 'McLaren', points: 249 },
  { position: 4, driver: 'Carlos Sainz', team: 'Ferrari', points: 231 },
  { position: 5, driver: 'Lewis Hamilton', team: 'Mercedes', points: 204 },
];

const LIVE_REFRESH_MS = 30 * 1000;
let standings = [...fallbackStandings];

function renderStandingsTable(rows = standings) {
  if (!standingsTableBody) return;

  standingsTableBody.innerHTML = rows
    .map(
      (driver) => `
        <tr>
          <td>${driver.position}</td>
          <td>${driver.driver}</td>
          <td>
            <span class="team-pill" style="background:${getTeamColor(driver.team)}20; border-color:${getTeamColor(driver.team)}55; color:${getTeamColor(driver.team)};">
              ${driver.team}
            </span>
          </td>
          <td>${driver.points}</td>
        </tr>
      `
    )
    .join('');
}

function initStandingsTableControls() {
  if (!standingsSortButtons?.length) return;

  standingsSortButtons.forEach((button) => {
    button.addEventListener('click', () => {
      standingsSortButtons.forEach((item) => item.classList.toggle('active', item === button));
      const sortKey = button.dataset.sort === 'points' ? 'points' : 'position';
      const sortedRows = [...standings].sort((a, b) => {
        if (sortKey === 'points') return Number(b.points) - Number(a.points);
        return Number(a.position) - Number(b.position);
      });
      renderStandingsTable(sortedRows);
    });
  });
}

function getTeamColor(team) {
  const teamColors = {
    'Red Bull': '#1d4ed8',
    'Ferrari': '#dc2626',
    'McLaren': '#f97316',
    'Mercedes': '#0ea5e9',
    'Aston Martin': '#10b981',
    'Alpine': '#3b82f6',
    'Williams': '#60a5fa',
    'RB': '#a855f7',
    'Haas': '#94a3b8',
    'Kick Sauber': '#facc15',
    'Alfa Romeo': '#f87171',
    'AlphaTauri': '#a78bfa',
  };

  return teamColors[team] || '#ef4444';
}
const AUTH_CURRENT_USER_KEY = 'f1-card-tracker-current-user';
const AUTH_TOKEN_KEY = 'f1-card-tracker-auth-token';

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function setAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : (payload?.error || 'Request failed');
    throw new Error(message);
  }

  return payload;
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_CURRENT_USER_KEY) || 'null');
  } catch {
    return null;
  }
}

function getCardCatalog() {
  return [
    {
      title: '2024 Singapore GP',
      driver: 'Lando Norris',
      team: 'McLaren',
      badge: 'Legend',
      points: '98 pts',
      accent: 'red',
      circuit: 'Marina Bay',
      summary: 'A measured, aggressive charge in Singapore under lights produced a commanding result.',
      description: 'A dramatic night race masterclass where Lando stole the initiative with ruthless pace and precise tire management.',
      rarity: 94,
      marketValue: '$1,240',
    },
    {
      title: '2024 Monaco GP',
      driver: 'Charles Leclerc',
      team: 'Ferrari',
      badge: 'Ultra',
      points: '101 pts',
      accent: 'red',
      circuit: 'Monaco',
      summary: 'Ferrari pace and precision on a street circuit made this a standout Monaco masterclass.',
      description: 'A sharp, fearless Monaco drive that showed elite confidence through traffic and a flawless final stint.',
      rarity: 97,
      marketValue: '$1,480',
    },
    {
      title: '2024 Miami GP',
      driver: 'Oscar Piastri',
      team: 'McLaren',
      badge: 'Rare',
      points: '89 pts',
      accent: 'dark',
      circuit: 'Miami',
      summary: 'A bold strategy call and quick tire management turned momentum into a crucial podium finish.',
      description: 'A fearless Miami performance with sharp racecraft and relentless pressure at the front of the field.',
      rarity: 76,
      marketValue: '$960',
    },
    {
      title: '2023 Abu Dhabi GP',
      driver: 'Max Verstappen',
      team: 'Red Bull',
      badge: 'Ultra',
      points: '104 pts',
      accent: 'red',
      circuit: 'Yas Marina',
      summary: 'A championship-defining drive in Abu Dhabi sealed a dramatic season finale.',
      description: 'The title-deciding race that captured all the tension, aggression, and cool-headed control of a champion.',
      rarity: 99,
      marketValue: '$1,620',
    },
    {
      title: '2024 Hungaroring GP',
      driver: 'Carlos Sainz',
      team: 'Ferrari',
      badge: 'Rare',
      points: '90 pts',
      accent: 'blue',
      circuit: 'Hungaroring',
      summary: 'Late-race confidence and tire discipline created a high-pressure win in Hungary.',
      description: 'A measured and resilient drive that blended tire discipline with decisive overtakes when it mattered most.',
      rarity: 80,
      marketValue: '$1,050',
    },
    {
      title: '2024 Suzuka GP',
      driver: 'Lewis Hamilton',
      team: 'Mercedes',
      badge: 'Legend',
      points: '95 pts',
      accent: 'green',
      circuit: 'Suzuka',
      summary: 'Hamilton’s smooth rhythm and racecraft made this a classic Suzuka performance.',
      description: 'An elegant and technical performance at Suzuka that showcased balance, confidence, and pure speed.',
      rarity: 91,
      marketValue: '$1,340',
    },
  ];
}

function getUserCollectionKey(email) {
  return `f1-card-tracker-owned-${email}`;
}

function getCustomCards() {
  const currentUser = getCurrentUser();

  if (!currentUser || !currentUser.email) {
    return [];
  }

  try {
    const saved = JSON.parse(localStorage.getItem(`f1-card-tracker-custom-cards-${currentUser.email}`) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCustomCards(customCards) {
  const currentUser = getCurrentUser();

  if (!currentUser || !currentUser.email) {
    return;
  }

  localStorage.setItem(`f1-card-tracker-custom-cards-${currentUser.email}`, JSON.stringify(customCards));
}

async function loadOwnedCards() {
  const currentUser = getCurrentUser();
  const token = getAuthToken();

  if (!currentUser || !currentUser.email) {
    return [];
  }

  if (token) {
    try {
      const data = await apiRequest('/api/collection');
      return Array.isArray(data?.cards) ? data.cards.map((card) => card.title) : [];
    } catch {
      // fall through to localStorage if the server is unavailable
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(getUserCollectionKey(currentUser.email)) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

async function saveOwnedCards(ownedCards) {
  const currentUser = getCurrentUser();

  if (!currentUser || !currentUser.email) {
    return;
  }

  const titles = Array.from(ownedCards);
  localStorage.setItem(getUserCollectionKey(currentUser.email), JSON.stringify(titles));

  const token = getAuthToken();
  if (token) {
    try {
      const cards = [...getCardCatalog(), ...getCustomCards()];
      const selectedCards = cards.filter((card) => titles.includes(card.title));
      await apiRequest('/api/collection', {
        method: 'POST',
        body: JSON.stringify({ cards: selectedCards }),
      });
    } catch (error) {
      console.warn('Failed to sync collection with server:', error.message);
    }
  }
}

function setupAuthButtons() {
  const authActionBtn = document.getElementById('authActionBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const currentUser = getCurrentUser();

  if (authActionBtn) {
    if (currentUser && currentUser.email) {
      authActionBtn.textContent = currentUser.name || currentUser.email;
      authActionBtn.title = 'View profile';
    } else {
      authActionBtn.textContent = 'Login';
      authActionBtn.title = 'Login to track your collection';
    }

    authActionBtn.addEventListener('click', () => {
      if (getCurrentUser()?.email) {
        window.location.href = 'profile.html';
      } else {
        window.location.href = 'login.html';
      }
    });
  }

  if (logoutBtn) {
    if (currentUser && currentUser.email) {
      logoutBtn.hidden = false;
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(AUTH_CURRENT_USER_KEY);
        setAuthToken('');
        window.location.href = 'login.html';
      });
    } else {
      logoutBtn.hidden = true;
    }
  }
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(user));
}

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatCalendarDate(dateString) {
  return new Date(`${dateString}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

async function fetchCurrentStandings() {
  try {
    const response = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings/');

    if (!response.ok) {
      throw new Error(`Standings request failed: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

    const formatted = rows.map((item) => ({
      position: Number(item.position),
      driver: `${item.Driver.givenName} ${item.Driver.familyName}`,
      team: item.Constructors?.[0]?.name || 'Unknown team',
      points: Number(item.points),
    }));

    if (!formatted.length) {
      throw new Error('No standings returned for the current season');
    }

    standings = formatted;
    if (typeof renderStandings === 'function') renderStandings(formatted.slice(0, 5));
    if (typeof renderStandingsTable === 'function') renderStandingsTable(formatted);
    return formatted;
  } catch (error) {
    console.warn('Using fallback standings:', error);
    standings = [...fallbackStandings];
    if (typeof renderStandings === 'function') renderStandings(standings.slice(0, 5));
    if (typeof renderStandingsTable === 'function') renderStandingsTable(standings);
    return standings;
  }
}

function getCountryFlag(countryName) {
  const flags = {
    'Australia': '🇦🇺',
    'Bahrain': '🇧🇭',
    'China': '🇨🇳',
    'Japan': '🇯🇵',
    'Saudi Arabia': '🇸🇦',
    'United States': '🇺🇸',
    'United Arab Emirates': '🇦🇪',
    'Monaco': '🇲🇨',
    'Spain': '🇪🇸',
    'Canada': '🇨🇦',
    'Austria': '🇦🇹',
    'United Kingdom': '🇬🇧',
    'Hungary': '🇭🇺',
    'Belgium': '🇧🇪',
    'Netherlands': '🇳🇱',
    'Italy': '🇮🇹',
    'Singapore': '🇸🇬',
    'Mexico': '🇲🇽',
    'Brazil': '🇧🇷',
    'Qatar': '🇶🇦',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'Azerbaijan': '🇦🇿',
    'Malaysia': '🇲🇾',
    'Portugal': '🇵🇹',
    'Morocco': '🇲🇦',
    'Argentina': '🇦🇷',
    'India': '🇮🇳',
    'Finland': '🇫🇮',
    'Sweden': '🇸🇪',
    'Switzerland': '🇨🇭',
  };

  return flags[countryName] || '🏁';
}

function getRaceDistributionStatus(dateString) {
  const raceDate = new Date(`${dateString}T12:00:00Z`);
  const today = new Date();
  const diffDays = (raceDate - today) / (1000 * 60 * 60 * 24);

  if (diffDays < -1) return { label: 'Completed', tone: 'completed' };
  if (diffDays <= 3) return { label: 'This weekend', tone: 'upcoming' };
  return { label: 'Upcoming', tone: 'upcoming' };
}

function navigateToPage(targetPage) {
  const safeTarget = targetPage || 'index.html';
  const current = window.location.pathname.split('/').pop() || 'index.html';

  if (current === safeTarget) return;
  window.location.href = safeTarget;
}

function bindStatCardLinks() {
  document.querySelectorAll('.stat-card-link').forEach((card) => {
    const targetPage = card.dataset.page || 'index.html';

    const openPage = () => navigateToPage(targetPage);
    card.addEventListener('click', openPage);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPage();
      }
    });
  });
}

(async function initPageNavigation() {
  document.querySelectorAll('.nav-pill').forEach((button) => {
    const targetPage = button.dataset.page || 'index.html';
    button.setAttribute('type', 'button');
    button.onclick = () => navigateToPage(targetPage);
    button.addEventListener('click', () => {
      navigateToPage(targetPage);
    }, { once: true });
  });
})();

async function fetchCurrentNextRace() {
  if (!nextRaceName || !nextRaceLocation || !nextRaceDate || !nextRaceCountry || !nextRaceFocus) return;

  try {
    const response = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json');

    if (!response.ok) {
      throw new Error(`Next race request failed: ${response.status}`);
    }

    const data = await response.json();
    const race = data.MRData?.RaceTable?.Races?.[0];

    if (!race) {
      throw new Error('No next race returned');
    }

    const circuitName = race.Circuit?.circuitName || 'Circuit unknown';
    const circuitId = race.Circuit?.circuitId || 'generic';

    const countryName = race.Circuit?.Location?.country || 'Unknown';

    nextRaceName.textContent = race.raceName.replace(' Grand Prix', ' GP');
    nextRaceLocation.textContent = circuitName;
    nextRaceDate.textContent = formatDate(race.date);
    nextRaceCountry.textContent = countryName;
    nextRaceFocus.textContent = race.Sprint ? 'Sprint weekend' : 'Race weekend';
  } catch (error) {
    console.warn('Failed to load next race:', error);
    nextRaceName.textContent = 'Dutch GP';
    nextRaceLocation.textContent = 'Circuit Park Zandvoort';
    nextRaceDate.textContent = 'Aug 23, 2026';
    nextRaceCountry.textContent = 'Netherlands';
    nextRaceFocus.textContent = 'Sprint weekend';
  }
}

async function fetchCalendar() {
  if (!calendarList || !calendarSummary) return;

  try {
    const response = await fetch('https://api.jolpi.ca/ergast/f1/current.json');

    if (!response.ok) {
      throw new Error(`Calendar request failed: ${response.status}`);
    }

    const data = await response.json();
    const races = data.MRData?.RaceTable?.Races || [];

    calendarSummary.textContent = `${races.length} races on the 2026 Formula One calendar.`;
    calendarList.innerHTML = races
      .map((race) => {
        const country = race.Circuit?.Location?.country || 'Unknown country';
        const status = getRaceDistributionStatus(race.date);
        const flag = getCountryFlag(country);

        return `
          <article class="calendar-item">
            <div class="calendar-round">R${race.round}</div>
            <div class="calendar-info">
              <div class="calendar-meta">
                <span class="calendar-flag">${flag}</span>
                <span class="calendar-status ${status.tone}">${status.label}</span>
              </div>
              <h3>${race.raceName}</h3>
              <p>${race.Circuit?.circuitName || 'Unknown circuit'} • ${country}</p>
            </div>
            <div class="calendar-date">
              <strong>${formatCalendarDate(race.date)}</strong>
              <span class="calendar-type">${race.Sprint ? 'Sprint' : 'Grand Prix'}</span>
            </div>
          </article>
        `;
      })
      .join('');
  } catch (error) {
    console.warn('Failed to load race calendar:', error);
    calendarSummary.textContent = 'The full calendar is temporarily unavailable.';
    calendarList.innerHTML = '<div class="empty-state">Calendar unavailable right now.</div>';
  }
}

if (nextRaceName || nextRaceLocation || nextRaceDate || nextRaceCountry || nextRaceFocus) {
  fetchCurrentNextRace();
  setInterval(fetchCurrentNextRace, LIVE_REFRESH_MS);
}

if (calendarList || calendarSummary) {
  fetchCalendar();
  setInterval(fetchCalendar, LIVE_REFRESH_MS);
}

if (document.getElementById('marketList')) {
  const marketListings = [
    {
      seller: 'Ava M.',
      card: '2024 Singapore GP',
      driver: 'Lando Norris',
      team: 'McLaren',
      condition: 'Mint / PSA 10',
      price: '$1,240',
      badge: 'Legend',
    },
    {
      seller: 'Theo R.',
      card: '2024 Monaco GP',
      driver: 'Charles Leclerc',
      team: 'Ferrari',
      condition: 'Near mint',
      price: '$1,480',
      badge: 'Ultra',
    },
    {
      seller: 'Nia S.',
      card: '2023 Abu Dhabi GP',
      driver: 'Max Verstappen',
      team: 'Red Bull',
      condition: 'Gem mint',
      price: '$1,620',
      badge: 'Ultra',
    },
    {
      seller: 'Kian P.',
      card: '2024 Suzuka GP',
      driver: 'Lewis Hamilton',
      team: 'Mercedes',
      condition: 'Excellent',
      price: '$980',
      badge: 'Rare',
    },
  ];

  const marketList = document.getElementById('marketList');
  marketList.innerHTML = marketListings
    .map(
      (item) => `
        <article class="market-card">
          <div class="market-card-top">
            <span class="badge-pill">${item.badge}</span>
            <span class="market-price">${item.price}</span>
          </div>
          <div class="market-card-body">
            <div>
              <p class="market-seller">Seller: ${item.seller}</p>
              <h3>${item.card}</h3>
            </div>
            <div class="market-meta">
              <span>${item.driver}</span>
              <span>${item.team}</span>
              <span>${item.condition}</span>
            </div>
          </div>
          <button class="primary-btn market-action" type="button">Message seller</button>
        </article>
      `
    )
    .join('');
}

bindStatCardLinks();

if (standingsTableBody) {
  renderStandingsTable();
  initStandingsTableControls();
  fetchCurrentStandings();
  setInterval(fetchCurrentStandings, 5 * 60 * 1000);
}

if (!cardsGrid || !filtersContainer || !standingsList || !searchInput || !modal || !modalTitle || !modalBadge || !modalDriver || !modalTeam || !modalCircuit || !modalRarity || !rarityFill || !modalSummary || !closeModal) {
  if (!(calendarList || calendarSummary || standingsTableBody)) {
    console.warn('F1 tracker DOM not present on this page; tracker logic was skipped.');
  }
} else {
  const STORAGE_KEY = 'f1-card-tracker-owned';

  const ownedCards = new Set(loadOwnedCards());

  let cards = [...getCardCatalog(), ...getCustomCards()];

  const filters = ['All cards', 'Rare', 'Legend', 'Epic', 'Ultra', 'Ferrari', 'McLaren', 'Red Bull'];

  let selectedFilter = 'All cards';
  let selectedCard = cards[0];

  function updateCollectionSummary() {
    const collectionCard = document.querySelector('.stat-card:last-child strong');
    const ownedCount = ownedCards.size;
    const percent = Math.round((ownedCount / cards.length) * 100);

    if (collectionCard) {
      collectionCard.textContent = `${percent}%`;
    }

    if (collectionCount) {
      collectionCount.textContent = `${ownedCount} / ${cards.length} owned`;
    }

    if (collectionProgress) {
      collectionProgress.style.width = `${percent}%`;
    }
  }

  function renderFilters() {
    filtersContainer.innerHTML = filters
      .map(
        (filter) => `
          <button class="filter-btn ${filter === selectedFilter ? 'active' : ''}" data-filter="${filter}">
            ${filter}
          </button>
        `
      )
      .join('');

    filtersContainer.querySelectorAll('.filter-btn').forEach((button) => {
      button.addEventListener('click', () => {
        selectedFilter = button.dataset.filter;
        renderFilters();
        renderCards();
      });
    });
  }

  function renderStandings(rows = standings.slice(0, 5)) {
    if (!standingsList) return;

    standingsList.innerHTML = rows
      .slice(0, 5)
      .map(
        (driver) => `
          <div class="standing-row">
            <div class="standing-left">
              <span class="rank-badge">${driver.position}</span>
              <div>
                <p class="standing-name">${driver.driver}</p>
                <p class="standing-team">${driver.team}</p>
              </div>
            </div>
            <span class="standing-points">${driver.points} pts</span>
          </div>
        `
      )
      .join('');
  }

  function getTeamColor(team) {
    const teamColors = {
      'Red Bull': '#1d4ed8',
      'Ferrari': '#dc2626',
      'McLaren': '#f97316',
      'Mercedes': '#0ea5e9',
      'Aston Martin': '#10b981',
      'Alpine': '#3b82f6',
      'Williams': '#60a5fa',
      'RB': '#a855f7',
      'Haas': '#94a3b8',
      'Kick Sauber': '#facc15',
      'Alfa Romeo': '#f87171',
      'AlphaTauri': '#a78bfa',
    };

    return teamColors[team] || '#ef4444';
  }

  function getFilteredCards() {
    const query = searchInput.value.trim().toLowerCase();

    return cards.filter((card) => {
      const matchFilter =
        selectedFilter === 'All cards' ||
        card.badge === selectedFilter ||
        card.team === selectedFilter;

      const matchQuery =
        !query ||
        [card.title, card.driver, card.team, card.badge, card.circuit]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchFilter && matchQuery;
    });
  }

  function renderCards() {
    const visibleCards = getFilteredCards();

    if (!visibleCards.length) {
      cardsGrid.innerHTML = '<div class="empty-state">No cards match that filter.</div>';
      return;
    }

    cardsGrid.innerHTML = visibleCards
      .map((card) => {
        const isOwned = ownedCards.has(card.title);

        return `
          <article class="card" data-accent="${card.accent}">
            <div class="card-visual">
              <div class="card-topline">
                <span class="badge-pill">${card.badge}</span>
                <span class="card-points">${card.points}</span>
              </div>
              <div class="card-bar"></div>
            </div>
            <div class="card-body">
              <h4 class="card-title">${card.title}</h4>
              <p class="card-driver">${card.driver}</p>
              <div class="card-meta">
                <span class="card-team">${card.team}</span>
                <div class="card-actions">
                  <button class="owned-toggle ${isOwned ? 'owned' : ''}" data-title="${card.title}">${isOwned ? 'Owned' : 'Collect'}</button>
                  <button class="open-btn" data-title="${card.title}">Open</button>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    cardsGrid.querySelectorAll('.open-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const card = cards.find((item) => item.title === button.dataset.title);
        if (card) {
          selectedCard = card;
          openModal(card);
        }
      });
    });

    cardsGrid.querySelectorAll('.owned-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        const title = button.dataset.title;
        if (ownedCards.has(title)) {
          ownedCards.delete(title);
        } else {
          ownedCards.add(title);
        }

        saveOwnedCards(ownedCards);
        updateCollectionSummary();
        renderCards();
      });
    });
  }

  function openModal(card) {
    modalTitle.textContent = card.title;
    modalBadge.textContent = card.badge;
    modalDriver.textContent = card.driver;
    modalTeam.textContent = card.team;
    modalCircuit.textContent = card.circuit;
    modalRarity.textContent = `${card.rarity}%`;
    rarityFill.style.width = `${card.rarity}%`;
    modalSummary.textContent = card.summary;

    const toggleOwnedButton = document.getElementById('toggleOwnedBtn');
    if (toggleOwnedButton) {
      const isOwned = ownedCards.has(card.title);
      toggleOwnedButton.textContent = isOwned ? 'Remove from collection' : 'Add to collection';
      toggleOwnedButton.dataset.title = card.title;
      toggleOwnedButton.classList.toggle('owned', isOwned);
    }

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  const customCardModal = document.getElementById('customCardModal');
  const customCardForm = document.getElementById('customCardForm');
  const customCardButton = document.getElementById('customCardButton');

  if (customCardButton && customCardModal) {
    customCardButton.addEventListener('click', () => {
      customCardModal.classList.remove('hidden');
      customCardModal.setAttribute('aria-hidden', 'false');
    });
  }

  const closeCustomCardButton = document.querySelector('[data-close-custom-card]');
  if (closeCustomCardButton && customCardModal) {
    closeCustomCardButton.addEventListener('click', () => {
      customCardModal.classList.add('hidden');
      customCardModal.setAttribute('aria-hidden', 'true');
    });
  }

  if (customCardModal) {
    customCardModal.addEventListener('click', (event) => {
      if (event.target === customCardModal) {
        customCardModal.classList.add('hidden');
        customCardModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (customCardForm) {
    customCardForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const title = document.getElementById('customCardTitle').value.trim();
      const driver = document.getElementById('customCardDriver').value.trim();
      const team = document.getElementById('customCardTeam').value.trim();
      const circuit = document.getElementById('customCardCircuit').value.trim();
      const marketValue = document.getElementById('customCardValue').value.trim();
      const rarity = Number(document.getElementById('customCardRarity').value || 50);
      const description = document.getElementById('customCardDescription').value.trim();
      const message = document.getElementById('customCardMessage');

      if (!title || !driver || !team || !circuit || !marketValue) {
        if (message) {
          message.textContent = 'Please complete all required fields.';
          message.classList.add('error');
        }
        return;
      }

      const allCatalogCards = [...getCardCatalog(), ...getCustomCards()];
      const existingTitles = allCatalogCards.map((card) => card.title.toLowerCase());
      if (existingTitles.includes(title.toLowerCase())) {
        if (message) {
          message.textContent = 'You already have a card with that title.';
          message.classList.add('error');
        }
        return;
      }

      const customCard = {
        title,
        driver,
        team,
        badge: 'Custom',
        points: 'New',
        accent: team.toLowerCase().includes('ferrari') ? 'red' : team.toLowerCase().includes('mclaren') ? 'dark' : team.toLowerCase().includes('red bull') ? 'blue' : 'green',
        circuit,
        summary: description || 'A custom card added by the collector.',
        description: description || 'A custom card added by the collector.',
        rarity: Number.isFinite(rarity) ? Math.max(1, Math.min(100, rarity)) : 50,
        marketValue: marketValue.startsWith('$') ? marketValue : `$${marketValue}`,
      };

      const updatedCustomCards = [...getCustomCards(), customCard];
      saveCustomCards(updatedCustomCards);
      cards = [...getCardCatalog(), ...getCustomCards()];

      const ownedTitles = new Set(loadOwnedCards());
      ownedTitles.add(customCard.title);
      saveOwnedCards(ownedTitles);
      updateCollectionSummary();
      renderCards();

      if (document.getElementById('collectionList')) {
        renderCollectionPage();
      }

      customCardForm.reset();
      customCardModal.classList.add('hidden');
      customCardModal.setAttribute('aria-hidden', 'true');
      if (message) {
        message.textContent = '';
        message.classList.remove('error');
      }
    });
  }

  searchInput.addEventListener('input', () => {
    renderCards();
  });

  document.querySelectorAll('.nav-pill').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-pill').forEach((pill) => {
        pill.classList.toggle('active', pill === button);
      });
    });
  });

  const primaryBtn = document.querySelector('.primary-btn');
  const secondaryBtn = document.querySelector('.secondary-btn');
  const tinyBtn = document.querySelector('.tiny-btn');
  const cardsPanel = document.querySelector('.cards-panel');
  const standingsPanel = document.querySelector('.standings-panel');

  if (primaryBtn) {
    primaryBtn.addEventListener('click', () => {
      selectedFilter = 'All cards';
      renderFilters();
      renderCards();
      cardsPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (secondaryBtn) {
    secondaryBtn.addEventListener('click', () => {
      const targetPage = secondaryBtn.dataset.page || null;
      if (targetPage) {
        window.location.href = targetPage;
        return;
      }
      standingsPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (tinyBtn) {
    tinyBtn.addEventListener('click', () => {
      const targetPage = tinyBtn.dataset.page || null;
      if (targetPage) {
        window.location.href = targetPage;
        return;
      }
      cardsPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const modalActions = document.querySelector('.modal-body');
  if (modalActions && !document.getElementById('toggleOwnedBtn')) {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggleOwnedBtn';
    toggleButton.type = 'button';
    toggleButton.className = 'toggle-owned-btn';
    toggleButton.textContent = 'Add to collection';
    modalActions.appendChild(toggleButton);

    toggleButton.addEventListener('click', () => {
      const title = toggleButton.dataset.title;
      if (!title) return;

      if (ownedCards.has(title)) {
        ownedCards.delete(title);
      } else {
        ownedCards.add(title);
      }

      saveOwnedCards(ownedCards);
      updateCollectionSummary();
      renderCards();
      openModal(cards.find((card) => card.title === title) || selectedCard);
    });
  }

  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  updateCollectionSummary();
  renderFilters();
  renderStandings();
  renderCards();
}

if (standingsTableBody) {
  renderStandingsTable();
  fetchCurrentStandings();
  setInterval(fetchCurrentStandings, LIVE_REFRESH_MS);

  standingsSortButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sortKey = button.dataset.sort;
      const sortedRows = [...(standings.length ? standings : fallbackStandings)].sort((a, b) => {
        if (sortKey === 'points') {
          return b.points - a.points;
        }
        return a.position - b.position;
      });

      standingsSortButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      renderStandingsTable(sortedRows);
    });
  });
}

setupAuthButtons();

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const loginMessage = document.getElementById('loginMessage');
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    try {
      const result = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setCurrentUser(result.user);
      setAuthToken(result.token);
      window.location.href = 'index.html';
    } catch (error) {
      loginMessage.textContent = error.message || 'Invalid email or password.';
      loginMessage.classList.add('error');
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  const registerMessage = document.getElementById('registerMessage');
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (!name || !email || !password) {
      registerMessage.textContent = 'Please complete all fields.';
      registerMessage.classList.add('error');
      return;
    }

    if (password.length < 6) {
      registerMessage.textContent = 'Password must be at least 6 characters.';
      registerMessage.classList.add('error');
      return;
    }

    if (password !== confirmPassword) {
      registerMessage.textContent = 'Passwords do not match.';
      registerMessage.classList.add('error');
      return;
    }

    try {
      const result = await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      setCurrentUser(result.user);
      setAuthToken(result.token);
      window.location.href = 'profile.html';
    } catch (error) {
      registerMessage.textContent = error.message || 'Unable to register.';
      registerMessage.classList.add('error');
    }
  });
}

const profilePage = document.getElementById('profilePage');
if (profilePage) {
  const currentUser = getCurrentUser();
  const userName = document.getElementById('profileName');
  const userEmail = document.getElementById('profileEmail');
  const collectionCount = document.getElementById('profileCollectionCount');

  if (!currentUser || !currentUser.email) {
    window.location.href = 'login.html';
  } else {
    userName.textContent = currentUser.name || 'F1 Collector';
    userEmail.textContent = currentUser.email;

    const populateProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          const owned = await loadOwnedCards();
          collectionCount.textContent = `${owned.length} cards in your collection`;
          return;
        }

        const data = await apiRequest('/api/profile');
        collectionCount.textContent = `${data.cards.length} cards in your collection`;
      } catch {
        const owned = await loadOwnedCards();
        collectionCount.textContent = `${owned.length} cards in your collection`;
      }
    };

    populateProfile();
  }
}

async function renderCollectionPage() {
  const collectionList = document.getElementById('collectionList');
  const collectionEmpty = document.getElementById('collectionEmpty');
  const collectionTotal = document.getElementById('collectionTotal');
  const collectionValue = document.getElementById('collectionValue');

  if (!collectionList) return;

  const currentUser = getCurrentUser();
  const token = getAuthToken();
  let ownedTitles = new Set();

  try {
    if (token) {
      const data = await apiRequest('/api/collection');
      ownedTitles = new Set((data?.cards || []).map((card) => card.title));
    } else {
      ownedTitles = new Set(await loadOwnedCards());
    }
  } catch {
    ownedTitles = new Set(await loadOwnedCards());
  }

  const cards = [...getCardCatalog(), ...getCustomCards()];
  const userCards = cards.filter((card) => ownedTitles.has(card.title));

  if (collectionTotal) {
    collectionTotal.textContent = `${userCards.length} cards`;
  }

  if (collectionValue) {
    const totalValue = userCards.reduce((sum, card) => {
      const value = Number(String(card.marketValue).replace(/[$,]/g, '')) || 0;
      return sum + value;
    }, 0);
    collectionValue.textContent = `$${totalValue.toLocaleString()}`;
  }

  if (!currentUser || !currentUser.email) {
    collectionEmpty.textContent = 'Log in to view your F1 card collection.';
    collectionList.innerHTML = '';
    return;
  }

  if (!userCards.length) {
    collectionEmpty.textContent = 'You have not added any cards to your collection yet.';
    collectionList.innerHTML = '';
    return;
  }

  collectionEmpty.textContent = '';
  collectionList.innerHTML = userCards
    .map(
      (card) => `
        <article class="portfolio-card" data-accent="${card.accent}">
          <div class="portfolio-card-visual">
            <div class="portfolio-card-topline">
              <span class="badge-pill">${card.badge}</span>
              <span class="portfolio-card-value">${card.marketValue}</span>
            </div>
            <div class="portfolio-card-image-copy">
              <span class="portfolio-card-season">${card.team}</span>
              <strong>${card.circuit}</strong>
            </div>
          </div>

          <div class="portfolio-card-body">
            <div class="portfolio-card-header">
              <div>
                <p class="portfolio-card-driver">${card.driver}</p>
                <h3>${card.title}</h3>
              </div>
              <span class="portfolio-card-rarity">${card.rarity}%</span>
            </div>

            <div class="portfolio-card-meta">
              <span>${card.team}</span>
              <span>${card.points}</span>
            </div>

            <p class="portfolio-card-description">${card.description || card.summary}</p>
          </div>
        </article>
      `
    )
    .join('');
}

if (document.getElementById('collectionList')) {
  renderCollectionPage();
}

if (backToTopButton) {
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (nextRaceName || nextRaceLocation || nextRaceDate || nextRaceCountry || nextRaceFocus) {
  fetchCurrentNextRace();
  setInterval(fetchCurrentNextRace, 5 * 60 * 1000);
}
