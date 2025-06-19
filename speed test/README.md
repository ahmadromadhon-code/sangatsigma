# 🚀 Advanced Internet Speed Test

Aplikasi speed test internet yang canggih dengan akurasi tinggi menggunakan Cloudflare API dan teknologi web modern.

## ✨ Fitur Utama

### 🎯 **Akurasi Tinggi**
- **Multi-endpoint Testing**: Menggunakan beberapa server untuk hasil yang lebih akurat
- **Statistical Analysis**: Menghilangkan outliers menggunakan metode statistik (IQR)
- **Progressive Loading**: Monitoring real-time selama download/upload
- **Multiple File Sizes**: Test dengan berbagai ukuran file untuk akurasi optimal

### 📊 **Metrics Lengkap**
- **Download Speed**: Kecepatan download dalam Mbps
- **Upload Speed**: Kecepatan upload dengan real upload test
- **Ping/Latency**: Latency ke server dengan multiple attempts
- **Jitter**: Variasi ping untuk stabilitas koneksi
- **Connection Type**: Deteksi otomatis jenis koneksi (Fiber, Cable, 4G, dll)

### 🎨 **UI/UX Modern**
- **Responsive Design**: Optimal di desktop dan mobile
- **Real-time Progress**: Progress bar dan speed monitoring
- **Quality Indicators**: Visual feedback berdasarkan kualitas koneksi
- **Loading Animations**: Smooth animations dan transitions

## 🔧 Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **APIs**: Cloudflare Speed Test API, IP Geolocation API
- **Features**: Fetch API, Streams API, XMLHttpRequest, Performance API

## 🚀 Cara Menggunakan

### 1. **Setup**
```bash
# Clone atau download project
cd speed-test

# Start local server
python -m http.server 8000
# atau
npx serve .
```

### 2. **Akses Aplikasi**
Buka browser dan kunjungi: `http://localhost:8000`

### 3. **Jalankan Test**
1. Klik tombol **"Start Test"**
2. Tunggu proses selesai (ping → download → upload)
3. Lihat hasil dan detail koneksi
4. Tekan **ESC** untuk reset manual

## 📈 Metodologi Akurasi

### **Ping Test**
- 5 attempts per endpoint
- 3 different Cloudflare endpoints
- Statistical outlier removal (IQR method)
- Median calculation untuk hasil stabil

### **Download Test**
- Progressive file sizes: 1MB → 5MB → 10MB → 25MB
- Real-time speed monitoring setiap 200ms
- Stable speed calculation (remove first 20% dan last 10%)
- Median dari multiple tests

### **Upload Test**
- Real upload menggunakan XMLHttpRequest
- Multiple endpoints untuk reliability
- Progress monitoring dengan upload events
- Fallback ke intelligent estimation

## 🎯 Akurasi vs Speed Test Lain

| Fitur | Speed Test Ini | Speedtest.net | Fast.com |
|-------|---------------|---------------|----------|
| Multi-endpoint | ✅ | ✅ | ❌ |
| Statistical Analysis | ✅ | ❌ | ❌ |
| Real-time Monitoring | ✅ | ✅ | ❌ |
| Jitter Calculation | ✅ | ✅ | ❌ |
| Connection Detection | ✅ | ✅ | ❌ |
| Open Source | ✅ | ❌ | ❌ |

## 🔍 Detail Teknis

### **Error Handling**
- Network timeout handling
- Graceful fallbacks
- User-friendly error messages
- Detailed logging untuk debugging

### **Performance Optimizations**
- Efficient memory usage
- Stream processing untuk large files
- Abort controllers untuk timeout
- Progressive enhancement

### **Browser Compatibility**
- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+)
- Mobile browsers support
- Progressive Web App ready

## 🛠️ Customization

### **Endpoints**
Ubah endpoints di `script.js`:
```javascript
const endpoints = [
  'https://speed.cloudflare.com/__down?bytes=',
  'https://your-custom-endpoint.com/test'
];
```

### **Test Parameters**
Sesuaikan ukuran file dan durasi:
```javascript
const testConfigs = [
  { size: 1000000, duration: 3 },   // 1MB, 3s
  { size: 5000000, duration: 5 },   // 5MB, 5s
  // tambah konfigurasi lain
];
```

## 📱 Mobile Optimization

- Touch-friendly interface
- Optimized untuk bandwidth mobile
- Adaptive test sizes berdasarkan koneksi
- Battery-efficient algorithms

## 🔒 Privacy & Security

- Tidak menyimpan data personal
- Tidak tracking user behavior
- Local processing only
- HTTPS endpoints only

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - bebas digunakan untuk personal dan komersial.

## 🙏 Credits

- **Cloudflare** untuk speed test API
- **Font Awesome** untuk icons
- **IP API** untuk geolocation

---

**Dibuat dengan ❤️ untuk akurasi speed test yang lebih baik**
