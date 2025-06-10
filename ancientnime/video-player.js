/**
 * Advanced Video Player for AncientNime
 * Supports multiple streaming sources and formats
 */

class AdvancedVideoPlayer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentSource = null;
        this.isFullscreen = false;
        this.isPlaying = false;
        this.sources = [];
        this.isMobile = window.innerWidth <= 768;
        this.controlsTimeout = null;
        this.controlsVisible = true;

        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('Video player container not found');
            return;
        }
        
        this.createPlayerHTML();
        this.setupEventListeners();
    }
    
    createPlayerHTML() {
        this.container.innerHTML = `
            <div class="advanced-video-player">
                <div class="video-container">
                    <div class="video-wrapper">
                        <iframe id="videoFrame" 
                                class="video-iframe"
                                allowfullscreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                        </iframe>
                        <video id="videoElement" 
                               class="video-element" 
                               controls 
                               style="display: none;">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    
                    <div class="video-overlay" id="videoOverlay">
                        <div class="overlay-content">
                            <div class="loading-spinner">
                                <div class="spinner"></div>
                                <p>Loading video...</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="video-controls">
                        <div class="control-group left">
                            <button class="control-btn" id="playPauseBtn" title="Play/Pause">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="control-btn" id="refreshBtn" title="Refresh">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        
                        <div class="control-group center">
                            <div class="video-info">
                                <span id="videoTitle">Video Player</span>
                            </div>
                        </div>
                        
                        <div class="control-group right">
                            <button class="control-btn" id="qualityBtn" title="Quality">
                                <i class="fas fa-cog"></i>
                            </button>
                            <button class="control-btn" id="fullscreenBtn" title="Fullscreen">
                                <i class="fas fa-expand"></i>
                            </button>
                            <button class="control-btn" id="externalBtn" title="Open External">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="quality-menu" id="qualityMenu" style="display: none;">
                        <div class="quality-options">
                            <div class="quality-option" data-quality="auto">Auto</div>
                            <div class="quality-option" data-quality="1080p">1080p</div>
                            <div class="quality-option" data-quality="720p">720p</div>
                            <div class="quality-option" data-quality="480p">480p</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('playPauseBtn')?.addEventListener('click', () => {
            this.togglePlayPause();
            this.resetAutoHideTimer();
        });
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refresh();
            this.resetAutoHideTimer();
        });
        document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
            this.toggleFullscreen();
            this.resetAutoHideTimer();
        });
        document.getElementById('externalBtn')?.addEventListener('click', () => {
            this.openExternal();
            this.resetAutoHideTimer();
        });
        document.getElementById('qualityBtn')?.addEventListener('click', () => {
            this.toggleQualityMenu();
            this.resetAutoHideTimer();
        });

        // Quality menu
        document.querySelectorAll('.quality-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const quality = e.target.dataset.quality;
                this.changeQuality(quality);
            });
        });

        // Iframe load events
        const iframe = document.getElementById('videoFrame');
        if (iframe) {
            iframe.addEventListener('load', () => this.onVideoLoad());
            iframe.addEventListener('error', () => this.onVideoError());
        }

        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());

        // Mobile touch events for controls
        if (this.isMobile) {
            this.setupMobileControls();
        }

        // Window resize event
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            if (this.isMobile) {
                this.setupMobileControls();
            }
        });
    }
    
    loadVideo(sources, title = 'Video Player') {
        this.sources = Array.isArray(sources) ? sources : [sources];
        this.currentSource = this.sources[0];
        
        document.getElementById('videoTitle').textContent = title;
        this.showOverlay('Loading video...');
        
        this.tryLoadSource(0);
    }
    
    tryLoadSource(index) {
        if (index >= this.sources.length) {
            this.showError('No playable sources found');
            return;
        }
        
        const source = this.sources[index];
        console.log(`Trying source ${index + 1}:`, source);
        
        const iframe = document.getElementById('videoFrame');
        const video = document.getElementById('videoElement');
        
        if (this.isDirectVideo(source)) {
            // Use HTML5 video element for direct video files
            iframe.style.display = 'none';
            video.style.display = 'block';
            video.src = source;
            video.load();
            
            video.addEventListener('loadeddata', () => this.onVideoLoad(), { once: true });
            video.addEventListener('error', () => this.tryLoadSource(index + 1), { once: true });
        } else {
            // Use iframe for embedded players
            video.style.display = 'none';
            iframe.style.display = 'block';
            iframe.src = source;
            
            // Timeout fallback
            setTimeout(() => {
                if (this.isOverlayVisible()) {
                    this.tryLoadSource(index + 1);
                }
            }, 10000);
        }
    }
    
    isDirectVideo(url) {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
        return videoExtensions.some(ext => url.toLowerCase().includes(ext));
    }
    
    onVideoLoad() {
        console.log('Video loaded successfully');
        this.hideOverlay();
        this.isPlaying = true;
        this.updatePlayButton();

        // Start auto-hide for mobile
        if (this.isMobile) {
            this.startControlsAutoHide();
        }
    }
    
    onVideoError() {
        console.log('Video failed to load');
        this.showError('Failed to load video');
    }
    
    showOverlay(message) {
        const overlay = document.getElementById('videoOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.querySelector('p').textContent = message;
        }
    }
    
    hideOverlay() {
        const overlay = document.getElementById('videoOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    showError(message) {
        const overlay = document.getElementById('videoOverlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="overlay-content error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Video Error</h3>
                    <p>${message}</p>
                    <button class="retry-btn" onclick="videoPlayer.refresh()">
                        <i class="fas fa-sync-alt"></i> Try Again
                    </button>
                </div>
            `;
            overlay.style.display = 'flex';
        }
    }
    
    isOverlayVisible() {
        const overlay = document.getElementById('videoOverlay');
        return overlay && overlay.style.display !== 'none';
    }
    
    togglePlayPause() {
        const video = document.getElementById('videoElement');
        if (video.style.display !== 'none') {
            if (this.isPlaying) {
                video.pause();
                this.isPlaying = false;
            } else {
                video.play();
                this.isPlaying = true;
            }
            this.updatePlayButton();
        }
    }
    
    updatePlayButton() {
        const btn = document.getElementById('playPauseBtn');
        const icon = btn?.querySelector('i');
        if (icon) {
            icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }
    
    refresh() {
        this.showOverlay('Refreshing video...');
        this.tryLoadSource(0);
    }
    
    toggleFullscreen() {
        const container = this.container.querySelector('.video-container');
        
        if (!this.isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
        }
    }
    
    onFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
        
        const btn = document.getElementById('fullscreenBtn');
        const icon = btn?.querySelector('i');
        if (icon) {
            icon.className = this.isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
        }
    }
    
    openExternal() {
        if (this.currentSource) {
            window.open(this.currentSource, '_blank');
        }
    }
    
    toggleQualityMenu() {
        const menu = document.getElementById('qualityMenu');
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    changeQuality(quality) {
        console.log('Changing quality to:', quality);
        this.toggleQualityMenu();
        // Quality change logic would go here
        // For now, just refresh the video
        this.refresh();
    }

    setupMobileControls() {
        const videoContainer = this.container.querySelector('.video-container');
        if (!videoContainer) return;

        // Remove existing mobile event listeners
        videoContainer.removeEventListener('touchstart', this.handleMobileTouch);
        videoContainer.removeEventListener('touchend', this.handleMobileTouch);
        videoContainer.removeEventListener('click', this.handleMobileTouch);

        // Add mobile touch events
        this.handleMobileTouch = this.handleMobileTouch.bind(this);
        videoContainer.addEventListener('touchstart', this.handleMobileTouch);
        videoContainer.addEventListener('touchend', this.handleMobileTouch);
        videoContainer.addEventListener('click', this.handleMobileTouch);

        // Start auto-hide timer
        this.startControlsAutoHide();
    }

    handleMobileTouch(event) {
        // Don't prevent default for control buttons
        if (event.target.closest('.video-controls')) {
            return;
        }

        event.preventDefault();

        // Only handle tap on video area
        if (event.type === 'touchend' || event.type === 'click') {
            // Toggle controls visibility
            if (this.controlsVisible) {
                this.hideControls();
            } else {
                this.showControls();
            }
        }
    }

    showControls() {
        const videoContainer = this.container.querySelector('.video-container');
        if (videoContainer) {
            videoContainer.classList.remove('controls-hidden');
            videoContainer.classList.add('controls-visible');
            this.controlsVisible = true;

            // Start auto-hide timer
            this.startControlsAutoHide();
        }
    }

    hideControls() {
        const videoContainer = this.container.querySelector('.video-container');
        if (videoContainer) {
            videoContainer.classList.remove('controls-visible');
            videoContainer.classList.add('controls-hidden');
            this.controlsVisible = false;

            // Clear auto-hide timer
            this.clearControlsAutoHide();
        }
    }

    startControlsAutoHide() {
        if (!this.isMobile) return;

        this.clearControlsAutoHide();
        this.controlsTimeout = setTimeout(() => {
            this.hideControls();
        }, 3000); // Hide after 3 seconds
    }

    clearControlsAutoHide() {
        if (this.controlsTimeout) {
            clearTimeout(this.controlsTimeout);
            this.controlsTimeout = null;
        }
    }

    resetAutoHideTimer() {
        if (this.isMobile && this.controlsVisible) {
            this.startControlsAutoHide();
        }
    }
}

// Global video player instance
let videoPlayer = null;

// Initialize video player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Video player will be initialized when needed
    console.log('Video player module loaded');
});
