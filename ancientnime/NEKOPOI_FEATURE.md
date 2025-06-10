# 🔞 Nekopoi Adult Content Feature

## Overview
Fitur baru yang telah ditambahkan ke AncientNime API untuk mengintegrasikan konten dewasa dari Nekopoi. Fitur ini dilengkapi dengan sistem verifikasi usia dan antarmuka yang aman.

## Features Added

### 🎯 Backend Features
1. **Nekopoi Controller** (`controllers/nekopoi.controller.js`)
   - `getLatest()` - Mengambil rilis terbaru konten dewasa
   - `getInfo(url)` - Mengambil detail konten berdasarkan URL
   - `healthCheck()` - Memeriksa status layanan Nekopoi

2. **API Endpoints**
   - `GET /api/nekopoi/latest` - Daftar konten terbaru
   - `GET /api/nekopoi/info/:url` - Detail konten spesifik
   - `GET /api/nekopoi/health` - Status kesehatan layanan

### 🎨 Frontend Features
1. **Age Verification System**
   - Modal verifikasi usia sebelum mengakses konten
   - Penyimpanan status verifikasi di localStorage
   - Peringatan konten dewasa yang jelas

2. **Adult Content Section**
   - Menu navigasi khusus dengan indikator 18+
   - Desain visual yang berbeda (warna merah)
   - Grid konten dengan thumbnail dan informasi

3. **Safety Features**
   - Peringatan konten dewasa di setiap halaman
   - Disclaimer dan informasi keamanan
   - Tombol refresh untuk memuat ulang konten

## 🚀 How to Use

### For Users
1. Klik menu "Adult (18+)" di navigasi
2. Konfirmasi bahwa Anda berusia 18+ tahun
3. Jelajahi konten dewasa yang tersedia
4. Klik pada item untuk melihat detail dan link download

### For Developers
```javascript
// Test the API endpoints
const response = await fetch('/api/nekopoi/latest');
const data = await response.json();
console.log(data.data); // Array of adult content

// Get specific content info
const encodedUrl = encodeURIComponent(contentUrl);
const info = await fetch(`/api/nekopoi/info/${encodedUrl}`);
```

## 🔧 Technical Implementation

### Backend Structure
```
controllers/
├── nekopoi.controller.js    # New controller for adult content
├── main.controller.js       # Existing anime controller
└── anime.controller.js      # Existing anime detail controller

routes/
└── index.js                 # Updated with Nekopoi routes
```

### Frontend Structure
```
public/
├── index.html              # Updated with adult content section
├── script.js               # Added Nekopoi functions
└── style.css               # Added adult content styling
```

## 🎨 Design Elements

### Color Scheme
- **Primary**: Red gradient (#dc3545 to #c82333)
- **Accent**: Warning colors for safety notices
- **Icons**: 🔞 emoji for adult content indicators

### UI Components
- Age verification modal with clear warnings
- Adult content cards with special styling
- Safety disclaimers and information boxes
- Responsive design for mobile devices

## 🛡️ Safety & Security

### Age Verification
- Modal popup before accessing content
- localStorage persistence for user convenience
- Clear warnings about adult content

### Content Handling
- Image proxy for CORS handling
- Error handling for failed requests
- Fallback placeholders for missing images

### User Protection
- Clear disclaimers about external content
- Warning messages throughout the interface
- Easy navigation back to safe content

## 📱 Responsive Design
- Mobile-friendly age verification modal
- Responsive grid layout for content
- Touch-friendly buttons and navigation

## 🧪 Testing
Run the test file to verify functionality:
```bash
node test-nekopoi.js
```

## 🔮 Future Enhancements
1. Content filtering and categories
2. User preferences and settings
3. Enhanced search functionality
4. Content rating system
5. Parental controls

## ⚠️ Important Notes
- This feature is intended for users 18+ years old
- Content is sourced from external websites
- Users should understand the risks associated with adult content
- The feature includes appropriate warnings and disclaimers

## 📄 License & Disclaimer
This feature is provided as-is for educational purposes. Users are responsible for complying with local laws and regulations regarding adult content access and distribution.
