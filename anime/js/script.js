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

    // Event Listeners
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    fileInput.addEventListener('change', handleFileSelect);
    geminiBtn.addEventListener('click', () => analyzeImage('gemini'));
    traceMoeBtn.addEventListener('click', () => analyzeImage('tracemoe'));
    googleLensBtn.addEventListener('click', searchWithGoogleLens);
    changeBtn.addEventListener('click', resetUpload);
    tryAgainBtn.addEventListener('click', resetUpload);
    newSearchBtn.addEventListener('click', resetUpload);

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
        
        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            uploadArea.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    function resetUpload() {
        fileInput.value = '';
        uploadedFile = null;
        previewContainer.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        results.classList.add('hidden');
        error.classList.add('hidden');
        videoBtn.classList.add('hidden');
    }

    function showError(message) {
        errorMessage.textContent = message;
        loading.classList.add('hidden');
        error.classList.remove('hidden');
    }

    async function analyzeImage(apiType) {
        if (!uploadedFile) return;
        
        previewContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        loading.classList.remove('hidden');
        loadingText.textContent = apiType === 'gemini' 
            ? "Analyzing image with Gemini AI..." 
            : "Searching with trace.moe...";
        
        try {
            let result;
            
            if (apiType === 'gemini') {
                const base64Image = await getBase64(uploadedFile);
                result = await callGeminiAPI(base64Image);
                apiBadge.textContent = "Gemini AI";
                apiBadge.className = "api-badge gemini-badge";
                confidenceBadge.classList.add('hidden');
            } else {
                result = await callTraceMoeAPI(uploadedFile);
                apiBadge.textContent = "trace.moe";
                apiBadge.className = "api-badge tracemoe-badge";
                
                if (result.similarity) {
                    confidenceBadge.textContent = `${result.similarity} confidence`;
                    confidenceBadge.classList.remove('hidden');
                    
                    // Highlight low confidence results
                    if (parseFloat(result.similarity) < 85) {
                        confidenceBadge.style.color = '#ff6b6b';
                    } else {
                        confidenceBadge.style.color = '#4bb543';
                    }
                } else {
                    confidenceBadge.classList.add('hidden');
                }
            }
            
            displayResults(result, apiType);
            
        } catch (err) {
            console.error('Error analyzing image:', err);
            showError(err.message || 'Failed to analyze image. Please try again.');
        }
    }

    async function searchWithGoogleLens() {
        if (!uploadedFile) return;
        
        previewContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        loading.classList.remove('hidden');
        loadingText.textContent = "Preparing image for Google Lens search...";
        
        try {
            // Create a temporary URL for the uploaded image
            const imageUrl = URL.createObjectURL(uploadedFile);
            
            // Prepare the Google Lens URL
            const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`;
            
            // Display loading message
            loadingText.textContent = "Redirecting to Google Lens...";
            
            // Open Google Lens in a new tab after a small delay
            setTimeout(() => {
                window.open(googleLensUrl, '_blank');
                loading.classList.add('hidden');
                resultsContainer.classList.add('hidden');
                
                // Clean up the temporary URL
                URL.revokeObjectURL(imageUrl);
            }, 1000);
            
        } catch (err) {
            console.error('Error with Google Lens:', err);
            showError('Failed to prepare image for Google Lens. Please try again.');
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

    async function callGeminiAPI(base64Image) {
        const API_KEY = 'AIzaSyBIjo4DrRh7EWLv37Ub1P8lsLPNtKoRQ0c';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${API_KEY}`;
        
        const requestBody = {
            contents: [{
                parts: [
                    { 
                        text: `Analyze this anime image and provide:
                        1. Title (English and Japanese if available)
                        2. Type (TV, Movie, etc.)
                        3. Year
                        4. Episode count (if applicable)
                        5. Brief synopsis
                        6. 3-5 relevant genres/tags
                        
                        Format as JSON: {
                            "title": "",
                            "japaneseTitle": "",
                            "type": "",
                            "year": "",
                            "episodes": "",
                            "synopsis": "",
                            "tags": []
                        }` 
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
                const jsonStart = textResponse.indexOf('{');
                const jsonEnd = textResponse.lastIndexOf('}');
                const jsonString = textResponse.slice(jsonStart, jsonEnd + 1);
                const result = JSON.parse(jsonString);
                
                // Validate Gemini response
                if (!result.title || result.title.toLowerCase().includes('unknown')) {
                    throw new Error('Gemini could not identify the anime');
                }
                
                return result;
                
            } catch (e) {
                console.warn('Failed to parse JSON response:', e);
                throw new Error('Could not parse Gemini response');
            }
            
        } catch (error) {
            console.error('Gemini API error:', error);
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

            // Get best match (highest similarity)
            const bestMatch = data.result[0];
            console.log("Best match:", bestMatch);

            // Prepare basic result
            let result = {
                title: "Potential Match Found",
                similarity: (bestMatch.similarity * 100).toFixed(1) + '%',
                videoUrl: bestMatch.video,
                episode: bestMatch.episode,
                timestamp: convertToTime(bestMatch.from),
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
            
        } else if (data.isPartialMatch) {
            // When partial match found
            resultType.innerHTML = '<i class="fas fa-eye"></i> Visual Match';
            
            if (data.episode) {
                resultEpisodes.innerHTML = `<i class="fas fa-play"></i> Episode ${data.episode}`;
            }
            
            resultSynopsis.textContent = data.synopsis || "No additional information available";
            
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
            
            // Add tags
            if (data.tags && data.tags.length) {
                data.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag';
                    tagElement.textContent = tag;
                    resultTags.appendChild(tagElement);
                });
            }
            
            // Add timestamp if available
            if (data.timestamp) {
                const timeTag = document.createElement('span');
                timeTag.className = 'tag time-tag';
                timeTag.innerHTML = `<i class="fas fa-clock"></i> ${data.timestamp}`;
                resultTags.appendChild(timeTag);
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
    }
});
