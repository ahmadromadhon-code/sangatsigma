document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const geminiBtn = document.getElementById('geminiBtn');
    const traceMoeBtn = document.getElementById('traceMoeBtn');
    const googleLensBtn = document.getElementById('googleLensBtn');
    const changeBtn = document.getElementById('changeBtn');
    const cropBtn = document.getElementById('cropBtn');

    // Sidebar elements
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    const historyBtn = document.getElementById('historyBtn');
    const favoritesBtn = document.getElementById('favoritesBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const exportBtn = document.getElementById('exportBtn');
    const historyBadge = document.getElementById('historyBadge');
    const favoritesBadge = document.getElementById('favoritesBadge');

    // Tab buttons
    const uploadTab = document.getElementById('uploadTab');
    const urlTab = document.getElementById('urlTab');
    const uploadContainer = document.getElementById('uploadContainer');
    const urlContainer = document.getElementById('urlContainer');
    const urlInput = document.getElementById('urlInput');
    const loadUrlBtn = document.getElementById('loadUrlBtn');

    // Result actions
    const favoriteBtn = document.getElementById('favoriteBtn');

    // Crop elements
    const cropControls = document.getElementById('cropControls');
    const cropCanvas = document.getElementById('cropCanvas');
    const cropOverlay = document.getElementById('cropOverlay');
    const cropSelection = document.getElementById('cropSelection');
    const applyCropBtn = document.getElementById('applyCropBtn');
    const resetCropBtn = document.getElementById('resetCropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loadingText');
    const results = document.getElementById('results');
    const resultsTitle = document.getElementById('resultsTitle');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    const newSearchBtn = document.getElementById('newSearchBtn');
    const apiBadge = document.getElementById('apiBadge');
    const confidenceBadge = document.getElementById('confidenceBadge');
    const videoBtn = document.getElementById('videoBtn');
    
    // Result elements
    const resultTitle = document.getElementById('resultTitle');
    const resultType = document.getElementById('resultType');
    const resultYear = document.getElementById('resultYear');
    const resultEpisodes = document.getElementById('resultEpisodes');
    const resultSynopsis = document.getElementById('resultSynopsis');
    const resultTags = document.getElementById('resultTags');
    
    let uploadedFile = null;
    let originalImage = null;
    let croppedImage = null;
    let cropState = {
        isActive: false,
        isDragging: false,
        isResizing: false,
        startX: 0,
        startY: 0,
        currentHandle: null,
        selection: { x: 0, y: 0, width: 0, height: 0 }
    };

    // Event Listeners
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    fileInput.addEventListener('change', handleFileSelect);
    geminiBtn.addEventListener('click', () => analyzeImage('gemini'));
    traceMoeBtn.addEventListener('click', () => analyzeImage('tracemoe'));
    googleLensBtn.addEventListener('click', searchWithGoogleLens);
    cropBtn.addEventListener('click', initializeCrop);
    changeBtn.addEventListener('click', resetUpload);
    tryAgainBtn.addEventListener('click', resetUpload);
    newSearchBtn.addEventListener('click', resetUpload);

    // Crop event listeners
    applyCropBtn.addEventListener('click', applyCrop);
    resetCropBtn.addEventListener('click', resetCrop);
    cancelCropBtn.addEventListener('click', cancelCrop);

    // Sidebar listeners
    hamburgerBtn.addEventListener('click', openSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    historyBtn.addEventListener('click', () => { showHistory(); closeSidebar(); });
    favoritesBtn.addEventListener('click', () => { showFavorites(); closeSidebar(); });
    settingsBtn.addEventListener('click', () => { showSettings(); closeSidebar(); });
    clearAllBtn.addEventListener('click', clearAllData);
    exportBtn.addEventListener('click', () => { exportData(); closeSidebar(); });

    // Tab listeners
    uploadTab.addEventListener('click', () => switchTab('upload'));
    urlTab.addEventListener('click', () => switchTab('url'));
    loadUrlBtn.addEventListener('click', loadImageFromUrl);

    // Result action listeners
    favoriteBtn.addEventListener('click', toggleFavorite);

    // Modal listeners
    document.getElementById('closeHistoryModal').addEventListener('click', () => closeModal('historyModal'));
    document.getElementById('closeFavoritesModal').addEventListener('click', () => closeModal('favoritesModal'));
    document.getElementById('closeSettingsModal').addEventListener('click', () => closeModal('settingsModal'));

    // Settings listeners
    document.getElementById('themeSelect').addEventListener('change', changeTheme);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    document.getElementById('clearFavoritesBtn').addEventListener('click', clearFavorites);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => document.getElementById('importFileInput').click());
    document.getElementById('importFileInput').addEventListener('change', importData);

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });

    // Functions
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#ff4757';
        uploadArea.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#333333';
        uploadArea.style.backgroundColor = 'transparent';
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        handleDragLeave(e);
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showError('Please select an image file (JPEG, PNG, etc.)');
            return;
        }
        
        // Validate image size
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showError('Image size should be less than 5MB');
            return;
        }
        
        uploadedFile = file;
        originalImage = file;
        croppedImage = null;

        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            uploadArea.classList.add('hidden');
            previewContainer.classList.remove('hidden');
            cropControls.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    function resetUpload() {
        fileInput.value = '';
        uploadedFile = null;
        originalImage = null;
        croppedImage = null;
        previewContainer.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        cropControls.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        results.classList.add('hidden');
        error.classList.add('hidden');
        videoBtn.classList.add('hidden');
        cropState.isActive = false;
    }

    // Crop functionality
    function initializeCrop() {
        if (!uploadedFile) return;

        cropControls.classList.remove('hidden');

        // Load image to canvas
        const img = new Image();
        img.onload = function() {
            const canvas = cropCanvas;
            const ctx = canvas.getContext('2d');

            // Calculate display size while maintaining aspect ratio
            const maxWidth = 600;
            const maxHeight = 400;
            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);

            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;

            // Draw image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Initialize crop selection (center 60% of image)
            const selectionWidth = canvas.width * 0.6;
            const selectionHeight = canvas.height * 0.6;
            const selectionX = (canvas.width - selectionWidth) / 2;
            const selectionY = (canvas.height - selectionHeight) / 2;

            cropState.selection = {
                x: selectionX,
                y: selectionY,
                width: selectionWidth,
                height: selectionHeight
            };

            updateCropSelection();
            setupCropInteraction();
            cropState.isActive = true;
        };

        // Get image source from preview
        const previewImg = imagePreview.querySelector('img');
        if (previewImg) {
            img.src = previewImg.src;
        }
    }

    function updateCropSelection() {
        const { x, y, width, height } = cropState.selection;
        const canvasRect = cropCanvas.getBoundingClientRect();
        const overlayRect = cropOverlay.getBoundingClientRect();

        // Calculate scale factors
        const scaleX = overlayRect.width / cropCanvas.width;
        const scaleY = overlayRect.height / cropCanvas.height;

        // Update selection position and size
        cropSelection.style.left = (x * scaleX) + 'px';
        cropSelection.style.top = (y * scaleY) + 'px';
        cropSelection.style.width = (width * scaleX) + 'px';
        cropSelection.style.height = (height * scaleY) + 'px';
    }

    function setupCropInteraction() {
        const handles = cropSelection.querySelectorAll('.crop-handle');

        // Handle dragging
        cropSelection.addEventListener('mousedown', startDrag);

        // Handle resizing
        handles.forEach(handle => {
            handle.addEventListener('mousedown', startResize);
        });

        // Global mouse events
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopDragResize);

        // Touch events for mobile
        cropSelection.addEventListener('touchstart', startDragTouch);
        handles.forEach(handle => {
            handle.addEventListener('touchstart', startResizeTouch);
        });
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', stopDragResize);
    }

    function startDrag(e) {
        if (e.target.classList.contains('crop-handle')) return;
        e.preventDefault();

        cropState.isDragging = true;
        const rect = cropOverlay.getBoundingClientRect();
        cropState.startX = e.clientX - rect.left - cropState.selection.x * (rect.width / cropCanvas.width);
        cropState.startY = e.clientY - rect.top - cropState.selection.y * (rect.height / cropCanvas.height);
    }

    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();

        cropState.isResizing = true;
        cropState.currentHandle = e.target.className.split(' ')[1]; // get handle position

        const rect = cropOverlay.getBoundingClientRect();
        cropState.startX = e.clientX - rect.left;
        cropState.startY = e.clientY - rect.top;
    }

    function handleMouseMove(e) {
        if (!cropState.isActive) return;

        const rect = cropOverlay.getBoundingClientRect();
        const scaleX = cropCanvas.width / rect.width;
        const scaleY = cropCanvas.height / rect.height;

        if (cropState.isDragging) {
            const newX = (e.clientX - rect.left - cropState.startX) * scaleX;
            const newY = (e.clientY - rect.top - cropState.startY) * scaleY;

            // Constrain to canvas bounds
            cropState.selection.x = Math.max(0, Math.min(newX, cropCanvas.width - cropState.selection.width));
            cropState.selection.y = Math.max(0, Math.min(newY, cropCanvas.height - cropState.selection.height));

            updateCropSelection();
        } else if (cropState.isResizing) {
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            resizeSelection(mouseX, mouseY);
            updateCropSelection();
        }
    }

    function resizeSelection(mouseX, mouseY) {
        const { x, y, width, height } = cropState.selection;
        const minSize = 50;

        switch (cropState.currentHandle) {
            case 'top-left':
                const newWidth1 = x + width - mouseX;
                const newHeight1 = y + height - mouseY;
                if (newWidth1 >= minSize && newHeight1 >= minSize && mouseX >= 0 && mouseY >= 0) {
                    cropState.selection.x = mouseX;
                    cropState.selection.y = mouseY;
                    cropState.selection.width = newWidth1;
                    cropState.selection.height = newHeight1;
                }
                break;

            case 'top-right':
                const newWidth2 = mouseX - x;
                const newHeight2 = y + height - mouseY;
                if (newWidth2 >= minSize && newHeight2 >= minSize && mouseX <= cropCanvas.width && mouseY >= 0) {
                    cropState.selection.y = mouseY;
                    cropState.selection.width = newWidth2;
                    cropState.selection.height = newHeight2;
                }
                break;

            case 'bottom-left':
                const newWidth3 = x + width - mouseX;
                const newHeight3 = mouseY - y;
                if (newWidth3 >= minSize && newHeight3 >= minSize && mouseX >= 0 && mouseY <= cropCanvas.height) {
                    cropState.selection.x = mouseX;
                    cropState.selection.width = newWidth3;
                    cropState.selection.height = newHeight3;
                }
                break;

            case 'bottom-right':
                const newWidth4 = mouseX - x;
                const newHeight4 = mouseY - y;
                if (newWidth4 >= minSize && newHeight4 >= minSize && mouseX <= cropCanvas.width && mouseY <= cropCanvas.height) {
                    cropState.selection.width = newWidth4;
                    cropState.selection.height = newHeight4;
                }
                break;
        }
    }

    function stopDragResize() {
        cropState.isDragging = false;
        cropState.isResizing = false;
        cropState.currentHandle = null;
    }

    // Touch event handlers
    function startDragTouch(e) {
        if (e.target.classList.contains('crop-handle')) return;
        e.preventDefault();

        const touch = e.touches[0];
        cropState.isDragging = true;
        const rect = cropOverlay.getBoundingClientRect();
        cropState.startX = touch.clientX - rect.left - cropState.selection.x * (rect.width / cropCanvas.width);
        cropState.startY = touch.clientY - rect.top - cropState.selection.y * (rect.height / cropCanvas.height);
    }

    function startResizeTouch(e) {
        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        cropState.isResizing = true;
        cropState.currentHandle = e.target.className.split(' ')[1];

        const rect = cropOverlay.getBoundingClientRect();
        cropState.startX = touch.clientX - rect.left;
        cropState.startY = touch.clientY - rect.top;
    }

    function handleTouchMove(e) {
        if (!cropState.isActive) return;
        e.preventDefault();

        const touch = e.touches[0];
        const rect = cropOverlay.getBoundingClientRect();
        const scaleX = cropCanvas.width / rect.width;
        const scaleY = cropCanvas.height / rect.height;

        if (cropState.isDragging) {
            const newX = (touch.clientX - rect.left - cropState.startX) * scaleX;
            const newY = (touch.clientY - rect.top - cropState.startY) * scaleY;

            cropState.selection.x = Math.max(0, Math.min(newX, cropCanvas.width - cropState.selection.width));
            cropState.selection.y = Math.max(0, Math.min(newY, cropCanvas.height - cropState.selection.height));

            updateCropSelection();
        } else if (cropState.isResizing) {
            const mouseX = (touch.clientX - rect.left) * scaleX;
            const mouseY = (touch.clientY - rect.top) * scaleY;

            resizeSelection(mouseX, mouseY);
            updateCropSelection();
        }
    }

    async function applyCrop() {
        if (!cropState.isActive) return;

        try {
            // Create cropped image
            const croppedBlob = await createCroppedImage();
            croppedImage = croppedBlob;
            uploadedFile = croppedBlob;

            // Update preview with cropped image
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.innerHTML = `<img src="${event.target.result}" alt="Cropped Preview">`;
                cropControls.classList.add('hidden');
                cropState.isActive = false;
            };
            reader.readAsDataURL(croppedBlob);

        } catch (error) {
            console.error('Error applying crop:', error);
            showError('Failed to apply crop. Please try again.');
        }
    }

    function resetCrop() {
        if (!originalImage) return;

        // Reset to original image
        uploadedFile = originalImage;
        croppedImage = null;

        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            cropControls.classList.add('hidden');
            cropState.isActive = false;
        };
        reader.readAsDataURL(originalImage);
    }

    function cancelCrop() {
        cropControls.classList.add('hidden');
        cropState.isActive = false;
    }

    async function createCroppedImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate actual crop coordinates
                const scaleX = img.width / cropCanvas.width;
                const scaleY = img.height / cropCanvas.height;

                const cropX = cropState.selection.x * scaleX;
                const cropY = cropState.selection.y * scaleY;
                const cropWidth = cropState.selection.width * scaleX;
                const cropHeight = cropState.selection.height * scaleY;

                // Set canvas size to crop size
                canvas.width = cropWidth;
                canvas.height = cropHeight;

                // Draw cropped portion
                ctx.drawImage(
                    img,
                    cropX, cropY, cropWidth, cropHeight,
                    0, 0, cropWidth, cropHeight
                );

                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create cropped image'));
                    }
                }, 'image/jpeg', 0.9);
            };

            img.onerror = () => reject(new Error('Failed to load image for cropping'));

            // Get original image source
            const previewImg = imagePreview.querySelector('img');
            if (previewImg) {
                img.src = previewImg.src;
            } else {
                reject(new Error('No image found to crop'));
            }
        });
    }

    // Sidebar functions
    function openSidebar() {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateSidebarBadges();
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateSidebarBadges() {
        const history = getSearchHistory();
        const favorites = getFavorites();

        historyBadge.textContent = history.length;
        favoritesBadge.textContent = favorites.length;

        // Hide badges if count is 0
        historyBadge.style.display = history.length > 0 ? 'block' : 'none';
        favoritesBadge.style.display = favorites.length > 0 ? 'block' : 'none';
    }

    function clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.removeItem('animeSearchHistory');
            localStorage.removeItem('animeFavorites');
            updateSidebarBadges();
            closeSidebar();
            alert('All data has been cleared successfully!');
        }
    }

    // Tab switching
    function switchTab(tab) {
        if (tab === 'upload') {
            uploadTab.classList.add('active');
            urlTab.classList.remove('active');
            uploadContainer.classList.remove('hidden');
            urlContainer.classList.add('hidden');
        } else {
            urlTab.classList.add('active');
            uploadTab.classList.remove('active');
            urlContainer.classList.remove('hidden');
            uploadContainer.classList.add('hidden');
        }
    }

    // Load image from URL
    async function loadImageFromUrl() {
        const url = urlInput.value.trim();
        if (!url) {
            showError('Please enter a valid image URL');
            return;
        }

        try {
            loadUrlBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            loadUrlBtn.disabled = true;

            // Fetch image and convert to blob
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load image from URL');
            }

            const blob = await response.blob();
            if (!blob.type.startsWith('image/')) {
                throw new Error('URL does not point to a valid image');
            }

            // Create file object
            const file = new File([blob], 'url-image.jpg', { type: blob.type });

            // Process like uploaded file
            displayImage(file);
            urlInput.value = '';
            switchTab('upload');

        } catch (error) {
            console.error('Error loading image from URL:', error);
            showError('Failed to load image from URL. Please check the URL and try again.');
        } finally {
            loadUrlBtn.innerHTML = '<i class="fas fa-download"></i> Load Image';
            loadUrlBtn.disabled = false;
        }
    }

    // Modal functions
    function showHistory() {
        const historyList = document.getElementById('historyList');
        const history = getSearchHistory();

        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No search history yet</p>
                    <small>Your recent searches will appear here</small>
                </div>
            `;
        } else {
            historyList.innerHTML = history.map(item => `
                <div class="history-item">
                    <div class="item-image">
                        <img src="${item.imageUrl}" alt="Search image">
                    </div>
                    <div class="item-info">
                        <h4 class="item-title">${item.title}</h4>
                        <div class="item-meta">
                            ${item.method} • ${new Date(item.timestamp).toLocaleDateString()}
                            ${item.confidence ? `• ${item.confidence} confidence` : ''}
                        </div>
                        <div class="item-actions">
                            <button class="item-btn" onclick="reloadSearch('${item.id}')">
                                <i class="fas fa-redo"></i> Search Again
                            </button>
                            <button class="item-btn favorite" onclick="addToFavorites('${item.id}')">
                                <i class="fas fa-heart"></i> Favorite
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('historyModal').classList.remove('hidden');
    }

    function showFavorites() {
        const favoritesList = document.getElementById('favoritesList');
        const favorites = getFavorites();

        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <p>No favorites yet</p>
                    <small>Save your favorite anime discoveries here</small>
                </div>
            `;
        } else {
            favoritesList.innerHTML = favorites.map(item => `
                <div class="favorite-item">
                    <div class="item-image">
                        <img src="${item.imageUrl || item.coverImage}" alt="${item.title}">
                    </div>
                    <div class="item-info">
                        <h4 class="item-title">${item.title}</h4>
                        <div class="item-meta">
                            ${item.type || 'Unknown'} • ${item.year || 'Unknown Year'}
                            ${item.episodes ? `• ${item.episodes} episodes` : ''}
                        </div>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.5rem 0;">
                            ${item.synopsis ? item.synopsis.substring(0, 100) + '...' : 'No synopsis available'}
                        </p>
                        <div class="item-actions">
                            <button class="item-btn" onclick="removeFavorite('${item.id}')">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('favoritesModal').classList.remove('hidden');
    }

    function showSettings() {
        // Load current settings
        const settings = getSettings();
        document.getElementById('themeSelect').value = settings.theme || 'dark';
        document.getElementById('defaultSearchSelect').value = settings.defaultSearch || 'enhanced';
        document.getElementById('autoSaveHistory').checked = settings.autoSaveHistory !== false;
        document.getElementById('showConfidence').checked = settings.showConfidence !== false;
        document.getElementById('smartAutoCrop').checked = settings.smartAutoCrop !== false;

        document.getElementById('settingsModal').classList.remove('hidden');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // Settings functions
    function changeTheme(e) {
        const theme = e.target.value;
        applyTheme(theme);
        saveSettings({ ...getSettings(), theme });
    }

    function applyTheme(theme) {
        const root = document.documentElement;

        if (theme === 'light') {
            root.style.setProperty('--primary', '#ffffff');
            root.style.setProperty('--secondary', '#f8f9fa');
            root.style.setProperty('--card-bg', '#ffffff');
            root.style.setProperty('--text-primary', '#212529');
            root.style.setProperty('--text-secondary', '#6c757d');
            root.style.setProperty('--border', '#dee2e6');
        } else if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
            return;
        } else {
            // Dark theme (default)
            root.style.setProperty('--primary', '#1a1a1a');
            root.style.setProperty('--secondary', '#2d2d2d');
            root.style.setProperty('--card-bg', '#3a3a3a');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#b0b0b0');
            root.style.setProperty('--border', '#4a4a4a');
        }
    }

    // Data management functions
    function getSearchHistory() {
        return JSON.parse(localStorage.getItem('animeSearchHistory') || '[]');
    }

    function saveToHistory(searchData) {
        const settings = getSettings();
        if (!settings.autoSaveHistory) return;

        const history = getSearchHistory();
        const historyItem = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...searchData
        };

        history.unshift(historyItem);

        // Keep only last 50 searches
        if (history.length > 50) {
            history.splice(50);
        }

        localStorage.setItem('animeSearchHistory', JSON.stringify(history));
        updateSidebarBadges();
    }

    function clearHistory() {
        localStorage.removeItem('animeSearchHistory');
        showHistory(); // Refresh display
    }

    function getFavorites() {
        return JSON.parse(localStorage.getItem('animeFavorites') || '[]');
    }

    function addToFavorites(data) {
        const favorites = getFavorites();
        const favoriteItem = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...data
        };

        // Check if already exists
        if (!favorites.find(fav => fav.title === data.title)) {
            favorites.unshift(favoriteItem);
            localStorage.setItem('animeFavorites', JSON.stringify(favorites));
            updateSidebarBadges();
            return true;
        }
        return false;
    }

    function removeFavorite(id) {
        const favorites = getFavorites();
        const filtered = favorites.filter(fav => fav.id !== id);
        localStorage.setItem('animeFavorites', JSON.stringify(filtered));
        showFavorites(); // Refresh display
    }

    function clearFavorites() {
        localStorage.removeItem('animeFavorites');
        showFavorites(); // Refresh display
    }

    function toggleFavorite() {
        const currentResult = getCurrentResult();
        if (!currentResult) return;

        const added = addToFavorites(currentResult);
        if (added) {
            favoriteBtn.classList.add('favorited');
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favorited';
            setTimeout(() => {
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
                favoriteBtn.classList.remove('favorited');
            }, 2000);
        }
    }

    function getCurrentResult() {
        // Extract current result data from DOM
        const title = document.getElementById('resultTitle').textContent;
        const synopsis = document.getElementById('resultSynopsis').textContent;
        const imageUrl = document.getElementById('resultAnimeImage').src;

        return {
            title,
            synopsis,
            imageUrl,
            type: document.getElementById('resultType').textContent.replace(/[^\w\s]/gi, '').trim(),
            year: document.getElementById('resultYear').textContent.replace(/[^\d]/g, ''),
            episodes: document.getElementById('resultEpisodes').textContent.replace(/[^\d]/g, '')
        };
    }

    function getSettings() {
        return JSON.parse(localStorage.getItem('animeSearchSettings') || '{}');
    }

    function saveSettings(settings) {
        localStorage.setItem('animeSearchSettings', JSON.stringify(settings));
    }

    function exportData() {
        const data = {
            history: getSearchHistory(),
            favorites: getFavorites(),
            settings: getSettings(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anime-search-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);

                if (data.history) {
                    localStorage.setItem('animeSearchHistory', JSON.stringify(data.history));
                }
                if (data.favorites) {
                    localStorage.setItem('animeFavorites', JSON.stringify(data.favorites));
                }
                if (data.settings) {
                    localStorage.setItem('animeSearchSettings', JSON.stringify(data.settings));
                    applyTheme(data.settings.theme || 'dark');
                }

                alert('Data imported successfully!');
                closeModal('settingsModal');

            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    // Initialize settings on page load
    document.addEventListener('DOMContentLoaded', () => {
        const settings = getSettings();
        applyTheme(settings.theme || 'dark');
        updateSidebarBadges();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC to close sidebar
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
        // Ctrl/Cmd + M to toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            if (sidebar.classList.contains('active')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        loading.classList.add('hidden');
        error.classList.remove('hidden');
    }

    async function analyzeImage(apiType, retryCount = 0) {
        if (!uploadedFile) return;

        previewContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        loading.classList.remove('hidden');

        const maxRetries = 2;

        try {
            let result;

            if (apiType === 'gemini') {
                loadingText.textContent = retryCount > 0
                    ? `Retrying Gemini AI analysis... (${retryCount + 1}/${maxRetries + 1})`
                    : "Preprocessing image for Gemini AI...";

                // Preprocess image for better accuracy
                const processedImage = await preprocessImage(uploadedFile);
                loadingText.textContent = "Analyzing with Gemini AI...";
                const base64Image = await getBase64(processedImage);
                result = await callGeminiAPI(base64Image);
                apiBadge.textContent = "Gemini AI";
                apiBadge.className = "api-badge gemini-badge";

                // Show confidence for Gemini if available
                if (result.geminiConfidence) {
                    confidenceBadge.textContent = `${result.geminiConfidence} confidence`;
                    confidenceBadge.classList.remove('hidden');
                    confidenceBadge.style.color = result.geminiConfidence === 'high' ? '#4bb543' :
                                                  result.geminiConfidence === 'medium' ? '#ffa500' : '#ff6b6b';
                } else {
                    confidenceBadge.classList.add('hidden');
                }

            } else {
                loadingText.textContent = retryCount > 0
                    ? `Retrying trace.moe search... (${retryCount + 1}/${maxRetries + 1})`
                    : "Preprocessing image for trace.moe...";

                // Preprocess image for better accuracy
                const processedImage = await preprocessImage(uploadedFile);
                loadingText.textContent = "Searching with trace.moe...";
                result = await callTraceMoeAPI(processedImage);
                apiBadge.textContent = "trace.moe";
                apiBadge.className = "api-badge tracemoe-badge";

                if (result.similarity) {
                    confidenceBadge.textContent = `${result.similarity} confidence`;
                    confidenceBadge.classList.remove('hidden');

                    // Enhanced confidence color coding
                    const similarityNum = parseFloat(result.similarity);
                    if (similarityNum >= 90) {
                        confidenceBadge.style.color = '#4bb543'; // Green for excellent
                    } else if (similarityNum >= 85) {
                        confidenceBadge.style.color = '#7cb342'; // Light green for good
                    } else if (similarityNum >= 75) {
                        confidenceBadge.style.color = '#ffa500'; // Orange for medium
                    } else {
                        confidenceBadge.style.color = '#ff6b6b'; // Red for low
                    }
                } else {
                    confidenceBadge.classList.add('hidden');
                }
            }

            // Check if result indicates failure and we should try fallback
            if ((result.isUnknown || result.isError || result.isLowConfidence) && retryCount === 0) {
                // Try the other API as fallback
                const fallbackApi = apiType === 'gemini' ? 'tracemoe' : 'gemini';

                loadingText.textContent = `Primary search inconclusive. Trying ${fallbackApi === 'gemini' ? 'Gemini AI' : 'trace.moe'} as fallback...`;

                try {
                    let fallbackResult;
                    if (fallbackApi === 'gemini') {
                        const base64Image = await getBase64(uploadedFile);
                        fallbackResult = await callGeminiAPI(base64Image);
                    } else {
                        fallbackResult = await callTraceMoeAPI(uploadedFile);
                    }

                    // If fallback gives better result, use it
                    if (!fallbackResult.isUnknown && !fallbackResult.isError && !fallbackResult.isLowConfidence) {
                        result = fallbackResult;
                        apiBadge.textContent = fallbackApi === 'gemini' ? "Gemini AI (Fallback)" : "trace.moe (Fallback)";
                        apiBadge.className = `api-badge ${fallbackApi === 'gemini' ? 'gemini' : 'tracemoe'}-badge`;
                    }
                } catch (fallbackError) {
                    console.warn('Fallback API also failed:', fallbackError);
                    // Continue with original result
                }
            }

            displayResults(result, apiType);

        } catch (err) {
            console.error('Error analyzing image:', err);

            // Retry logic
            if (retryCount < maxRetries && !err.message.includes('API limit')) {
                console.log(`Retrying... attempt ${retryCount + 1}`);
                setTimeout(() => {
                    analyzeImage(apiType, retryCount + 1);
                }, 1000 * (retryCount + 1)); // Exponential backoff
                return;
            }

            showError(err.message || 'Failed to analyze image after multiple attempts. Please try again.');
        }
    }

    async function searchWithGoogleLens() {
        if (!uploadedFile) return;

        previewContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        loading.classList.remove('hidden');
        loadingText.textContent = "Initializing multi-source search...";

        try {
            // Use multiple preprocessing techniques for better accuracy
            let processedImage = await preprocessImage(uploadedFile);

            // Smart auto-crop if enabled
            const settings = getSettings();
            if (settings.smartAutoCrop !== false) {
                loadingText.textContent = "Analyzing image regions for optimal cropping...";
                processedImage = await smartAutoCrop(processedImage);
                console.log('✅ Smart auto-crop completed');
            }

            const enhancedImage = await enhanceImageForAnime(processedImage);

            // Try multiple APIs in parallel for speed
            loadingText.textContent = "Analyzing with multiple AI systems...";

            const searchPromises = [];

            // 1. Enhanced Gemini with better prompting
            searchPromises.push(
                (async () => {
                    try {
                        const base64Image = await getBase64(enhancedImage);
                        return await callEnhancedGeminiAPI(base64Image);
                    } catch (error) {
                        console.warn('Enhanced Gemini failed:', error);
                        return null;
                    }
                })()
            );

            // 2. trace.moe with enhanced image
            searchPromises.push(
                (async () => {
                    try {
                        return await callTraceMoeAPI(enhancedImage);
                    } catch (error) {
                        console.warn('trace.moe failed:', error);
                        return null;
                    }
                })()
            );

            // 3. Backup Gemini with original image
            searchPromises.push(
                (async () => {
                    try {
                        const base64Image = await getBase64(processedImage);
                        return await callGeminiAPI(base64Image);
                    } catch (error) {
                        console.warn('Backup Gemini failed:', error);
                        return null;
                    }
                })()
            );

            loadingText.textContent = "Processing results from multiple sources...";
            const [enhancedGeminiResult, traceMoeResult, backupGeminiResult] = await Promise.all(searchPromises);

            // Smart result combination logic
            let finalResult = null;
            let confidenceScore = 0;
            let resultSource = "";

            // Score each result based on confidence and completeness
            const results = [
                { data: enhancedGeminiResult, source: "Enhanced AI", weight: 3 },
                { data: traceMoeResult, source: "Scene Database", weight: 2 },
                { data: backupGeminiResult, source: "Backup AI", weight: 1 }
            ].filter(r => r.data && !r.data.isUnknown && !r.data.isError);

            if (results.length === 0) {
                // All methods failed
                finalResult = {
                    title: "Multi-Source Search - No Match Found",
                    synopsis: "Advanced search using multiple AI systems and databases could not identify this anime.",
                    isUnknown: true,
                    isEnhancedSearch: true,
                    searchMethod: "Multi-Source Analysis",
                    suggestions: [
                        "This might be from a very new, obscure, or regional anime",
                        "Try a different screenshot with main characters clearly visible",
                        "Ensure the image is from actual anime (not fan art, manga, or game)",
                        "Consider cropping to focus on distinctive character features",
                        "Try searching for specific visual elements manually"
                    ]
                };
            } else if (results.length === 1) {
                // Only one method succeeded
                finalResult = {
                    ...results[0].data,
                    isEnhancedSearch: true,
                    searchMethod: `${results[0].source} (Single Match)`,
                    confidence: results[0].data.confidence || results[0].data.geminiConfidence || "medium"
                };
            } else {
                // Multiple methods succeeded - find best match
                let bestResult = null;
                let bestScore = 0;

                for (const result of results) {
                    let score = result.weight;

                    // Boost score based on confidence
                    if (result.data.confidence === 'high' || result.data.geminiConfidence === 'high') {
                        score += 3;
                    } else if (result.data.confidence === 'medium' || result.data.geminiConfidence === 'medium') {
                        score += 1;
                    }

                    // Boost score if has similarity percentage
                    if (result.data.similarity) {
                        const simNum = parseFloat(result.data.similarity);
                        if (simNum >= 90) score += 3;
                        else if (simNum >= 85) score += 2;
                        else if (simNum >= 75) score += 1;
                    }

                    // Boost score if has complete information
                    if (result.data.title && result.data.synopsis && result.data.year) {
                        score += 1;
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        bestResult = result;
                    }
                }

                // Combine best result with additional info from other sources
                finalResult = { ...bestResult.data };

                // Add trace.moe specific data if available
                const traceMoeData = results.find(r => r.source === "Scene Database")?.data;
                if (traceMoeData && !finalResult.similarity) {
                    finalResult.similarity = traceMoeData.similarity;
                    finalResult.videoUrl = traceMoeData.videoUrl;
                    finalResult.episode = traceMoeData.episode;
                    finalResult.timestamp = traceMoeData.timestamp;
                }

                // Add enhanced metadata
                finalResult.isEnhancedSearch = true;
                finalResult.searchMethod = `Multi-Source: ${bestResult.source} + ${results.length - 1} others`;
                finalResult.sourcesUsed = results.map(r => r.source);

                // Cross-validate title consistency
                const titles = results.map(r => r.data.title?.toLowerCase()).filter(Boolean);
                const uniqueTitles = [...new Set(titles)];

                if (uniqueTitles.length > 1) {
                    finalResult.alternativeMatches = results
                        .filter(r => r.data.title?.toLowerCase() !== finalResult.title?.toLowerCase())
                        .map(r => ({ title: r.data.title, source: r.source }));
                }
            }

            // ===== MULTI-DATABASE ENHANCEMENT =====
            if (finalResult && !finalResult.isUnknown && finalResult.title) {
                console.log('🔍 Enhancing result with multi-database search...');
                loadingText.textContent = "Enhancing with multiple anime databases...";

                try {
                    const enhancedData = await searchMultipleDatabases(finalResult.title);

                    if (enhancedData) {
                        console.log('✅ Multi-database enhancement successful');

                        // Merge the enhanced data with original result
                        finalResult = {
                            ...finalResult,
                            // Keep original identification data
                            originalConfidence: finalResult.confidence || finalResult.geminiConfidence || finalResult.similarity,
                            originalSource: finalResult.searchMethod,
                            // Enhanced metadata from databases
                            synopsis: enhancedData.synopsis || finalResult.synopsis,
                            genres: enhancedData.genres || finalResult.tags || [],
                            score: enhancedData.score,
                            studios: enhancedData.studios || [],
                            alternativeTitles: enhancedData.alternativeTitles || [],
                            coverImage: enhancedData.coverImage || finalResult.coverImage,
                            // Database info
                            dataSources: enhancedData.dataSources,
                            isEnhanced: true,
                            searchMethod: `Enhanced Multi-Source + ${enhancedData.searchMethod}`,
                            // Additional metadata
                            japaneseTitle: enhancedData.japaneseTitle || finalResult.japaneseTitle,
                            year: enhancedData.year || finalResult.year,
                            episodes: enhancedData.episodes || finalResult.episodes,
                            type: enhancedData.type || finalResult.type,
                            status: enhancedData.status,
                            source_material: enhancedData.source_material
                        };

                        loadingText.textContent = `Enhanced with ${enhancedData.dataSources?.length || 0} databases...`;
                    } else {
                        console.log('⚠️ Multi-database enhancement failed, using original result');
                    }
                } catch (dbError) {
                    console.warn('⚠️ Database enhancement failed:', dbError);
                }
            }

            // Set badge for enhanced search
            apiBadge.textContent = finalResult.isEnhanced ? "Enhanced Multi-DB Search" : "Enhanced Search";
            apiBadge.className = "api-badge googlelens-badge";

            // Show confidence if available
            if (finalResult.similarity) {
                confidenceBadge.textContent = `${finalResult.similarity} confidence`;
                confidenceBadge.classList.remove('hidden');
                const similarityNum = parseFloat(finalResult.similarity);
                confidenceBadge.style.color = similarityNum >= 85 ? '#4bb543' :
                                              similarityNum >= 75 ? '#ffa500' : '#ff6b6b';
            } else if (finalResult.geminiConfidence) {
                confidenceBadge.textContent = `${finalResult.geminiConfidence} confidence`;
                confidenceBadge.classList.remove('hidden');
                confidenceBadge.style.color = finalResult.geminiConfidence === 'high' ? '#4bb543' :
                                              finalResult.geminiConfidence === 'medium' ? '#ffa500' : '#ff6b6b';
            } else {
                confidenceBadge.classList.add('hidden');
            }

            displayResults(finalResult, 'enhanced');

        } catch (err) {
            console.error('Error with enhanced search:', err);
            showError('Enhanced search failed. Please try individual search methods.');
        }
    }

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    // Enhanced image preprocessing for better accuracy
    async function preprocessImage(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = function() {
                // Optimal size for API processing (balance between quality and speed)
                const maxSize = 1024;
                let { width, height } = img;

                // Resize if too large
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // Apply image enhancements
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw the image
                ctx.drawImage(img, 0, 0, width, height);

                // Optional: Apply contrast enhancement for anime images
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;

                // Slight contrast enhancement (helps with anime detection)
                const contrast = 1.1;
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));     // Red
                    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // Green
                    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // Blue
                }

                ctx.putImageData(imageData, 0, 0);

                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to process image'));
                    }
                }, 'image/jpeg', 0.9);
            };

            img.onerror = () => reject(new Error('Failed to load image for processing'));
            img.src = URL.createObjectURL(file);
        });
    }

    // ===== ADVANCED SCENE ANALYSIS & CHARACTER DETECTION =====

    // Advanced anime-specific image enhancement with scene analysis
    async function enhanceImageForAnime(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original image
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Advanced anime-specific enhancements
                enhanceAnimeFeatures(data, canvas.width, canvas.height);

                ctx.putImageData(imageData, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to enhance image'));
                    }
                }, 'image/jpeg', 0.95);
            };

            img.onerror = () => reject(new Error('Failed to load image for enhancement'));
            img.src = URL.createObjectURL(file);
        });
    }

    // Enhanced anime feature detection and enhancement
    function enhanceAnimeFeatures(data, width, height) {
        // Pass 1: Detect and enhance anime-style features
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Detect skin tones (important for character identification)
            if (isAnimeSkinTone(r, g, b)) {
                // Enhance skin tone clarity
                data[i] = Math.min(255, r * 1.1);
                data[i + 1] = Math.min(255, g * 1.05);
                data[i + 2] = Math.min(255, b * 0.95);
            }

            // Detect and enhance hair colors (distinctive anime feature)
            if (isAnimeHairColor(r, g, b)) {
                // Boost saturation for distinctive hair colors
                const saturationBoost = 1.3;
                const [h, s, l] = rgbToHsl(r, g, b);
                const [newR, newG, newB] = hslToRgb(h, Math.min(1, s * saturationBoost), l);
                data[i] = newR;
                data[i + 1] = newG;
                data[i + 2] = newB;
            }

            // Detect and enhance eye colors (critical for character ID)
            if (isAnimeEyeColor(r, g, b)) {
                // Enhance eye color vibrancy
                const vibrancyBoost = 1.4;
                data[i] = Math.min(255, r * vibrancyBoost);
                data[i + 1] = Math.min(255, g * vibrancyBoost);
                data[i + 2] = Math.min(255, b * vibrancyBoost);
            }
        }

        // Pass 2: Edge enhancement for character outlines
        enhanceAnimeOutlines(data, width, height);

        // Pass 3: Color space optimization for anime detection
        optimizeAnimeColorSpace(data);
    }

    // Detect anime-style skin tones
    function isAnimeSkinTone(r, g, b) {
        // Anime skin tones typically have specific RGB ranges
        const skinToneRanges = [
            // Light skin tones
            { rMin: 220, rMax: 255, gMin: 180, gMax: 220, bMin: 160, bMax: 200 },
            // Medium skin tones
            { rMin: 180, rMax: 220, gMin: 140, gMax: 180, bMin: 120, bMax: 160 },
            // Tan skin tones
            { rMin: 140, rMax: 180, gMin: 100, gMax: 140, bMin: 80, bMax: 120 }
        ];

        return skinToneRanges.some(range =>
            r >= range.rMin && r <= range.rMax &&
            g >= range.gMin && g <= range.gMax &&
            b >= range.bMin && b <= range.bMax
        );
    }

    // Detect distinctive anime hair colors
    function isAnimeHairColor(r, g, b) {
        // Common anime hair colors that are distinctive
        const hairColors = [
            // Bright/unnatural colors common in anime
            { r: [200, 255], g: [0, 100], b: [0, 100] },    // Red/Pink
            { r: [0, 100], g: [0, 100], b: [200, 255] },    // Blue
            { r: [0, 100], g: [200, 255], b: [0, 100] },    // Green
            { r: [200, 255], g: [200, 255], b: [0, 100] },  // Yellow/Blonde
            { r: [150, 255], g: [0, 150], b: [150, 255] },  // Purple/Violet
        ];

        return hairColors.some(color =>
            r >= color.r[0] && r <= color.r[1] &&
            g >= color.g[0] && g <= color.g[1] &&
            b >= color.b[0] && b <= color.b[1]
        );
    }

    // Detect anime eye colors
    function isAnimeEyeColor(r, g, b) {
        // Anime eyes often have very saturated, bright colors
        const saturation = getSaturation(r, g, b);
        const brightness = getBrightness(r, g, b);

        // High saturation + medium to high brightness = likely anime eyes
        return saturation > 0.6 && brightness > 0.3 && brightness < 0.9;
    }

    // Enhanced outline detection for anime characters
    function enhanceAnimeOutlines(data, width, height) {
        const tempData = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                // Sobel edge detection for anime-style outlines
                const gx = getSobelX(tempData, x, y, width);
                const gy = getSobelY(tempData, x, y, width);
                const magnitude = Math.sqrt(gx * gx + gy * gy);

                // If edge detected, enhance contrast
                if (magnitude > 30) {
                    const factor = 1.2;
                    data[idx] = Math.min(255, data[idx] * factor);
                    data[idx + 1] = Math.min(255, data[idx + 1] * factor);
                    data[idx + 2] = Math.min(255, data[idx + 2] * factor);
                }
            }
        }
    }

    // Optimize color space for anime detection
    function optimizeAnimeColorSpace(data) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Enhance contrast in mid-tones (where anime details are)
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

            if (luminance > 50 && luminance < 200) {
                const contrastFactor = 1.15;
                const pivot = 128;

                data[i] = Math.min(255, Math.max(0, (r - pivot) * contrastFactor + pivot));
                data[i + 1] = Math.min(255, Math.max(0, (g - pivot) * contrastFactor + pivot));
                data[i + 2] = Math.min(255, Math.max(0, (b - pivot) * contrastFactor + pivot));
            }
        }
    }

    // Utility functions for color analysis
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, l];
    }

    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function getSaturation(r, g, b) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        return max === 0 ? 0 : diff / max;
    }

    function getBrightness(r, g, b) {
        return Math.max(r, g, b) / 255;
    }

    function getSobelX(data, x, y, width) {
        const kernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const idx = ((y + ky) * width + (x + kx)) * 4;
                const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                sum += gray * kernel[ky + 1][kx + 1];
            }
        }
        return sum;
    }

    function getSobelY(data, x, y, width) {
        const kernel = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const idx = ((y + ky) * width + (x + kx)) * 4;
                const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                sum += gray * kernel[ky + 1][kx + 1];
            }
        }
        return sum;
    }

    // ===== SMART AUTO-CROP & SCENE ANALYSIS =====

    // Analyze image to find the most important region for anime identification
    async function analyzeImageRegions(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const regions = findImportantRegions(imageData);

                resolve(regions);
            };

            img.onerror = () => reject(new Error('Failed to load image for analysis'));
            img.src = URL.createObjectURL(file);
        });
    }

    // Find regions with high anime character density
    function findImportantRegions(imageData) {
        const { data, width, height } = imageData;
        const regionSize = 64; // 64x64 pixel regions
        const regions = [];

        // Analyze image in overlapping regions
        for (let y = 0; y < height - regionSize; y += regionSize / 2) {
            for (let x = 0; x < width - regionSize; x += regionSize / 2) {
                const score = analyzeRegion(data, x, y, regionSize, width, height);
                regions.push({
                    x, y,
                    width: Math.min(regionSize, width - x),
                    height: Math.min(regionSize, height - y),
                    score
                });
            }
        }

        // Sort by importance score
        regions.sort((a, b) => b.score - a.score);
        return regions;
    }

    // Analyze a specific region for anime character features
    function analyzeRegion(data, startX, startY, regionSize, imageWidth, imageHeight) {
        let score = 0;
        let pixelCount = 0;

        const endX = Math.min(startX + regionSize, imageWidth);
        const endY = Math.min(startY + regionSize, imageHeight);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const idx = (y * imageWidth + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                pixelCount++;

                // Score based on anime-specific features

                // 1. Skin tone detection (high importance for character identification)
                if (isAnimeSkinTone(r, g, b)) {
                    score += 10;
                }

                // 2. Distinctive hair colors
                if (isAnimeHairColor(r, g, b)) {
                    score += 8;
                }

                // 3. Bright eye colors
                if (isAnimeEyeColor(r, g, b)) {
                    score += 12; // Eyes are most important for character ID
                }

                // 4. High contrast edges (character outlines)
                if (x > startX && x < endX - 1 && y > startY && y < endY - 1) {
                    const edgeStrength = calculateEdgeStrength(data, x, y, imageWidth);
                    if (edgeStrength > 30) {
                        score += 3;
                    }
                }

                // 5. Color diversity (indicates detailed character features)
                const saturation = getSaturation(r, g, b);
                if (saturation > 0.4) {
                    score += 1;
                }
            }
        }

        // Normalize score by region size
        return pixelCount > 0 ? score / pixelCount : 0;
    }

    // Calculate edge strength at a specific pixel
    function calculateEdgeStrength(data, x, y, width) {
        const idx = (y * width + x) * 4;
        const current = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

        let maxDiff = 0;

        // Check surrounding pixels
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;

                const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
                const neighbor = 0.299 * data[neighborIdx] + 0.587 * data[neighborIdx + 1] + 0.114 * data[neighborIdx + 2];
                const diff = Math.abs(current - neighbor);
                maxDiff = Math.max(maxDiff, diff);
            }
        }

        return maxDiff;
    }

    // Smart auto-crop based on scene analysis
    async function smartAutoCrop(file) {
        try {
            console.log('🎯 Performing smart auto-crop analysis...');

            const regions = await analyzeImageRegions(file);

            if (regions.length === 0) {
                console.log('⚠️ No regions found, using original image');
                return file;
            }

            // Find the best region or combine multiple high-scoring regions
            const bestRegions = regions.slice(0, 3).filter(r => r.score > 2);

            if (bestRegions.length === 0) {
                console.log('⚠️ No high-quality regions found, using original image');
                return file;
            }

            // If we have multiple good regions, find the bounding box that contains them
            let cropRegion;
            if (bestRegions.length > 1) {
                cropRegion = findBoundingBox(bestRegions);
            } else {
                cropRegion = bestRegions[0];
                // Expand the region slightly for context
                cropRegion = expandRegion(cropRegion, file);
            }

            console.log('✅ Smart crop region found:', cropRegion);

            // Create cropped image
            const croppedImage = await createSmartCrop(file, cropRegion);
            return croppedImage;

        } catch (error) {
            console.warn('⚠️ Smart auto-crop failed:', error);
            return file; // Return original if auto-crop fails
        }
    }

    // Find bounding box that contains multiple regions
    function findBoundingBox(regions) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        regions.forEach(region => {
            minX = Math.min(minX, region.x);
            minY = Math.min(minY, region.y);
            maxX = Math.max(maxX, region.x + region.width);
            maxY = Math.max(maxY, region.y + region.height);
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    // Expand region for better context
    function expandRegion(region, file) {
        // Add 20% padding around the region
        const padding = 0.2;
        const expandX = region.width * padding;
        const expandY = region.height * padding;

        return {
            x: Math.max(0, region.x - expandX),
            y: Math.max(0, region.y - expandY),
            width: Math.min(file.width || 1000, region.width + expandX * 2),
            height: Math.min(file.height || 1000, region.height + expandY * 2)
        };
    }

    // Create cropped image from region
    async function createSmartCrop(file, region) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = function() {
                // Ensure crop region is within image bounds
                const cropX = Math.max(0, Math.min(region.x, img.width - 1));
                const cropY = Math.max(0, Math.min(region.y, img.height - 1));
                const cropWidth = Math.min(region.width, img.width - cropX);
                const cropHeight = Math.min(region.height, img.height - cropY);

                canvas.width = cropWidth;
                canvas.height = cropHeight;

                // Draw cropped portion
                ctx.drawImage(
                    img,
                    cropX, cropY, cropWidth, cropHeight,
                    0, 0, cropWidth, cropHeight
                );

                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create smart crop'));
                    }
                }, 'image/jpeg', 0.9);
            };

            img.onerror = () => reject(new Error('Failed to load image for smart crop'));
            img.src = URL.createObjectURL(file);
        });
    }

    async function callGeminiAPI(base64Image) {
        const API_KEY = 'AIzaSyBVssIJ4Dh-OUXSw-qHY0NS_GPh9ND5Gok';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: `Analyze this anime image carefully and provide detailed information. Look for:
                        - Character designs, art style, and visual elements
                        - Any text or logos visible in the image
                        - Scene composition and background details
                        - Animation quality and studio characteristics

                        Provide your analysis in this exact JSON format (no additional text):
                        {
                            "title": "Exact anime title in English",
                            "japaneseTitle": "Japanese title if known",
                            "type": "TV/Movie/OVA/Special",
                            "year": "Release year",
                            "episodes": "Number of episodes",
                            "synopsis": "Brief description",
                            "tags": ["genre1", "genre2", "genre3"],
                            "confidence": "high/medium/low",
                            "reasoning": "Why you think this is the anime"
                        }

                        If you cannot identify the anime with reasonable confidence, set title to "Unidentified" and explain in reasoning.`
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image
                        }
                    }
                ]
            }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Gemini API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;

            try {
                // More robust JSON parsing
                let jsonString = textResponse.trim();

                // Remove markdown code blocks if present
                if (jsonString.startsWith('```json')) {
                    jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonString.startsWith('```')) {
                    jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
                }

                // Find JSON object boundaries more carefully
                const jsonStart = jsonString.indexOf('{');
                const jsonEnd = jsonString.lastIndexOf('}');

                if (jsonStart === -1 || jsonEnd === -1) {
                    throw new Error('No valid JSON found in response');
                }

                jsonString = jsonString.slice(jsonStart, jsonEnd + 1);
                const result = JSON.parse(jsonString);

                // Enhanced validation - more flexible
                if (!result.title) {
                    throw new Error('No title found in response');
                }

                // Don't reject if title contains "unknown" - let user decide
                if (result.title.toLowerCase() === 'unidentified' ||
                    result.title.toLowerCase() === 'unknown' ||
                    result.title.toLowerCase().includes('cannot identify')) {

                    return {
                        title: "Could not identify anime",
                        synopsis: result.reasoning || "The image could not be identified with sufficient confidence.",
                        confidence: "low",
                        isUnknown: true,
                        suggestions: [
                            "Try a clearer image with main characters visible",
                            "Ensure the image is from an actual anime scene",
                            "Try a different frame or screenshot",
                            "Consider using trace.moe for scene-based matching"
                        ]
                    };
                }

                // Add confidence indicator
                result.geminiConfidence = result.confidence || "medium";
                return result;

            } catch (e) {
                console.warn('Failed to parse JSON response:', e);
                console.log('Raw response:', textResponse);

                // Fallback: try to extract basic info from text
                return {
                    title: "Parsing Error",
                    synopsis: "Could not parse the AI response properly. Raw response: " + textResponse.substring(0, 200) + "...",
                    isError: true
                };
            }

        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    // ===== MULTIPLE DATABASE INTEGRATION =====

    // Enhanced multi-database search system
    async function searchMultipleDatabases(title) {
        console.log(`🔍 Searching multiple databases for: "${title}"`);

        const searchPromises = [
            searchAniListByTitle(title),
            searchMyAnimeListByTitle(title),
            searchKitsuByTitle(title),
            searchJikanByTitle(title)
        ];

        try {
            const results = await Promise.allSettled(searchPromises);

            const databases = {
                anilist: results[0].status === 'fulfilled' ? results[0].value : [],
                mal: results[1].status === 'fulfilled' ? results[1].value : [],
                kitsu: results[2].status === 'fulfilled' ? results[2].value : [],
                jikan: results[3].status === 'fulfilled' ? results[3].value : []
            };

            console.log('📊 Database search results:', databases);

            // Combine and rank results
            return combineAndRankResults(databases, title);

        } catch (error) {
            console.error('❌ Multi-database search failed:', error);
            return null;
        }
    }

    // AniList search for additional metadata
    async function searchAniListByTitle(title) {
        const query = `
            query ($search: String) {
                Page(page: 1, perPage: 5) {
                    media(search: $search, type: ANIME) {
                        id
                        title {
                            romaji
                            english
                            native
                        }
                        format
                        status
                        startDate {
                            year
                        }
                        episodes
                        duration
                        genres
                        averageScore
                        popularity
                        description
                        coverImage {
                            large
                        }
                        studios {
                            nodes {
                                name
                            }
                        }
                        synonyms
                        meanScore
                        source
                    }
                }
            }
        `;

        try {
            const response = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    variables: { search: title }
                })
            });

            const data = await response.json();
            const results = data.data?.Page?.media || [];

            return results.map(anime => ({
                source: 'AniList',
                id: anime.id,
                title: anime.title.english || anime.title.romaji,
                japaneseTitle: anime.title.native,
                alternativeTitles: anime.synonyms || [],
                type: formatAnimeType(anime.format),
                year: anime.startDate?.year,
                episodes: anime.episodes,
                synopsis: cleanAnilistDescription(anime.description),
                genres: anime.genres || [],
                score: anime.averageScore ? anime.averageScore / 10 : null,
                popularity: anime.popularity,
                coverImage: anime.coverImage?.large,
                studios: anime.studios?.nodes?.map(s => s.name) || [],
                status: anime.status,
                source_material: anime.source
            }));
        } catch (error) {
            console.warn('🔴 AniList search failed:', error);
            return [];
        }
    }

    // MyAnimeList search via Jikan API
    async function searchMyAnimeListByTitle(title) {
        try {
            const encodedTitle = encodeURIComponent(title);
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodedTitle}&limit=5`);

            if (!response.ok) {
                throw new Error(`MAL API Error: ${response.status}`);
            }

            const data = await response.json();
            const results = data.data || [];

            return results.map(anime => ({
                source: 'MyAnimeList',
                id: anime.mal_id,
                title: anime.title,
                japaneseTitle: anime.title_japanese,
                alternativeTitles: [
                    ...(anime.title_synonyms || []),
                    anime.title_english
                ].filter(Boolean),
                type: anime.type,
                year: anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null,
                episodes: anime.episodes,
                synopsis: anime.synopsis,
                genres: anime.genres?.map(g => g.name) || [],
                score: anime.score,
                popularity: anime.popularity,
                coverImage: anime.images?.jpg?.large_image_url,
                studios: anime.studios?.map(s => s.name) || [],
                status: anime.status,
                source_material: anime.source,
                rating: anime.rating,
                duration: anime.duration
            }));
        } catch (error) {
            console.warn('🔴 MyAnimeList search failed:', error);
            return [];
        }
    }

    // Kitsu search
    async function searchKitsuByTitle(title) {
        try {
            const encodedTitle = encodeURIComponent(title);
            const response = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodedTitle}&page[limit]=5`);

            if (!response.ok) {
                throw new Error(`Kitsu API Error: ${response.status}`);
            }

            const data = await response.json();
            const results = data.data || [];

            return results.map(anime => {
                const attr = anime.attributes;
                return {
                    source: 'Kitsu',
                    id: anime.id,
                    title: attr.canonicalTitle,
                    japaneseTitle: attr.titles?.ja_jp,
                    alternativeTitles: Object.values(attr.titles || {}).filter(Boolean),
                    type: attr.showType,
                    year: attr.startDate ? new Date(attr.startDate).getFullYear() : null,
                    episodes: attr.episodeCount,
                    synopsis: attr.synopsis,
                    genres: [], // Kitsu requires separate API call for genres
                    score: attr.averageRating ? parseFloat(attr.averageRating) / 10 : null,
                    popularity: attr.popularityRank,
                    coverImage: attr.posterImage?.large,
                    studios: [], // Kitsu requires separate API call for studios
                    status: attr.status,
                    rating: attr.ageRating
                };
            });
        } catch (error) {
            console.warn('🔴 Kitsu search failed:', error);
            return [];
        }
    }

    // Jikan API (alternative MAL access)
    async function searchJikanByTitle(title) {
        try {
            const encodedTitle = encodeURIComponent(title);
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodedTitle}&order_by=popularity&sort=asc&limit=3`);

            if (!response.ok) {
                throw new Error(`Jikan API Error: ${response.status}`);
            }

            const data = await response.json();
            const results = data.data || [];

            return results.map(anime => ({
                source: 'Jikan',
                id: anime.mal_id,
                title: anime.title,
                japaneseTitle: anime.title_japanese,
                alternativeTitles: anime.title_synonyms || [],
                type: anime.type,
                year: anime.year,
                episodes: anime.episodes,
                synopsis: anime.synopsis,
                genres: anime.genres?.map(g => g.name) || [],
                score: anime.score,
                popularity: anime.popularity,
                coverImage: anime.images?.jpg?.large_image_url,
                studios: anime.studios?.map(s => s.name) || [],
                status: anime.status,
                source_material: anime.source
            }));
        } catch (error) {
            console.warn('🔴 Jikan search failed:', error);
            return [];
        }
    }

    // ===== RESULT COMBINATION AND RANKING =====

    function combineAndRankResults(databases, searchTitle) {
        console.log('🔄 Combining and ranking results from multiple databases...');

        // Collect all results
        const allResults = [];

        Object.entries(databases).forEach(([source, results]) => {
            results.forEach(result => {
                allResults.push({
                    ...result,
                    database: source,
                    matchScore: calculateMatchScore(result, searchTitle)
                });
            });
        });

        if (allResults.length === 0) {
            return null;
        }

        // Group by title similarity
        const groupedResults = groupSimilarTitles(allResults);

        // Find best match group
        const bestGroup = groupedResults.reduce((best, current) => {
            const bestScore = Math.max(...best.map(r => r.matchScore));
            const currentScore = Math.max(...current.map(r => r.matchScore));
            return currentScore > bestScore ? current : best;
        });

        // Merge data from best group
        const mergedResult = mergeAnimeData(bestGroup);

        console.log('✅ Best combined result:', mergedResult);
        return mergedResult;
    }

    function calculateMatchScore(result, searchTitle) {
        let score = 0;
        const searchLower = searchTitle.toLowerCase();

        // Title match (highest weight)
        if (result.title && result.title.toLowerCase().includes(searchLower)) {
            score += 50;
        }

        // Exact title match
        if (result.title && result.title.toLowerCase() === searchLower) {
            score += 30;
        }

        // Japanese title match
        if (result.japaneseTitle && result.japaneseTitle.toLowerCase().includes(searchLower)) {
            score += 40;
        }

        // Alternative titles match
        if (result.alternativeTitles) {
            const altMatch = result.alternativeTitles.some(alt =>
                alt && alt.toLowerCase().includes(searchLower)
            );
            if (altMatch) score += 35;
        }

        // Database reliability bonus
        const dbBonus = {
            'AniList': 10,
            'MyAnimeList': 15,
            'Jikan': 12,
            'Kitsu': 8
        };
        score += dbBonus[result.source] || 0;

        // Popularity/score bonus
        if (result.score && result.score > 7) score += 5;
        if (result.popularity && result.popularity < 1000) score += 5;

        return score;
    }

    function groupSimilarTitles(results) {
        const groups = [];

        results.forEach(result => {
            let addedToGroup = false;

            for (let group of groups) {
                if (isSimilarTitle(result, group[0])) {
                    group.push(result);
                    addedToGroup = true;
                    break;
                }
            }

            if (!addedToGroup) {
                groups.push([result]);
            }
        });

        return groups;
    }

    function isSimilarTitle(result1, result2) {
        const normalize = (str) => str ? str.toLowerCase().replace(/[^\w\s]/g, '').trim() : '';

        const title1 = normalize(result1.title);
        const title2 = normalize(result2.title);

        // Check if titles are similar (allowing for minor differences)
        if (title1 === title2) return true;
        if (title1.includes(title2) || title2.includes(title1)) return true;

        // Check Japanese titles
        const jp1 = normalize(result1.japaneseTitle);
        const jp2 = normalize(result2.japaneseTitle);
        if (jp1 && jp2 && (jp1 === jp2 || jp1.includes(jp2) || jp2.includes(jp1))) return true;

        // Check alternative titles
        const allTitles1 = [title1, jp1, ...(result1.alternativeTitles || []).map(normalize)];
        const allTitles2 = [title2, jp2, ...(result2.alternativeTitles || []).map(normalize)];

        return allTitles1.some(t1 => allTitles2.some(t2 => t1 && t2 && (t1 === t2 || t1.includes(t2) || t2.includes(t1))));
    }

    function mergeAnimeData(results) {
        // Sort by match score and database priority
        const sorted = results.sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;

            const priority = { 'MyAnimeList': 4, 'AniList': 3, 'Jikan': 2, 'Kitsu': 1 };
            return (priority[b.source] || 0) - (priority[a.source] || 0);
        });

        const primary = sorted[0];
        const merged = { ...primary };

        // Merge data from other sources
        sorted.slice(1).forEach(result => {
            // Use better synopsis if available
            if (!merged.synopsis || merged.synopsis.length < 100) {
                if (result.synopsis && result.synopsis.length > merged.synopsis?.length) {
                    merged.synopsis = result.synopsis;
                }
            }

            // Merge genres
            if (result.genres && result.genres.length > 0) {
                merged.genres = [...new Set([...(merged.genres || []), ...result.genres])];
            }

            // Use better cover image
            if (!merged.coverImage && result.coverImage) {
                merged.coverImage = result.coverImage;
            }

            // Merge studios
            if (result.studios && result.studios.length > 0) {
                merged.studios = [...new Set([...(merged.studios || []), ...result.studios])];
            }

            // Use higher score if available
            if (!merged.score && result.score) {
                merged.score = result.score;
            }

            // Merge alternative titles
            if (result.alternativeTitles) {
                merged.alternativeTitles = [...new Set([
                    ...(merged.alternativeTitles || []),
                    ...result.alternativeTitles
                ])];
            }
        });

        // Add database sources info
        merged.dataSources = sorted.map(r => r.source);
        merged.isEnhanced = true;
        merged.searchMethod = `Multi-Database Search (${merged.dataSources.join(', ')})`;

        return merged;
    }

    // Enhanced Gemini API with specialized anime prompting
    async function callEnhancedGeminiAPI(base64Image) {
        const API_KEY = 'AIzaSyBVssIJ4Dh-OUXSw-qHY0NS_GPh9ND5Gok';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: `You are an expert anime identification specialist. Analyze this image with extreme precision using these techniques:

                        VISUAL ANALYSIS CHECKLIST:
                        1. CHARACTER FEATURES: Hair color/style, eye color/shape, facial features, clothing/uniforms
                        2. ART STYLE: Animation studio characteristics, color palette, line art style
                        3. SETTING: Background elements, architecture, time period indicators
                        4. TEXT/LOGOS: Any visible Japanese text, studio logos, or title cards
                        5. SCENE CONTEXT: Action happening, character expressions, scene composition

                        IDENTIFICATION PROCESS:
                        - First identify the most distinctive visual elements
                        - Match art style to known animation studios
                        - Cross-reference character designs with popular anime
                        - Consider release timeframe based on animation quality
                        - Look for unique visual signatures or iconic scenes

                        CONFIDENCE LEVELS:
                        - HIGH: Distinctive characters/scenes from popular anime
                        - MEDIUM: Recognizable art style but less certain about specific title
                        - LOW: Generic anime style or insufficient distinctive features

                        Provide analysis in this EXACT JSON format:
                        {
                            "title": "Exact anime title (English preferred)",
                            "japaneseTitle": "Original Japanese title if known",
                            "alternativeTitles": ["alt1", "alt2"],
                            "type": "TV/Movie/OVA/Special/ONA",
                            "year": "Release year or range",
                            "episodes": "Episode count",
                            "studio": "Animation studio",
                            "synopsis": "Brief but detailed description",
                            "tags": ["genre1", "genre2", "genre3", "genre4", "genre5"],
                            "confidence": "high/medium/low",
                            "reasoning": "Detailed explanation of identification process",
                            "visualElements": ["key visual features that led to identification"],
                            "similarAnime": ["anime with similar art style if uncertain"]
                        }

                        If uncertain, set title to "Uncertain" and provide detailed reasoning with similar anime suggestions.`
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image
                        }
                    }
                ]
            }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Enhanced Gemini API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;

            try {
                // More robust JSON parsing
                let jsonString = textResponse.trim();

                // Remove markdown code blocks if present
                if (jsonString.startsWith('```json')) {
                    jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonString.startsWith('```')) {
                    jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
                }

                // Find JSON object boundaries more carefully
                const jsonStart = jsonString.indexOf('{');
                const jsonEnd = jsonString.lastIndexOf('}');

                if (jsonStart === -1 || jsonEnd === -1) {
                    throw new Error('No valid JSON found in enhanced response');
                }

                jsonString = jsonString.slice(jsonStart, jsonEnd + 1);
                const result = JSON.parse(jsonString);

                // Enhanced validation
                if (!result.title) {
                    throw new Error('No title found in enhanced response');
                }

                // Handle uncertain results
                if (result.title.toLowerCase() === 'uncertain' ||
                    result.title.toLowerCase() === 'unknown' ||
                    result.confidence === 'low') {

                    return {
                        title: "Enhanced AI Analysis - Uncertain",
                        synopsis: result.reasoning || "Could not identify with high confidence.",
                        confidence: result.confidence || "low",
                        isUnknown: true,
                        visualElements: result.visualElements || [],
                        similarAnime: result.similarAnime || [],
                        suggestions: [
                            "Try a different frame with clearer character details",
                            "Ensure the image shows main characters prominently",
                            "Consider if this might be from a less popular or very new anime",
                            ...(result.similarAnime || []).map(anime => `Check if this might be: ${anime}`)
                        ]
                    };
                }

                // Add enhanced confidence and metadata
                result.geminiConfidence = result.confidence || "medium";
                result.isEnhanced = true;
                result.analysisMethod = "Enhanced AI Analysis";

                return result;

            } catch (e) {
                console.warn('Failed to parse enhanced JSON response:', e);
                console.log('Raw enhanced response:', textResponse);

                // Fallback: try to extract basic info from text
                return {
                    title: "Enhanced Parsing Error",
                    synopsis: "Could not parse the enhanced AI response. Raw response: " + textResponse.substring(0, 300) + "...",
                    isError: true,
                    isEnhanced: true
                };
            }

        } catch (error) {
            console.error('Enhanced Gemini API error:', error);
            throw error;
        }
    }

    async function callTraceMoeAPI(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            // First try with normal search
            let response = await fetch('https://api.trace.moe/search?cutBorders=1', {
                method: 'POST',
                body: formData
            });

            // Handle rate limits
            if (response.status === 429) {
                throw new Error('API limit reached. Please wait a minute and try again.');
            }

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("trace.moe raw response:", data);

            // No results found
            if (!data.result || data.result.length === 0) {
                return {
                    title: "Not Recognized",
                    synopsis: "The anime couldn't be identified. Possible reasons:",
                    suggestions: [
                        "The image is too generic or cropped",
                        "The anime isn't in trace.moe's database",
                        "The screenshot is from a very new/old anime",
                        "Try using a clearer image with main characters"
                    ],
                    isUnknown: true
                };
            }

            // Filter results by confidence threshold
            const MIN_CONFIDENCE = 0.75; // 75% minimum confidence
            const GOOD_CONFIDENCE = 0.85; // 85% good confidence

            const validResults = data.result.filter(result => result.similarity >= MIN_CONFIDENCE);

            if (validResults.length === 0) {
                // Show best match even if below threshold, but mark as low confidence
                const bestMatch = data.result[0];
                return {
                    title: "Low Confidence Match",
                    similarity: (bestMatch.similarity * 100).toFixed(1) + '%',
                    synopsis: `Found a potential match with ${(bestMatch.similarity * 100).toFixed(1)}% similarity, but confidence is below the recommended threshold of ${MIN_CONFIDENCE * 100}%. This might not be accurate.`,
                    videoUrl: bestMatch.video,
                    episode: bestMatch.episode,
                    timestamp: convertToTime(bestMatch.from),
                    isLowConfidence: true,
                    suggestions: [
                        "Try a different screenshot from the same anime",
                        "Use an image with clearer character details",
                        "Try cropping to focus on main characters",
                        "Consider using Gemini AI for description-based search"
                    ]
                };
            }

            // Get best valid match
            const bestMatch = validResults[0];
            console.log("Best match:", bestMatch);

            const confidenceLevel = bestMatch.similarity >= GOOD_CONFIDENCE ? 'high' : 'medium';

            // Prepare basic result
            let result = {
                title: "Scene Match Found",
                similarity: (bestMatch.similarity * 100).toFixed(1) + '%',
                videoUrl: bestMatch.video,
                episode: bestMatch.episode,
                timestamp: convertToTime(bestMatch.from),
                confidenceLevel: confidenceLevel,
                isPartialMatch: true
            };

            // If we have AniList data, enrich the result
            if (bestMatch.anilist) {
                try {
                    const anilistData = await fetchAnilistData(bestMatch.anilist);
                    if (anilistData) {
                        result = {
                            ...result,
                            ...anilistData,
                            isExactMatch: true,
                            isPartialMatch: false
                        };
                    }
                } catch (anilistError) {
                    console.warn("Failed to fetch AniList data:", anilistError);
                    // Continue with basic result even if AniList fails
                }
            }

            return result;

        } catch (error) {
            console.error("trace.moe error:", error);
            throw error;
        }
    }

    async function fetchAnilistData(anilistId) {
        const query = `
            query ($id: Int) {
                Media(id: $id, type: ANIME) {
                    title {
                        romaji
                        english
                        native
                    }
                    format
                    startDate {
                        year
                    }
                    episodes
                    description
                    genres
                    coverImage {
                        large
                    }
                }
            }
        `;

        const variables = { id: anilistId };

        try {
            const response = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables })
            });

            if (!response.ok) {
                throw new Error(`Anilist API Error: ${response.status}`);
            }

            const json = await response.json();
            
            if (!json.data || !json.data.Media) {
                throw new Error('No data returned from AniList');
            }

            const media = json.data.Media;
            return {
                title: media.title.english || media.title.romaji || "Unknown Title",
                japaneseTitle: media.title.native || null,
                type: formatAnimeType(media.format),
                year: media.startDate?.year || "Unknown",
                episodes: media.episodes || null,
                synopsis: cleanAnilistDescription(media.description),
                tags: media.genres?.slice(0, 5) || [],
                coverImage: media.coverImage?.large || null
            };

        } catch (error) {
            console.error("AniList API error:", error);
            throw error;
        }
    }

    function formatAnimeType(type) {
        const typeMap = {
            'TV': 'TV Series',
            'TV_SHORT': 'TV Short',
            'MOVIE': 'Movie',
            'SPECIAL': 'Special',
            'OVA': 'OVA',
            'ONA': 'ONA',
            'MUSIC': 'Music'
        };
        return typeMap[type] || type;
    }

    function cleanAnilistDescription(description) {
        if (!description) return "No synopsis available.";
        return description
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/Source:\s*\w+/i, '') // Remove source notes
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .substring(0, 300) // Limit length
            .trim() + (description.length > 300 ? '...' : '');
    }

    function convertToTime(seconds) {
        if (!seconds) return "";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function displayResults(data, apiType) {
        loading.classList.add('hidden');
        results.classList.remove('hidden');

        // Clear previous results
        resultTitle.textContent = "";
        resultType.innerHTML = "";
        resultYear.innerHTML = "";
        resultEpisodes.innerHTML = "";
        resultSynopsis.textContent = "";
        resultTags.innerHTML = "";
        videoBtn.classList.add('hidden');

        // Set title
        resultTitle.textContent = data.title || "Unknown Anime";

        // Handle different result states
        if (data.isUnknown) {
            // When anime isn't recognized
            resultType.innerHTML = '<i class="fas fa-question-circle"></i> Not Recognized';
            resultSynopsis.innerHTML = [
                data.synopsis,
                ...(data.suggestions || []).map(s => `• ${s}`)
            ].join('<br>');

        } else if (data.isError) {
            // When API error occurs
            resultType.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
            resultSynopsis.textContent = data.synopsis;

        } else if (data.isLowConfidence) {
            // When low confidence match found
            resultType.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Low Confidence Match';
            resultSynopsis.innerHTML = [
                data.synopsis,
                '<br><strong>Suggestions:</strong>',
                ...(data.suggestions || []).map(s => `• ${s}`)
            ].join('<br>');

            // Still show episode and timestamp if available
            if (data.episode) {
                resultEpisodes.innerHTML = `<i class="fas fa-play"></i> Episode ${data.episode}`;
            }

            if (data.timestamp) {
                const timeTag = document.createElement('span');
                timeTag.className = 'tag time-tag';
                timeTag.innerHTML = `<i class="fas fa-clock"></i> ${data.timestamp}`;
                resultTags.appendChild(timeTag);
            }

            if (data.videoUrl) {
                videoBtn.onclick = () => window.open(data.videoUrl, '_blank');
                videoBtn.classList.remove('hidden');
            }

        } else if (data.isPartialMatch) {
            // When partial match found
            resultType.innerHTML = '<i class="fas fa-eye"></i> Scene Match';

            if (data.episode) {
                resultEpisodes.innerHTML = `<i class="fas fa-play"></i> Episode ${data.episode}`;
            }

            resultSynopsis.textContent = data.synopsis || "Scene matched successfully. Additional anime information may be limited.";

            if (data.timestamp) {
                const timeTag = document.createElement('span');
                timeTag.className = 'tag time-tag';
                timeTag.innerHTML = `<i class="fas fa-clock"></i> ${data.timestamp}`;
                resultTags.appendChild(timeTag);
            }

            // Add confidence level tag if available
            if (data.confidenceLevel) {
                const confidenceTag = document.createElement('span');
                confidenceTag.className = `tag confidence-tag ${data.confidenceLevel}`;
                confidenceTag.innerHTML = `<i class="fas fa-chart-line"></i> ${data.confidenceLevel} confidence`;
                resultTags.appendChild(confidenceTag);
            }

            if (data.videoUrl) {
                videoBtn.onclick = () => window.open(data.videoUrl, '_blank');
                videoBtn.classList.remove('hidden');
            }

        } else {
            // When exact match found
            if (data.japaneseTitle) {
                resultTitle.textContent += ` (${data.japaneseTitle})`;
            }

            resultType.innerHTML = `<i class="fas fa-tv"></i> ${data.type || 'Unknown Type'}`;
            resultYear.innerHTML = `<i class="fas fa-calendar-alt"></i> ${data.year || 'Unknown Year'}`;

            if (data.episodes) {
                resultEpisodes.innerHTML = `<i class="fas fa-list-ol"></i> ${data.episodes} ${data.episodes === 1 ? 'Episode' : 'Episodes'}`;
            }

            resultSynopsis.textContent = data.synopsis || 'No synopsis available.';

            // Add tags (genres)
            const genres = data.genres || data.tags || [];
            if (genres && genres.length) {
                genres.slice(0, 6).forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag';
                    tagElement.textContent = tag;
                    resultTags.appendChild(tagElement);
                });
            }

            // Add database sources
            if (data.dataSources && data.dataSources.length > 0) {
                const sourcesTag = document.createElement('span');
                sourcesTag.className = 'tag sources-tag';
                sourcesTag.innerHTML = `<i class="fas fa-database"></i> ${data.dataSources.join(', ')}`;
                resultTags.appendChild(sourcesTag);
            }

            // Add studios
            if (data.studios && data.studios.length > 0) {
                const studiosTag = document.createElement('span');
                studiosTag.className = 'tag studios-tag';
                studiosTag.innerHTML = `<i class="fas fa-building"></i> ${data.studios.slice(0, 2).join(', ')}`;
                resultTags.appendChild(studiosTag);
            }

            // Add score
            if (data.score) {
                const scoreTag = document.createElement('span');
                const scoreColor = data.score >= 8 ? 'high' : data.score >= 7 ? 'medium' : 'low';
                scoreTag.className = `tag score-tag ${scoreColor}`;
                scoreTag.innerHTML = `<i class="fas fa-star"></i> ${data.score.toFixed(1)}/10`;
                resultTags.appendChild(scoreTag);
            }

            // Add timestamp if available (for trace.moe results)
            if (data.timestamp) {
                const timeTag = document.createElement('span');
                timeTag.className = 'tag time-tag';
                timeTag.innerHTML = `<i class="fas fa-clock"></i> ${data.timestamp}`;
                resultTags.appendChild(timeTag);
            }

            // Add confidence level tag if available
            if (data.confidenceLevel) {
                const confidenceTag = document.createElement('span');
                confidenceTag.className = `tag confidence-tag ${data.confidenceLevel}`;
                confidenceTag.innerHTML = `<i class="fas fa-chart-line"></i> ${data.confidenceLevel} confidence`;
                resultTags.appendChild(confidenceTag);
            }

            // Add Gemini confidence if available
            if (data.geminiConfidence) {
                const geminiTag = document.createElement('span');
                geminiTag.className = `tag confidence-tag ${data.geminiConfidence}`;
                geminiTag.innerHTML = `<i class="fas fa-robot"></i> ${data.geminiConfidence} AI confidence`;
                resultTags.appendChild(geminiTag);
            }

            // Add search method tag for enhanced search
            if (data.isEnhancedSearch && data.searchMethod) {
                const methodTag = document.createElement('span');
                methodTag.className = 'tag method-tag';
                methodTag.innerHTML = `<i class="fas fa-cogs"></i> ${data.searchMethod}`;
                resultTags.appendChild(methodTag);
            }

            // Set video button if available
            if (data.videoUrl) {
                videoBtn.onclick = () => window.open(data.videoUrl, '_blank');
                videoBtn.classList.remove('hidden');
            }

            // Use cover image if available
            if (data.coverImage) {
                resultAnimeImage.src = data.coverImage;
                resultAnimeImage.onerror = () => {
                    // Fallback to uploaded image if cover fails to load
                    const img = imagePreview.querySelector('img');
                    if (img) resultAnimeImage.src = img.src;
                };
            }
        }

        // Fallback to uploaded image if no cover image
        if (!data.coverImage) {
            const img = imagePreview.querySelector('img');
            if (img) resultAnimeImage.src = img.src;
        }

        // Save to history if successful result
        if (!data.isUnknown && !data.isError) {
            const imageUrl = imagePreview.querySelector('img')?.src;
            saveToHistory({
                title: data.title,
                method: data.searchMethod || (data.isEnhanced ? 'Enhanced Search' : 'Search'),
                confidence: data.similarity || data.geminiConfidence,
                imageUrl: imageUrl,
                ...data
            });
        }
    }
});
