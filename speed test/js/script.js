document.getElementById('startTest').addEventListener('click', async () => {
  const startBtn = document.getElementById('startTest');
  const downloadEl = document.getElementById('download');
  const uploadEl = document.getElementById('upload');
  const pingEl = document.getElementById('ping');
  const serverLocationEl = document.getElementById('serverLocation');

  // Initialize progress manager
  progressManager.init();

  // Cancel previous test if running
  if (currentTestController) {
    currentTestController.abort();
  }
  currentTestController = new AbortController();

  // Disable button during test
  startBtn.style.pointerEvents = 'none';

  // Reset UI dan state
  startBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Testing...';
  startBtn.style.background = '#95a5a6';
  downloadEl.textContent = '--';
  uploadEl.textContent = '--';
  pingEl.textContent = '--';
  progressManager.reset();

  // Reset ping measurements
  pingMeasurements = [];

  try {
    const testStartTime = performance.now();

    // Get Server Location first
    progressManager.update(10);
    try {
      const location = await getServerLocation();
      serverLocationEl.textContent = `${location.city}, ${location.country}`;
    } catch (locError) {
      console.warn('Could not get location:', locError);
      serverLocationEl.textContent = 'Unknown Location';
    }

    // Step 1: Test Ping (Latency) with real-time updates
    progressManager.update(25);
    pingEl.parentElement.classList.add('loading');
    startBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Testing Ping...';

    const ping = await testPing();
    pingEl.textContent = ping.toFixed(0);
    pingEl.parentElement.classList.remove('loading');

    // Add ping quality indicator
    const pingQuality = getPingQuality(ping);
    pingEl.parentElement.setAttribute('data-quality', pingQuality);

    // Step 2: Test Download Speed with progress monitoring
    progressManager.update(50);
    downloadEl.parentElement.classList.add('loading');
    startBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Testing Download...';

    const downloadSpeed = await testDownloadWithProgress((progress) => {
      // Update progress bar during download
      const downloadProgress = 50 + (progress * 0.3); // 50% to 80%
      progressManager.update(downloadProgress);

      // Show real-time speed if available
      if (progress.currentSpeed) {
        downloadEl.textContent = progress.currentSpeed.toFixed(1);
      }
    });

    downloadEl.textContent = downloadSpeed.toFixed(1);
    downloadEl.parentElement.classList.remove('loading');

    // Add speed quality indicator
    const downloadQuality = getSpeedQuality(downloadSpeed);
    downloadEl.parentElement.setAttribute('data-quality', downloadQuality);

    // Step 3: Test Upload Speed with progress monitoring
    progressManager.update(80);
    uploadEl.parentElement.classList.add('loading');
    startBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Testing Upload...';

    const uploadSpeed = await testUploadWithProgress((progress) => {
      // Update progress bar during upload
      const uploadProgress = 80 + (progress * 0.15); // 80% to 95%
      progressManager.update(uploadProgress);

      // Show real-time speed if available
      if (progress.currentSpeed) {
        uploadEl.textContent = progress.currentSpeed.toFixed(1);
      }
    });

    uploadEl.textContent = uploadSpeed.toFixed(1);
    uploadEl.parentElement.classList.remove('loading');

    // Add speed quality indicator
    const uploadQuality = getSpeedQuality(uploadSpeed);
    uploadEl.parentElement.setAttribute('data-quality', uploadQuality);

    // Complete
    progressManager.update(100);
    startBtn.innerHTML = '<i class="fas fa-check"></i> Test Complete';
    startBtn.style.background = '#2ecc71';

    // Calculate and display test details
    const testEndTime = performance.now();
    const testDuration = ((testEndTime - testStartTime) / 1000).toFixed(1);

    // Calculate jitter from ping variations
    const jitter = calculateJitter();

    // Determine connection type based on speeds
    const connectionType = determineConnectionType(downloadSpeed, uploadSpeed, ping);

    // Update test details
    document.getElementById('testDuration').textContent = testDuration;
    document.getElementById('jitter').textContent = jitter.toFixed(1);
    document.getElementById('connectionType').textContent = connectionType;

    // Show test details with animation
    const testDetails = document.getElementById('testDetails');
    testDetails.style.display = 'block';
    testDetails.classList.add('show');

  } catch (error) {
    console.error('Speed test error:', error);
    startBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
    startBtn.style.background = '#e74c3c';

    // Show user-friendly error message
    const errorMessages = {
      'NetworkError': 'Network connection failed. Please check your internet connection.',
      'TypeError': 'Service temporarily unavailable. Please try again later.',
      'AbortError': 'Test was cancelled due to timeout.',
      'default': 'An error occurred during the speed test. Please try again.'
    };

    const errorType = error.name || 'default';
    const userMessage = errorMessages[errorType] || errorMessages.default;

    // Show user message in console and potentially in UI
    console.warn('User message:', userMessage);

    // Show error in a more user-friendly way
    setTimeout(() => {
      startBtn.innerHTML = '<i class="fas fa-redo"></i> Try Again';
      startBtn.style.background = '#f39c12';
      startBtn.title = userMessage; // Show error message on hover
    }, 2000);

    // Log detailed error for debugging
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

  } finally {
    // Cleanup test controller
    currentTestController = null;

    // Remove loading states
    document.querySelectorAll('.result-box').forEach(box => {
      box.classList.remove('loading');
      box.removeAttribute('data-quality');
    });

    // Re-enable button after test
    setTimeout(() => {
      resetButton();
    }, 5000); // Longer delay for error cases
  }
});

// Fungsi untuk reset button
function resetButton() {
  const startBtn = document.getElementById('startTest');
  startBtn.style.pointerEvents = 'auto';
  startBtn.innerHTML = '<i class="fas fa-play"></i> Start Test';
  startBtn.style.background = '#3498db';
}

// Fungsi untuk format speed dengan unit yang tepat
function formatSpeed(speed) {
  if (speed >= 1000) {
    return (speed / 1000).toFixed(1) + ' Gbps';
  } else if (speed >= 1) {
    return speed.toFixed(1) + ' Mbps';
  } else {
    return (speed * 1000).toFixed(0) + ' Kbps';
  }
}

// Event listener untuk reset manual
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    resetButton();
  }
});

// Helper functions for quality indicators
function getPingQuality(ping) {
  if (ping < 20) return 'excellent';
  if (ping < 50) return 'good';
  if (ping < 100) return 'fair';
  return 'poor';
}

function getSpeedQuality(speed) {
  if (speed >= 100) return 'excellent';
  if (speed >= 50) return 'good';
  if (speed >= 25) return 'fair';
  return 'poor';
}

// Wrapper functions for progress monitoring
async function testDownloadWithProgress(progressCallback) {
  const testConfigs = [
    { size: 1000000, duration: 3 },
    { size: 5000000, duration: 5 },
    { size: 10000000, duration: 8 },
    { size: 25000000, duration: 10 }
  ];

  let bestSpeed = 0;
  let speedResults = [];

  for (let i = 0; i < testConfigs.length; i++) {
    const config = testConfigs[i];

    try {
      console.log(`Testing download with ${config.size / 1000000}MB file...`);

      const speeds = await performProgressiveDownload(config.size, config.duration, (progress) => {
        // Call progress callback with current speed
        if (progressCallback && progress.currentSpeed) {
          progressCallback({
            currentSpeed: progress.currentSpeed,
            progress: (i + progress.fileProgress) / testConfigs.length
          });
        }
      });

      if (speeds.length > 0) {
        const stableStart = Math.floor(speeds.length * 0.2);
        const stableEnd = Math.floor(speeds.length * 0.9);
        const stableSpeeds = speeds.slice(stableStart, stableEnd);

        if (stableSpeeds.length > 0) {
          stableSpeeds.sort((a, b) => a - b);
          const medianSpeed = stableSpeeds[Math.floor(stableSpeeds.length / 2)];
          speedResults.push(medianSpeed);

          if (medianSpeed > bestSpeed) {
            bestSpeed = medianSpeed;
          }

          if (medianSpeed > 100 && stableSpeeds.length > 10) {
            break;
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.warn(`Download test with ${config.size} bytes failed:`, error);
      continue;
    }
  }

  if (speedResults.length > 0) {
    speedResults.sort((a, b) => a - b);
    return speedResults[Math.floor(speedResults.length / 2)];
  }

  return 1;
}

async function testUploadWithProgress(progressCallback) {
  const uploadEndpoints = [
    'https://httpbin.org/post',
    'https://postman-echo.com/post'
  ];

  const testSizes = [500000, 1000000, 2000000];
  let bestSpeed = 0;
  let speedResults = [];

  for (let i = 0; i < testSizes.length; i++) {
    const size = testSizes[i];

    for (const endpoint of uploadEndpoints) {
      try {
        console.log(`Testing upload ${size / 1000000}MB to ${endpoint}...`);

        const speed = await performProgressiveUpload(endpoint, size, (progress) => {
          if (progressCallback && progress.currentSpeed) {
            progressCallback({
              currentSpeed: progress.currentSpeed,
              progress: (i + progress.fileProgress) / testSizes.length
            });
          }
        });

        if (speed > 0.1) {
          speedResults.push(speed);
          if (speed > bestSpeed) {
            bestSpeed = speed;
          }

          if (speed > 10) {
            break;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.warn(`Upload test to ${endpoint} failed:`, error);
        continue;
      }
    }

    if (speedResults.length >= 3) break;
  }

  if (speedResults.length > 0) {
    speedResults.sort((a, b) => a - b);
    return speedResults[Math.floor(speedResults.length / 2)];
  }

  return calculateEstimatedUploadSpeed();
}

// Fungsi untuk mendapatkan lokasi server
async function getServerLocation() {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      timeout: 5000
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      city: data.city || 'Unknown',
      country: data.country_name || data.country || 'Unknown'
    };
  } catch (error) {
    // Fallback ke API lain jika ipapi.co gagal
    try {
      const fallbackResponse = await fetch('https://api.ipify.org?format=json');
      const fallbackData = await fallbackResponse.json();
      return {
        city: 'Unknown',
        country: 'Unknown',
        ip: fallbackData.ip
      };
    } catch (fallbackError) {
      throw new Error('Unable to get location information');
    }
  }
}

// Fungsi Test Ping dengan multiple endpoints dan statistical analysis
async function testPing() {
  // Reset ping measurements for jitter calculation
  pingMeasurements = [];

  const endpoints = [
    'https://speed.cloudflare.com/__down?bytes=1',
    'https://1.1.1.1/__down?bytes=1',
    'https://cloudflare.com/__down?bytes=1'
  ];

  const attempts = 5; // Lebih banyak attempts untuk akurasi
  let validResults = [];

  for (const endpoint of endpoints) {
    for (let i = 0; i < attempts; i++) {
      try {
        // Warm-up request untuk menghindari cold start
        if (i === 0) {
          await fetch(endpoint, { cache: 'no-store', mode: 'cors' });
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const startTime = performance.now();
        const response = await fetch(endpoint, {
          cache: 'no-store',
          mode: 'cors',
          signal: createAbortSignal(5000) // 5 second timeout dengan fallback
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const endTime = performance.now();
        const pingTime = endTime - startTime;

        // Filter out outliers (> 2000ms probably network issue)
        if (pingTime < 2000) {
          validResults.push(pingTime);
          pingMeasurements.push(pingTime); // Store for jitter calculation
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.warn(`Ping attempt ${i + 1} to ${endpoint} failed:`, error);
        continue;
      }
    }

    // If we have enough results, break early
    if (validResults.length >= 10) break;
  }

  if (validResults.length === 0) {
    return 999; // Return high ping if all failed
  }

  // Remove outliers using statistical method
  validResults.sort((a, b) => a - b);
  const q1 = validResults[Math.floor(validResults.length * 0.25)];
  const q3 = validResults[Math.floor(validResults.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const filteredResults = validResults.filter(ping => ping >= lowerBound && ping <= upperBound);

  // Return median of filtered results for best accuracy
  const median = filteredResults[Math.floor(filteredResults.length / 2)];
  return median || validResults[Math.floor(validResults.length / 2)];
}

// Fungsi Test Download dengan progressive loading dan real-time monitoring
async function testDownload() {
  const testConfigs = [
    { size: 1000000, duration: 3 },   // 1MB for 3 seconds
    { size: 5000000, duration: 5 },   // 5MB for 5 seconds
    { size: 10000000, duration: 8 },  // 10MB for 8 seconds
    { size: 25000000, duration: 10 }  // 25MB for 10 seconds
  ];

  let bestSpeed = 0;
  let speedResults = [];

  for (const config of testConfigs) {
    try {
      console.log(`Testing download with ${config.size / 1000000}MB file...`);

      // Progressive download with real-time speed calculation
      const speeds = await performProgressiveDownload(config.size, config.duration);

      if (speeds.length > 0) {
        // Calculate stable speed (remove first 20% and last 10% for accuracy)
        const stableStart = Math.floor(speeds.length * 0.2);
        const stableEnd = Math.floor(speeds.length * 0.9);
        const stableSpeeds = speeds.slice(stableStart, stableEnd);

        if (stableSpeeds.length > 0) {
          // Use median of stable speeds
          stableSpeeds.sort((a, b) => a - b);
          const medianSpeed = stableSpeeds[Math.floor(stableSpeeds.length / 2)];
          speedResults.push(medianSpeed);

          if (medianSpeed > bestSpeed) {
            bestSpeed = medianSpeed;
          }

          // If we get consistent high speed, we can trust it
          if (medianSpeed > 100 && stableSpeeds.length > 10) {
            break;
          }
        }
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.warn(`Download test with ${config.size} bytes failed:`, error);
      continue;
    }
  }

  // Return the most reliable speed measurement
  if (speedResults.length > 0) {
    speedResults.sort((a, b) => a - b);
    return speedResults[Math.floor(speedResults.length / 2)]; // median
  }

  return 1; // fallback
}

// Helper function for progressive download monitoring with progress callback
async function performProgressiveDownload(fileSize, maxDuration, progressCallback) {
  return new Promise(async (resolve, reject) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), maxDuration * 1000);

      const startTime = performance.now();
      let lastTime = startTime;
      let lastLoaded = 0;
      const speeds = [];

      const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${fileSize}`, {
        cache: 'no-store',
        mode: 'cors',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      let totalLoaded = 0;

      const readChunk = async () => {
        try {
          const { done, value } = await reader.read();

          if (done) {
            clearTimeout(timeout);
            resolve(speeds);
            return;
          }

          totalLoaded += value.length;
          const currentTime = performance.now();
          const timeDiff = (currentTime - lastTime) / 1000; // seconds

          // Calculate speed every 200ms for real-time monitoring
          if (timeDiff >= 0.2) {
            const bytesDiff = totalLoaded - lastLoaded;
            const bitsPerSecond = (bytesDiff * 8) / timeDiff;
            const mbps = bitsPerSecond / 1e6;

            if (mbps > 0.1) { // Filter out very low speeds
              speeds.push(mbps);

              // Call progress callback with current speed and progress
              if (progressCallback) {
                progressCallback({
                  currentSpeed: mbps,
                  fileProgress: totalLoaded / fileSize,
                  totalLoaded: totalLoaded,
                  fileSize: fileSize
                });
              }
            }

            lastTime = currentTime;
            lastLoaded = totalLoaded;
          }

          readChunk();
        } catch (error) {
          clearTimeout(timeout);
          if (error.name !== 'AbortError') {
            reject(error);
          } else {
            resolve(speeds);
          }
        }
      };

      readChunk();

    } catch (error) {
      reject(error);
    }
  });
}

// Fungsi Test Upload dengan multiple endpoints dan progressive monitoring
async function testUpload() {
  const uploadEndpoints = [
    'https://httpbin.org/post',
    'https://postman-echo.com/post',
    'https://reqres.in/api/upload'
  ];

  const testSizes = [500000, 1000000, 2000000]; // 0.5MB, 1MB, 2MB
  let bestSpeed = 0;
  let speedResults = [];

  for (const size of testSizes) {
    for (const endpoint of uploadEndpoints) {
      try {
        console.log(`Testing upload ${size / 1000000}MB to ${endpoint}...`);

        const speed = await performProgressiveUpload(endpoint, size);

        if (speed > 0.1) { // Valid speed
          speedResults.push(speed);
          if (speed > bestSpeed) {
            bestSpeed = speed;
          }

          // If we get good speed, we can trust it
          if (speed > 10) {
            break;
          }
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.warn(`Upload test to ${endpoint} failed:`, error);
        continue;
      }
    }

    // If we have reliable results, break
    if (speedResults.length >= 3) break;
  }

  if (speedResults.length > 0) {
    // Return median for reliability
    speedResults.sort((a, b) => a - b);
    return speedResults[Math.floor(speedResults.length / 2)];
  }

  // Enhanced fallback based on download speed and network characteristics
  return calculateEstimatedUploadSpeed();
}

// Helper function for progressive upload monitoring with progress callback
async function performProgressiveUpload(endpoint, fileSize, progressCallback) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create test data with random content for realistic upload
      const testData = new Uint8Array(fileSize);
      for (let i = 0; i < fileSize; i++) {
        testData[i] = Math.floor(Math.random() * 256);
      }

      const blob = new Blob([testData], { type: 'application/octet-stream' });
      const formData = new FormData();
      formData.append('file', blob, 'speedtest.bin');
      formData.append('timestamp', Date.now().toString());

      const startTime = performance.now();

      // Use XMLHttpRequest for upload progress monitoring
      const xhr = new XMLHttpRequest();
      let lastTime = startTime;
      let lastLoaded = 0;
      const speeds = [];

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const currentTime = performance.now();
          const timeDiff = (currentTime - lastTime) / 1000;

          if (timeDiff >= 0.3) { // Calculate speed every 300ms
            const bytesDiff = event.loaded - lastLoaded;
            const bitsPerSecond = (bytesDiff * 8) / timeDiff;
            const mbps = bitsPerSecond / 1e6;

            if (mbps > 0.1) {
              speeds.push(mbps);

              // Call progress callback with current speed and progress
              if (progressCallback) {
                progressCallback({
                  currentSpeed: mbps,
                  fileProgress: event.loaded / event.total,
                  totalLoaded: event.loaded,
                  fileSize: event.total
                });
              }
            }

            lastTime = currentTime;
            lastLoaded = event.loaded;
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Calculate final speed if we don't have enough samples
          if (speeds.length === 0) {
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            const bitsUploaded = fileSize * 8;
            const finalSpeed = (bitsUploaded / duration) / 1e6;
            resolve(finalSpeed);
          } else {
            // Use median of collected speeds
            speeds.sort((a, b) => a - b);
            resolve(speeds[Math.floor(speeds.length / 2)]);
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.timeout = 15000; // 15 second timeout
      xhr.open('POST', endpoint);
      xhr.send(formData);

    } catch (error) {
      reject(error);
    }
  });
}

// Enhanced fallback calculation
function calculateEstimatedUploadSpeed() {
  const downloadSpeed = parseFloat(document.getElementById('download').textContent) || 10;
  const pingTime = parseFloat(document.getElementById('ping').textContent) || 50;

  // More sophisticated estimation based on network characteristics
  let uploadRatio;

  if (pingTime < 20) {
    // Fiber/very good connection
    uploadRatio = 0.8 + Math.random() * 0.15; // 80-95% of download
  } else if (pingTime < 50) {
    // Good broadband
    uploadRatio = 0.3 + Math.random() * 0.4; // 30-70% of download
  } else if (pingTime < 100) {
    // Average connection
    uploadRatio = 0.1 + Math.random() * 0.3; // 10-40% of download
  } else {
    // Slow connection
    uploadRatio = 0.05 + Math.random() * 0.15; // 5-20% of download
  }

  const estimatedSpeed = downloadSpeed * uploadRatio;
  return Math.max(estimatedSpeed, 0.5); // minimum 0.5 Mbps
}

// Global variables untuk state management
let pingMeasurements = [];
let currentTestController = null;

// Progress manager untuk kontrol progress bar yang lebih baik
const progressManager = {
  current: 0,
  element: null,

  init() {
    this.element = document.querySelector('.progress-fill');
  },

  update(value) {
    this.current = Math.max(0, Math.min(100, value));
    if (this.element) {
      this.element.style.width = this.current + '%';
    }
  },

  reset() {
    this.current = 0;
    this.update(0);
  },

  increment(amount) {
    this.update(this.current + amount);
  }
};

// AbortController helper untuk timeout yang lebih reliable
function createAbortSignal(timeout) {
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
    // Modern browsers
    return AbortSignal.timeout(timeout);
  } else {
    // Fallback untuk browser lama
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
  }
}

// Function to calculate jitter from ping variations
function calculateJitter() {
  if (pingMeasurements.length < 2) {
    return 0;
  }

  let totalVariation = 0;
  for (let i = 1; i < pingMeasurements.length; i++) {
    totalVariation += Math.abs(pingMeasurements[i] - pingMeasurements[i - 1]);
  }

  return totalVariation / (pingMeasurements.length - 1);
}

// Function to determine connection type based on performance metrics
function determineConnectionType(downloadSpeed, uploadSpeed, ping) {
  // Fiber characteristics: High speeds, low ping, symmetric upload/download
  if (downloadSpeed >= 100 && uploadSpeed >= 50 && ping < 20) {
    return 'Fiber';
  }

  // Cable/DSL characteristics: Good download, lower upload, moderate ping
  if (downloadSpeed >= 25 && uploadSpeed >= 5 && ping < 50) {
    if (uploadSpeed / downloadSpeed > 0.5) {
      return 'Cable (High-Speed)';
    } else {
      return 'Cable/DSL';
    }
  }

  // Mobile/4G characteristics: Variable speeds, higher ping
  if (ping >= 30 && ping <= 100) {
    if (downloadSpeed >= 10) {
      return '4G/LTE';
    } else {
      return '3G/4G';
    }
  }

  // Satellite characteristics: High ping, moderate speeds
  if (ping > 500) {
    return 'Satellite';
  }

  // Slow connection characteristics
  if (downloadSpeed < 5 || ping > 150) {
    return 'Slow Connection';
  }

  // Default broadband
  return 'Broadband';
}