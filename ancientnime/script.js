// 🎯 ANCIENTNIME - CLEAN VERSION (NO ADULT CONTENT)
// Professional anime streaming platform

// Global Variables
const API_BASE = window.location.origin;
let currentPage = 1;
let currentSection = 'home';
let isLoading = false;

// DOM Elements
const loading = document.getElementById('loading');
const sections = document.querySelectorAll('.section');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    console.log('🌐 API Base URL:', API_BASE);
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🔗 Current URL:', window.location.href);

    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('📱 Is Mobile:', isMobile);

    // Network status monitoring for mobile
    if (isMobile) {
        setupNetworkMonitoring();
    }

    // Check if all required elements exist
    if (!loading) {
        console.error('Loading element not found');
        return;
    }

    setupEventListeners();
    loadHomeData();
});

// Setup Event Listeners
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            showSection(section);
        });
    });

    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const mobileSearchInput = document.getElementById('mobileSearchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => performSearch(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(searchInput.value);
        });
    }

    if (mobileSearchBtn && mobileSearchInput) {
        mobileSearchBtn.addEventListener('click', () => performSearch(mobileSearchInput.value));
        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(mobileSearchInput.value);
        });
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// Network Monitoring for Mobile
function setupNetworkMonitoring() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        console.log('📶 Network Info:', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
        });

        connection.addEventListener('change', () => {
            console.log('📶 Network changed:', connection.effectiveType);
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                showToast('⚠️ Koneksi lambat terdeteksi', 'warning');
            }
        });
    }

    // Online/Offline detection
    window.addEventListener('online', () => {
        showToast('✅ Koneksi internet kembali', 'success');
    });

    window.addEventListener('offline', () => {
        showToast('❌ Koneksi internet terputus', 'error');
    });
}

// Show Section
function showSection(sectionName) {
    console.log('🔄 Showing section:', sectionName);

    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        console.log('✅ Section switched to:', sectionName);

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load section data only if not animeDetail (detail pages handle their own data)
        if (sectionName !== 'animeDetail') {
            switch (sectionName) {
                case 'home':
                    loadHomeData();
                    break;
                case 'ongoing':
                    loadOngoingAnime();
                    break;
                case 'complete':
                    loadCompleteAnime();
                    break;
                case 'schedule':
                    loadSchedule();
                    break;
                case 'genres':
                    loadGenres();
                    break;
            }
        }
    } else {
        console.error('❌ Section not found:', sectionName);
    }
}

// Loading Functions
function showLoading(show = true) {
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
    isLoading = show;
}

// Home Data Loading
async function loadHomeData() {
    console.log('🔄 Loading home data...');
    showLoading(true);

    try {
        // Load ongoing anime for home
        await loadOngoingAnime(1, 'ongoingAnime');

        // Load complete anime for home
        await loadCompleteAnime(1, 'completeAnime');

        console.log('✅ Home data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading home data:', error);
        showToast('⚠️ Gagal memuat data beranda', 'error');
    } finally {
        showLoading(false);
    }
}

// Navigation Functions
function showOngoingPage() {
    showSection('ongoing');
}

function showCompletePage() {
    showSection('complete');
}

// Ongoing Anime
async function loadOngoingAnime(page = 1, containerId = null) {
    // Determine container based on current section
    if (!containerId) {
        containerId = currentSection === 'home' ? 'ongoingAnime' : 'ongoingList';
    }

    try {
        console.log(`🔄 Loading ongoing anime - Page: ${page}, Container: ${containerId}`);
        const response = await fetch(`${API_BASE}/api/ongoing/${page}`);
        console.log(`📡 Response status: ${response.status}`);

        const data = await response.json();
        console.log(`📊 Data received:`, data);

        if (data.status === 'success' && data.animeList) {
            console.log(`✅ Rendering ${data.animeList.length} ongoing anime to ${containerId}`);
            renderAnimeGrid(data.animeList, containerId);

            // Add pagination only for dedicated ongoing page
            if (containerId === 'ongoingList') {
                addPagination(page, 'ongoing', data.pagination);
            }
        } else {
            throw new Error('Failed to load ongoing anime');
        }
    } catch (error) {
        console.error('❌ Error loading ongoing anime:', error);
        showErrorMessage(containerId, 'Gagal memuat anime ongoing');
    }
}

// Complete Anime
async function loadCompleteAnime(page = 1, containerId = null) {
    // Determine container based on current section
    if (!containerId) {
        containerId = currentSection === 'home' ? 'completeAnime' : 'completeList';
    }

    try {
        console.log(`🔄 Loading complete anime - Page: ${page}, Container: ${containerId}`);
        const response = await fetch(`${API_BASE}/api/complete/${page}`);
        console.log(`📡 Response status: ${response.status}`);

        const data = await response.json();
        console.log(`📊 Data received:`, data);

        if (data.status === 'success' && data.animeList) {
            console.log(`✅ Rendering ${data.animeList.length} complete anime to ${containerId}`);
            renderAnimeGrid(data.animeList, containerId);

            // Add pagination only for dedicated complete page
            if (containerId === 'completeList') {
                addPagination(page, 'complete', data.pagination);
            }
        } else {
            throw new Error('Failed to load complete anime');
        }
    } catch (error) {
        console.error('❌ Error loading complete anime:', error);
        showErrorMessage(containerId, 'Gagal memuat anime complete');
    }
}

// Schedule
async function loadSchedule() {
    try {
        console.log('🔄 Loading schedule...');
        showLoading(true);
        const response = await fetch(`${API_BASE}/api/schedule`);
        const data = await response.json();
        console.log('📊 Schedule data received:', data);

        if (data.scheduleList) {
            renderSchedule(data.scheduleList);
        } else {
            throw new Error('Failed to load schedule');
        }
    } catch (error) {
        console.error('❌ Error loading schedule:', error);
        showErrorMessage('scheduleList', 'Gagal memuat jadwal anime');
    } finally {
        showLoading(false);
    }
}

// Genres
async function loadGenres() {
    try {
        console.log('🔄 Loading genres...');
        showLoading(true);
        const response = await fetch(`${API_BASE}/api/genres`);
        const data = await response.json();
        console.log('📊 Genres data received:', data);

        if (data.genreList) {
            renderGenres(data.genreList);
        } else {
            throw new Error('Failed to load genres');
        }
    } catch (error) {
        console.error('❌ Error loading genres:', error);
        showErrorMessage('genreList', 'Gagal memuat daftar genre');
    } finally {
        showLoading(false);
    }
}

// Search Function
async function performSearch(query) {
    if (!query || query.trim() === '') {
        showToast('⚠️ Masukkan kata kunci pencarian', 'warning');
        return;
    }

    console.log('Searching for:', query);
    showSection('searchResults');
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/search/${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.status === 'success' && data.search_results) {
            renderSearchResults(data.search_results, query);
        } else {
            throw new Error('No search results found');
        }
    } catch (error) {
        console.error('Error searching:', error);
        showErrorMessage('searchList', `Tidak ada hasil untuk "${query}"`);
    } finally {
        showLoading(false);
    }
}

// Render Functions
function renderAnimeGrid(animeList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!animeList || animeList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Tidak ada anime ditemukan</p>
            </div>
        `;
        return;
    }

    container.innerHTML = animeList.map(anime => {
        // Extract ID from link if id is not available
        let animeId = anime.id;
        if (!animeId && anime.link) {
            animeId = anime.link.split('/anime/')[1] || anime.link.split('/').pop();
        }

        return `
            <div class="anime-card" onclick="showAnimeDetail('${animeId}')">
                <img src="${anime.thumb || anime.image}"
                     alt="${anime.title}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/200x280/333/fff?text=No+Image'">
                <div class="anime-card-content">
                    <h4>${anime.title}</h4>
                    <div class="episode">${anime.episode || anime.status || 'Unknown'}</div>
                    <div class="rating">
                        ${anime.score ? `⭐ ${anime.score}` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderSchedule(scheduleData) {
    const container = document.getElementById('scheduleList');
    if (!container) return;

    if (!scheduleData || !Array.isArray(scheduleData)) {
        container.innerHTML = '<p>Tidak ada data jadwal tersedia</p>';
        return;
    }

    container.innerHTML = scheduleData.map(daySchedule => {
        return `
            <div class="schedule-day" style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
                <h3 style="color: #007bff; margin-bottom: 1rem; border-bottom: 2px solid #007bff; padding-bottom: 0.5rem;">
                    <i class="fas fa-calendar-day"></i> ${daySchedule.day}
                </h3>
                <div class="schedule-anime-list" style="display: grid; gap: 1rem;">
                    ${daySchedule.animeList && daySchedule.animeList.length > 0 ?
                        daySchedule.animeList.map(anime => `
                            <div class="schedule-anime-item" onclick="showAnimeDetail('${anime.id || anime.link.split('/anime/')[1]}')"
                                 style="background: white; padding: 1rem; border-radius: 8px; cursor: pointer; border: 1px solid #dee2e6; transition: all 0.3s ease;">
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="flex: 1;">
                                        <h4 style="color: #007bff; margin: 0 0 0.5rem 0; font-size: 0.9rem;">${anime.anime_name}</h4>
                                        <p style="color: #666; margin: 0; font-size: 0.8rem;"><i class="fas fa-play-circle"></i> Lihat Detail</p>
                                    </div>
                                </div>
                            </div>
                        `).join('') :
                        '<p style="color: #666; font-style: italic;">Tidak ada anime hari ini</p>'
                    }
                </div>
            </div>
        `;
    }).join('');
}

function renderGenres(genreList) {
    const container = document.getElementById('genreList');
    if (!container) return;

    container.innerHTML = genreList.map(genre => `
        <div class="genre-card" onclick="searchByGenre('${genre.id}')"
             style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 1.5rem; border-radius: 10px; cursor: pointer; text-align: center; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,123,255,0.3);">
            <h4 style="margin: 0; font-size: 1.1rem;">${genre.genre_name}</h4>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.9; font-size: 0.8rem;">
                <i class="fas fa-tags"></i> Explore Genre
            </p>
        </div>
    `).join('');
}

function renderSearchResults(results, query) {
    // Update header
    const header = document.querySelector('#searchResults h2');
    if (header) {
        header.textContent = `Hasil pencarian untuk "${query}" (${results.length} hasil)`;
    }

    // Render to correct container
    renderAnimeGrid(results, 'searchList');
}

// Utility Functions
function showErrorMessage(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #dc3545;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>${message}</p>
                <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; margin-top: 1rem; cursor: pointer;">
                    <i class="fas fa-redo"></i> Coba Lagi
                </button>
            </div>
        `;
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: ${type === 'warning' ? '#212529' : 'white'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Anime Detail Functions
async function showAnimeDetail(animeId) {
    console.log('🔄 Loading anime detail for:', animeId);

    if (!animeId) {
        console.error('❌ No anime ID provided');
        showToast('⚠️ ID anime tidak valid', 'error');
        return;
    }

    showLoading(true);

    try {
        const url = `${API_BASE}/api/anime/${encodeURIComponent(animeId)}`;
        console.log('📡 Fetching from URL:', url);

        const response = await fetch(url);
        console.log('📊 Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📊 Anime detail response:', data);

        if (data.status === 'success' && data.title) {
            console.log('✅ Rendering anime detail for:', data.title);
            renderAnimeDetail(data);
            showSection('animeDetail');
        } else {
            console.error('❌ Invalid response data:', data);
            throw new Error('Invalid anime data received');
        }
    } catch (error) {
        console.error('❌ Error loading anime detail:', error);
        showToast('⚠️ Gagal memuat detail anime: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function renderAnimeDetail(anime) {
    const detail = document.getElementById('animeDetail');
    if (!detail) {
        console.error('animeDetail element not found');
        return;
    }

    if (!anime || !anime.title) {
        console.error('Invalid anime data:', anime);
        detail.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>⚠️ Data anime tidak valid</h3>
                <button onclick="showSection('home')" style="background: #007bff; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; cursor: pointer; margin-top: 1rem;">
                    <i class="fas fa-arrow-left"></i> Kembali ke Beranda
                </button>
            </div>
        `;
        return;
    }

    detail.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <button onclick="showSection('home')" style="background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; margin-bottom: 1rem;">
                <i class="fas fa-arrow-left"></i> Kembali
            </button>
        </div>

        <h2>${anime.title}</h2>
        ${anime.japanase ? `<p style="color: #666; font-style: italic; margin-bottom: 2rem;">${anime.japanase}</p>` : ''}

        <div style="display: grid; grid-template-columns: 200px 1fr; gap: 2rem; margin: 2rem 0;">
            <div>
                <img src="${anime.thumb}"
                     alt="${anime.title}"
                     style="width: 100%; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            </div>
            <div>
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;">
                    <h4 style="color: #007bff; margin-bottom: 1rem;"><i class="fas fa-info-circle"></i> Informasi</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        ${anime.status ? `<div><strong>Status:</strong> ${anime.status}</div>` : ''}
                        ${anime.score ? `<div><strong>Rating:</strong> ⭐ ${anime.score}</div>` : ''}
                        ${anime.studio ? `<div><strong>Studio:</strong> ${anime.studio}</div>` : ''}
                        ${anime.duration ? `<div><strong>Durasi:</strong> ${anime.duration}</div>` : ''}
                        ${anime.type ? `<div><strong>Type:</strong> ${anime.type}</div>` : ''}
                        ${anime.total_episode ? `<div><strong>Total Episode:</strong> ${anime.total_episode}</div>` : ''}
                        ${anime.release_date ? `<div><strong>Release Date:</strong> ${anime.release_date}</div>` : ''}
                        ${anime.producer ? `<div><strong>Producer:</strong> ${anime.producer}</div>` : ''}
                    </div>
                </div>

                ${anime.genre_list && anime.genre_list.length > 0 ? `
                    <div style="margin-bottom: 1rem;">
                        <h4 style="color: #007bff; margin-bottom: 0.5rem;"><i class="fas fa-tags"></i> Genre</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${anime.genre_list.map(genre => `
                                <span style="background: #007bff; color: white; padding: 0.3rem 0.7rem; border-radius: 15px; font-size: 0.8rem;">
                                    ${genre.genre_name || genre}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>

        ${anime.episode_list && anime.episode_list.length > 0 ? `
            <div style="margin: 2rem 0;">
                <h3 style="color: #007bff; margin-bottom: 1rem;"><i class="fas fa-play"></i> Episode List (${anime.episode_list.length} Episodes)</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                    ${anime.episode_list.map(episode => `
                        <div class="episode-card" onclick="showEpisodeDetail('${episode.eps_id.replace('episode/', '')}')"
                             style="background: #f8f9fa; padding: 1rem; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.3s ease;">
                            <h4 style="color: #007bff; margin-bottom: 0.5rem; font-size: 0.9rem;">${episode.eps_name}</h4>
                            <p style="color: #666; font-size: 0.8rem; margin: 0;"><i class="fas fa-play-circle"></i> Tonton Episode</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        ${anime.batch_link && anime.batch_link.length > 0 && anime.batch_link[0].batch_name !== 'masih kosong' ? `
            <div style="margin: 2rem 0;">
                <h3 style="color: #007bff; margin-bottom: 1rem;"><i class="fas fa-download"></i> Batch Download</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                    ${anime.batch_link.map(batch => `
                        <div style="background: #e8f4fd; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #007bff;">
                            <h4 style="color: #007bff; margin-bottom: 1rem;">${batch.batch_name}</h4>
                            <a href="${batch.batch_link}" target="_blank"
                               style="background: #007bff; color: white; text-decoration: none; padding: 0.7rem 1.2rem; border-radius: 8px; display: inline-block;">
                                <i class="fas fa-download"></i> Download Batch
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

// Episode Detail
async function showEpisodeDetail(episodeId) {
    console.log('Loading episode detail for:', episodeId);
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/eps/${encodeURIComponent(episodeId)}`);
        const data = await response.json();
        console.log('Episode detail response:', data);

        if (data.status === 'success') {
            renderEpisodeDetail(data);
            showSection('animeDetail');
        } else {
            throw new Error('Failed to load episode detail');
        }
    } catch (error) {
        console.error('Error loading episode detail:', error);
        showToast('⚠️ Gagal memuat detail episode', 'error');
    } finally {
        showLoading(false);
    }
}

function renderEpisodeDetail(episode) {
    const detail = document.getElementById('animeDetail');
    if (!detail) return;

    detail.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <button onclick="showSection('home')" style="background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; margin-bottom: 1rem;">
                <i class="fas fa-arrow-left"></i> Kembali
            </button>
        </div>

        <h2>${episode.title}</h2>

        ${episode.link_stream ? `
            <div style="margin: 2rem 0;">
                <h3 style="color: #007bff; margin-bottom: 1rem;"><i class="fas fa-play"></i> Streaming Video</h3>
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;">
                    <iframe src="${episode.link_stream}"
                            style="width: 100%; height: 400px; border: none; border-radius: 8px;"
                            allowfullscreen>
                    </iframe>
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <a href="${episode.link_stream}" target="_blank"
                       style="background: #28a745; color: white; text-decoration: none; padding: 0.7rem 1.5rem; border-radius: 8px; display: inline-block;">
                        <i class="fas fa-external-link-alt"></i> Buka di Tab Baru
                    </a>
                </div>
            </div>
        ` : ''}

        ${episode.quality ? `
            <div style="margin: 2rem 0;">
                <h3 style="color: #007bff; margin-bottom: 1rem;"><i class="fas fa-download"></i> Download Links</h3>

                ${episode.quality.low_quality ? `
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid #ffc107;">
                        <h4 style="color: #ffc107; margin-bottom: 1rem;">
                            <i class="fas fa-video"></i> ${episode.quality.low_quality.quality} (${episode.quality.low_quality.size})
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                            ${episode.quality.low_quality.download_links.map(link => `
                                <a href="${link.link}" target="_blank"
                                   style="background: #ffc107; color: #212529; text-decoration: none; padding: 0.7rem 1rem; border-radius: 8px; text-align: center; font-weight: bold;">
                                    <i class="fas fa-download"></i> ${link.host}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${episode.quality.medium_quality ? `
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid #007bff;">
                        <h4 style="color: #007bff; margin-bottom: 1rem;">
                            <i class="fas fa-video"></i> ${episode.quality.medium_quality.quality} (${episode.quality.medium_quality.size})
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                            ${episode.quality.medium_quality.download_links.map(link => `
                                <a href="${link.link}" target="_blank"
                                   style="background: #007bff; color: white; text-decoration: none; padding: 0.7rem 1rem; border-radius: 8px; text-align: center; font-weight: bold;">
                                    <i class="fas fa-download"></i> ${link.host}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${episode.quality.high_quality ? `
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid #28a745;">
                        <h4 style="color: #28a745; margin-bottom: 1rem;">
                            <i class="fas fa-video"></i> ${episode.quality.high_quality.quality} (${episode.quality.high_quality.size})
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                            ${episode.quality.high_quality.download_links.map(link => `
                                <a href="${link.link}" target="_blank"
                                   style="background: #28a745; color: white; text-decoration: none; padding: 0.7rem 1rem; border-radius: 8px; text-align: center; font-weight: bold;">
                                    <i class="fas fa-download"></i> ${link.host}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        ` : ''}

        <div style="background: #e9ecef; padding: 1rem; border-radius: 8px; margin-top: 2rem;">
            <p style="margin: 0; color: #6c757d; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i>
                <strong>Tips:</strong> Jika streaming tidak berfungsi, coba buka di tab baru atau gunakan download links di atas.
            </p>
        </div>
    `;
}

// Pagination
function addPagination(currentPage, type, pagination) {
    const container = document.getElementById(`${type}Anime`);
    if (!container) return;

    // Remove existing pagination
    const existingPagination = container.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }

    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    paginationDiv.style.cssText = `
        grid-column: 1/-1;
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
        padding: 1rem;
    `;

    const prevBtn = currentPage > 1 ?
        `<button onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}Anime(${currentPage - 1})"
                 style="background: #007bff; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 5px; cursor: pointer;">
            <i class="fas fa-chevron-left"></i> Previous
         </button>` : '';

    const nextBtn = `<button onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}Anime(${currentPage + 1})"
                             style="background: #007bff; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 5px; cursor: pointer;">
                        Next <i class="fas fa-chevron-right"></i>
                     </button>`;

    const pageInfo = `<span style="background: #f8f9fa; padding: 0.7rem 1.2rem; border-radius: 5px; color: #333;">
                        Page ${currentPage}
                      </span>`;

    paginationDiv.innerHTML = `${prevBtn} ${pageInfo} ${nextBtn}`;
    container.appendChild(paginationDiv);
}

// Search by Genre
async function searchByGenre(genreId, page = 1) {
    console.log('🔍 Searching by genre:', genreId, 'page:', page);

    try {
        showLoading(true);
        showSection('searchResults');

        const response = await fetch(`${API_BASE}/api/genres/${encodeURIComponent(genreId)}/page/${page}`);
        const data = await response.json();
        console.log('📊 Genre search results:', data);

        if (data.status === 'success' && data.animeList) {
            const header = document.getElementById('searchResultsHeader');
            if (header) {
                header.textContent = `Genre: ${genreId.replace('/', '')} (${data.animeList.length} hasil)`;
            }
            renderAnimeGrid(data.animeList, 'searchResultsList');
        } else {
            throw new Error('No results found for this genre');
        }
    } catch (error) {
        console.error('❌ Error searching by genre:', error);
        showErrorMessage('searchResultsList', `Tidak ada hasil untuk genre "${genreId}"`);
    } finally {
        showLoading(false);
    }
}

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Link berhasil disalin!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('📋 Link berhasil disalin!', 'success');
    });
}
