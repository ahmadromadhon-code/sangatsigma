# 🎬 Video Troubleshooting Guide - AncientNime

## 🔍 Masalah: Video Tidak Bisa Dibuka

### Kemungkinan Penyebab & Solusi:

## 1. 🌐 **Masalah Koneksi API**

### Gejala:
- Episode tidak memuat
- Error "Failed to fetch data"
- Loading terus-menerus

### Solusi:
```bash
# Cek status server
curl http://localhost:3001/api/home

# Restart server jika perlu
npm start
```

### Debug:
- Buka `http://localhost:3001/debug-video.html`
- Klik "Test API Connection"
- Periksa console browser (F12)

## 2. 📺 **Link Streaming Tidak Ditemukan**

### Gejala:
- Pesan "Video Tidak Tersedia"
- Player menampilkan placeholder
- API response tidak memiliki `link_stream`

### Penyebab:
- Struktur HTML OtakuDesu berubah
- Selector iframe tidak cocok
- Link streaming di-encode atau tersembunyi

### Solusi:
1. **Update Selector di Controller:**
```javascript
// Di controllers/anime.controller.js
const streamSelectors = [
  '#lightsVideo iframe',
  '#embed_holder iframe',
  '.player-embed iframe',
  '.video-content iframe',
  'iframe[src*="embed"]',
  'iframe[src*="player"]',
  '.venser iframe',           // Tambahan
  '.entry-content iframe',    // Tambahan
  'iframe'                    // Fallback
];
```

2. **Test Manual:**
- Buka halaman episode di OtakuDesu
- Inspect element (F12)
- Cari iframe atau video element
- Update selector sesuai struktur baru

## 3. 🚫 **CORS (Cross-Origin) Issues**

### Gejala:
- Iframe kosong/putih
- Console error: "Blocked by CORS policy"
- Video tidak muncul meski link ada

### Solusi:
1. **Gunakan Proxy Server:**
```javascript
// Tambah proxy untuk iframe
if (streamUrl.includes('otakudesu.cloud')) {
  streamUrl = `https://cors-anywhere.herokuapp.com/${streamUrl}`;
}
```

2. **Alternative Embed:**
```javascript
// Gunakan alternative embed
const alternativeEmbeds = [
  'https://drive.google.com/file/d/VIDEO_ID/preview',
  'https://www.youtube.com/embed/VIDEO_ID',
  'https://player.vimeo.com/video/VIDEO_ID'
];
```

## 4. 🔒 **Iframe Security Restrictions**

### Gejala:
- Iframe tidak memuat konten
- Security warnings di console
- X-Frame-Options errors

### Solusi:
1. **Update Iframe Attributes:**
```html
<iframe src="VIDEO_URL"
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation">
</iframe>
```

2. **Fallback ke External Link:**
```javascript
if (iframeBlocked) {
  showExternalLinkOption(streamUrl);
}
```

## 5. 📱 **Mobile/Browser Compatibility**

### Gejala:
- Video tidak muncul di mobile
- Berbeda behavior antar browser
- Autoplay tidak berfungsi

### Solusi:
1. **Responsive Player:**
```css
.video-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

2. **Browser Detection:**
```javascript
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
  // Use mobile-optimized player
}
```

## 6. 🔧 **Server-Side Issues**

### Gejala:
- API timeout
- 500 Internal Server Error
- Scraping gagal

### Solusi:
1. **Increase Timeout:**
```javascript
// Di controllers/anime.controller.js
const response = await Axios.get(fullUrl, {
  timeout: 30000, // 30 seconds
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});
```

2. **Error Handling:**
```javascript
try {
  const response = await Axios.get(fullUrl);
  // Process response
} catch (error) {
  console.error('Scraping failed:', error.message);
  // Fallback or retry logic
}
```

## 🛠️ **Quick Fixes**

### 1. Restart Everything:
```bash
# Stop server
Ctrl+C

# Clear cache
npm cache clean --force

# Restart
npm start
```

### 2. Test dengan Episode Lain:
- Coba episode berbeda
- Cek apakah masalah spesifik atau umum

### 3. Browser Troubleshooting:
- Clear browser cache
- Disable ad blockers
- Try incognito/private mode
- Test di browser berbeda

### 4. Network Check:
- Cek koneksi internet
- Test akses ke otakudesu.cloud
- Verify port 3001 tidak diblokir

## 🔍 **Debug Tools**

### 1. Debug Page:
```
http://localhost:3001/debug-video.html
```

### 2. Browser Console:
```javascript
// Test API manually
fetch('http://localhost:3001/api/eps/EPISODE_ID')
  .then(r => r.json())
  .then(console.log);
```

### 3. Network Tab:
- Buka F12 → Network
- Reload page
- Cek failed requests
- Periksa response headers

## 📋 **Checklist Troubleshooting**

- [ ] Server berjalan di port 3001
- [ ] API endpoint `/api/home` berfungsi
- [ ] Episode API mengembalikan data
- [ ] `link_stream` ada dalam response
- [ ] Iframe tidak diblokir CORS
- [ ] Browser mendukung iframe
- [ ] Tidak ada ad blocker yang menghalangi
- [ ] Koneksi internet stabil
- [ ] OtakuDesu.cloud dapat diakses

## 🆘 **Jika Masih Bermasalah**

1. **Gunakan Demo Mode:**
   - Klik anime apa saja
   - Sistem akan menampilkan demo player

2. **Manual Testing:**
   - Buka OtakuDesu.cloud langsung
   - Cari episode yang sama
   - Bandingkan struktur HTML

3. **Alternative Sources:**
   - Gunakan sumber streaming lain
   - Implementasi player alternatif
   - Fallback ke download links

## 📞 **Support**

Jika masalah persisten:
1. Cek log server di terminal
2. Screenshot error message
3. Test dengan debug tools
4. Dokumentasikan langkah reproduksi

---

**AncientNime - Video Streaming Troubleshooting** 🎌🎬
