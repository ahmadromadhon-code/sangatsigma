# 📱 Panduan Akses Mobile - AncientNime

## 🔧 **Perbaikan yang Sudah Diterapkan**

### **1. Enhanced CORS Configuration**
- ✅ CORS headers yang lebih lengkap untuk mobile
- ✅ Support untuk semua HTTP methods
- ✅ Preflight request handling

### **2. Mobile-Friendly API Calls**
- ✅ Auto-detect IP address untuk mobile access
- ✅ Timeout yang lebih panjang (20 detik)
- ✅ Better error handling dengan emoji dan pesan Indonesia
- ✅ Network status monitoring

### **3. Network Status Indicator**
- ✅ Real-time connection monitoring
- ✅ Visual indicator saat koneksi bermasalah
- ✅ Auto-retry mechanism

## 📋 **Cara Mengakses dari Mobile**

### **Step 1: Cek IP Address Laptop**
```bash
ipconfig | findstr "IPv4"
```
Contoh output: `192.168.1.10`

### **Step 2: Pastikan Firewall Mengizinkan**
- Windows Firewall harus allow port 3002
- Atau disable Windows Firewall sementara

### **Step 3: Akses dari Mobile**
Buka browser di HP dan ketik:
```
http://192.168.1.10:3002
```
(Ganti dengan IP address laptop Anda)

## 🔍 **Troubleshooting Mobile Issues**

### **Error: "Gagal memuat data anime"**

**Kemungkinan Penyebab:**
1. **IP Address Salah** - Pastikan IP laptop benar
2. **Firewall Blocking** - Allow port 3002 di Windows Firewall
3. **WiFi Berbeda** - HP dan laptop harus di WiFi yang sama
4. **Server Tidak Jalan** - Pastikan `npm start` masih berjalan

**Solusi:**
```bash
# 1. Cek IP address lagi
ipconfig | findstr "IPv4"

# 2. Test dari laptop dulu
curl http://localhost:3002/api/home

# 3. Test dari IP address
curl http://192.168.1.10:3002/api/home

# 4. Allow firewall (run as admin)
netsh advfirewall firewall add rule name="AncientNime" dir=in action=allow protocol=TCP localport=3002
```

### **Network Status Indicator**
- 🔴 **Red Bar**: Tidak bisa connect ke server
- 🟢 **Green Bar**: Koneksi restored
- **No Bar**: Koneksi normal

## 🚀 **Features yang Sudah Diperbaiki**

### **Auto IP Detection**
Website otomatis detect IP address:
- Jika akses via `localhost` → gunakan localhost
- Jika akses via IP → gunakan IP yang sama untuk API

### **Mobile Error Messages**
- ⏱️ Request timeout - Periksa koneksi internet
- 🌐 Network error - Pastikan WiFi sama
- 🔒 CORS error - Masalah server config
- ❌ General error dengan detail

### **Enhanced Fetch Options**
```javascript
{
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
}
```

## 📊 **Debug Information**
Website sekarang menampilkan debug info di console:
- 🌐 API Base URL
- 📱 User Agent detection
- 🔗 Current URL
- 📱 Mobile device detection

## ✅ **Testing Checklist**

1. **Server Running**: `npm start` berhasil
2. **Laptop Access**: `http://localhost:3002` bisa dibuka
3. **IP Access**: `http://192.168.1.10:3002` bisa dibuka
4. **Mobile Access**: Buka dari HP dengan IP yang sama
5. **API Working**: Data anime muncul di mobile

## 🔧 **Advanced Troubleshooting**

### **Jika Masih Error di Mobile:**

1. **Cek Console Browser Mobile**
   - Buka Developer Tools di Chrome mobile
   - Lihat error message di Console tab

2. **Test API Endpoint Manual**
   ```
   http://192.168.1.10:3002/api/home
   ```

3. **Restart Network Stack**
   ```bash
   # Di laptop (run as admin)
   ipconfig /release
   ipconfig /renew
   ipconfig /flushdns
   ```

4. **Alternative: Use ngrok**
   ```bash
   npm install -g ngrok
   ngrok http 3002
   ```
   Kemudian akses URL ngrok dari mobile.

## 📞 **Support**
Jika masih bermasalah, cek:
- Console browser untuk error details
- Network tab untuk failed requests
- Server logs untuk API errors
