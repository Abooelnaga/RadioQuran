const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

let currentlyPlaying = null;

document.addEventListener('play', function (e) {
    if (e.target.tagName.toLowerCase() === 'audio') {
        if (currentlyPlaying && currentlyPlaying !== e.target) {
            currentlyPlaying.pause();
        }
        currentlyPlaying = e.target;
    }
}, true);

// Radio stations functionality
async function loadAllStations() {
    const stationsGrid = document.getElementById('allStationsGrid');
    if (!stationsGrid) return;

    try {
        const response = await fetch('https://mp3quran.net/api/v3/radios');
        const data = await response.json();
        
        data.radios.forEach(station => {
            const stationCard = document.createElement('div');
            stationCard.className = 'station-card';
            stationCard.innerHTML = `
                <div class="station-content">
                    <h3>${station.name}</h3>
                    <audio controls>
                        <source src="${station.url}" type="audio/mpeg">
                    </audio>
                </div>
            `;
            stationsGrid.appendChild(stationCard);
        });

        // Setup search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const stations = stationsGrid.getElementsByClassName('station-card');
            
            Array.from(stations).forEach(station => {
                const stationName = station.querySelector('h3').textContent.toLowerCase();
                station.style.display = stationName.includes(searchTerm) ? 'block' : 'none';
            });
        });

    } catch (error) {
        console.error('Error loading stations:', error);
        stationsGrid.innerHTML = '<p class="error-message">عذراً، حدث خطأ في تحميل الإذاعات</p>';
    }
}

// Load stations when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadAllStations();
    // Add current year to copyright
    document.getElementById('year').textContent = new Date().getFullYear();
});

