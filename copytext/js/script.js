// Your Gemini API Key (embedded in the code)
const GEMINI_API_KEY = "AIzaSyBIjo4DrRh7EWLv37Ub1P8lsLPNtKoRQ0c";

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const extractedText = document.getElementById('extractedText');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const copyButton = document.getElementById('copyButton');
const newImageButton = document.getElementById('newImageButton');
const downloadButton = document.getElementById('downloadButton');

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('active');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('active');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('active');
    
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileUpload(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        handleFileUpload(fileInput.files[0]);
    }
});

copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(extractedText.innerText)
        .then(() => {
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyButton.innerHTML = '<i class="far fa-copy"></i> Copy Text';
            }, 2000);
        });
});

newImageButton.addEventListener('click', () => {
    previewSection.classList.remove('active');
    fileInput.value = '';
});

downloadButton.addEventListener('click', () => {
    const blob = new Blob([extractedText.innerText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Functions
async function handleFileUpload(file) {
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showError("Please upload a valid image file (JPEG or PNG)");
        return;
    }
    
    // Show loading indicator
    loadingIndicator.classList.add('active');
    errorMessage.classList.remove('active');
    
    // Preview image
    const reader = new FileReader();
    reader.onload = async (e) => {
        previewImage.src = e.target.result;
        
        try {
            // Convert image to base64
            const base64Image = e.target.result.split(',')[1];
            
            // Call Gemini API
            const response = await callGeminiAPI(base64Image, file.type);
            
            // Display results
            loadingIndicator.classList.remove('active');
            previewSection.classList.add('active');
            
            // Format the response
            extractedText.innerHTML = formatGeminiResponse(response);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            showError("Error processing image. Please try again.");
            loadingIndicator.classList.remove('active');
        }
    };
    reader.readAsDataURL(file);
}

async function callGeminiAPI(base64Image, mimeType) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: "Extract text from this image accurately." },
                    { inline_data: { mime_type: mimeType, data: base64Image } }
                ]
            }
        ]
    };

    try {
        console.log("Request Payload:", JSON.stringify(requestBody));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Response Data:", data);
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("Invalid response from Gemini API.");
        }

        return data;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

function formatGeminiResponse(response) {
    try {
        if (!response.candidates || !response.candidates[0].content.parts) {
            return "<p>No text found in the image.</p>";
        }
        
        const textContent = response.candidates[0].content.parts
            .filter(part => part.text)
            .map(part => part.text)
            .join("\n\n");
        
        // Format with line breaks
        return `<p>${textContent.replace(/\n/g, '<br>')}</p>`;
    } catch (error) {
        console.error("Error formatting response:", error);
        return "<p>Error processing response. The image may not contain readable text.</p>";
    }
}

function showError(message) {
    errorMessage.textContent = message || "There was an error processing your image.";
    errorMessage.classList.add('active');
    loadingIndicator.classList.remove('active');
    setTimeout(() => {
        errorMessage.classList.remove('active');
    }, 5000);
}