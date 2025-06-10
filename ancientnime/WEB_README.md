# AncientNime Web Interface

Website frontend yang menggunakan AncientNime REST API untuk menampilkan data anime dalam interface yang user-friendly.

## 🌟 Fitur Website

### ✅ **Homepage**
- Menampilkan anime ongoing dan complete
- Hero section dengan design menarik
- Grid layout responsive

### ✅ **Navigation**
- **Home** - Halaman utama
- **Ongoing** - Daftar anime yang sedang tayang
- **Complete** - Daftar anime yang sudah selesai
- **Schedule** - Jadwal rilis anime per hari
- **Genres** - Daftar genre anime

### ✅ **Search Function**
- Pencarian anime real-time
- Hasil pencarian dengan detail lengkap
- Search by keyword

### ✅ **Anime Detail Modal**
- Detail lengkap anime (sinopsis, studio, score, dll)
- Episode list
- Responsive modal design

### ✅ **Modern UI/UX**
- Gradient background design
- Card-based layout
- Hover animations
- Loading states
- Error handling dengan toast notifications
- Mobile responsive

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js terinstall
- AncientNime API server berjalan di port 3000

### Langkah-langkah:

1. **Pastikan API server berjalan:**
   ```bash
   npm start
   ```

2. **Buka browser dan akses:**
   ```
   http://localhost:3000
   ```

3. **Website siap digunakan!**

## 📁 Struktur File

```
public/
├── index.html      # Main HTML file
├── style.css       # CSS styling
└── script.js       # JavaScript functionality

app.js              # Updated to serve static files
```

## 🎨 Design Features

### **Color Scheme:**
- Primary: `#667eea` (Blue gradient)
- Secondary: `#764ba2` (Purple gradient)
- Background: Linear gradient
- Cards: White with shadow

### **Typography:**
- Font: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- Responsive font sizes
- Clear hierarchy

### **Layout:**
- CSS Grid for anime cards
- Flexbox for navigation
- Responsive breakpoints

## 🔧 API Integration

Website menggunakan fetch API untuk berkomunikasi dengan backend:

```javascript
const API_BASE = 'http://localhost:3000/api';

// Endpoints yang digunakan:
/api/home           # Homepage data
/api/ongoing        # Ongoing anime
/api/complete       # Complete anime
/api/schedule       # Schedule
/api/genres         # Genre list
/api/search/{query} # Search
/api/anime/{id}     # Anime detail
```

## 📱 Responsive Design

- **Desktop:** Full grid layout dengan sidebar
- **Tablet:** Adjusted grid columns
- **Mobile:** Single column, stacked navigation

## ⚡ Performance Features

- **Lazy loading** untuk gambar
- **Error handling** dengan fallback images
- **Loading states** untuk better UX
- **Caching** untuk mengurangi API calls

## 🛠 Customization

### Mengubah Warna:
Edit variabel CSS di `style.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
}
```

### Menambah Fitur:
1. Tambahkan HTML element di `index.html`
2. Tambahkan styling di `style.css`
3. Tambahkan functionality di `script.js`

## 🐛 Troubleshooting

### Website tidak load:
- Pastikan server API berjalan di port 3000
- Check console browser untuk error
- Pastikan file static dapat diakses

### Data tidak muncul:
- Check koneksi internet
- Pastikan API endpoint berfungsi
- Check browser console untuk error

### Gambar tidak muncul:
- Website menggunakan fallback placeholder
- Check URL gambar dari API response

## 🔮 Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Favorites system
- [ ] Watch history
- [ ] Advanced filters
- [ ] Pagination for large lists
- [ ] PWA (Progressive Web App) support
- [ ] Offline mode
- [ ] Social sharing features

## 📄 License

MIT License

---

**AncientNime - Dibuat dengan ❤️ untuk komunitas anime Indonesia**
