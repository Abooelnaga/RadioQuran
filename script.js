const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

let currentlyPlaying = null;
let customPlayers = [];

// Custom Audio Player Class
class CustomAudioPlayer {
    constructor(playerElement) {
        this.playerElement = playerElement;
        this.audio = null;
        this.playBtn = playerElement.querySelector('.play-pause-btn');
        this.muteBtn = playerElement.querySelector('.mute-btn');
        this.statusElement = playerElement.querySelector('.status');
        this.isPlaying = false;
        this.isLoading = false;
        this.isMuted = false;
        this.volumeBeforeMute = 0.8;

        this.init();
    }

    init() {
        // Create audio element
        const audioSrc = this.playerElement.dataset.src;
        this.audio = new Audio();
        this.audio.src = audioSrc;
        this.audio.preload = 'none';

        // Set default volume
        this.audio.volume = 0.8;

        // Event listeners
        this.playBtn.addEventListener('click', () => this.togglePlay());
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // Audio events
        this.audio.addEventListener('loadstart', () => this.handleLoadStart());
        this.audio.addEventListener('canplay', () => this.handleCanPlay());
        this.audio.addEventListener('play', () => this.handlePlay());
        this.audio.addEventListener('pause', () => this.handlePause());
        this.audio.addEventListener('error', () => this.handleError());
        this.audio.addEventListener('waiting', () => this.handleWaiting());
        this.audio.addEventListener('playing', () => this.handlePlaying());
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        // Stop other players
        customPlayers.forEach(player => {
            if (player !== this && player.isPlaying) {
                player.pause();
            }
        });

        this.isLoading = true;
        this.playBtn.classList.add('loading');

        this.audio.play().catch((error) => {
            console.error('Error playing audio:', error);
            this.handleError();
        });
    }

    pause() {
        this.audio.pause();
    }

    toggleMute() {
        if (this.isMuted) {
            // إلغاء كتم الصوت
            this.audio.volume = this.volumeBeforeMute;
            this.isMuted = false;
            this.muteBtn.classList.remove('muted');
            this.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            // كتم الصوت
            this.volumeBeforeMute = this.audio.volume;
            this.audio.volume = 0;
            this.isMuted = true;
            this.muteBtn.classList.add('muted');
            this.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }

    handleLoadStart() {
        this.isLoading = true;
        this.playBtn.classList.add('loading');
    }

    handleCanPlay() {
        this.isLoading = false;
        this.playBtn.classList.remove('loading');
    }

    handlePlay() {
        this.isPlaying = true;
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.updateStatus('اضغط للتوقف');
        currentlyPlaying = this.audio;
    }

    handlePause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.updateStatus('اضغط للتشغيل');
        if (currentlyPlaying === this.audio) {
            currentlyPlaying = null;
        }
    }

    handleError() {
        this.isLoading = false;
        this.isPlaying = false;
        this.playBtn.classList.remove('loading');
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.updateStatus('اضغط للتشغيل');
    }

    handleWaiting() {
        this.isLoading = true;
        this.playBtn.classList.add('loading');
    }

    handlePlaying() {
        this.isLoading = false;
        this.playBtn.classList.remove('loading');
    }

    updateStatus(text) {
        if (this.statusElement) {
            this.statusElement.textContent = text;
        }
    }

}

// Initialize custom players
document.addEventListener('DOMContentLoaded', () => {
    const playerElements = document.querySelectorAll('.custom-audio-player');
    playerElements.forEach(element => {
        const player = new CustomAudioPlayer(element);
        customPlayers.push(player);
    });
});

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
                    <div class="custom-audio-player" data-src="${station.url}">
                        <button class="play-pause-btn">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="station-info">
                            <span class="station-name">${station.name}</span>
                            <span class="status">اضغط للتشغيل</span>
                        </div>
                        <button class="mute-btn">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                </div>
            `;
            stationsGrid.appendChild(stationCard);

            // Initialize custom player for this station
            const playerElement = stationCard.querySelector('.custom-audio-player');
            const player = new CustomAudioPlayer(playerElement);
            customPlayers.push(player);
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
