const imageInput = document.getElementById('imageInput');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');
const buttonArea = document.getElementById('buttonArea'); // Area untuk tombol
const removeButton = document.getElementById('removeButton');
const removeIcon = document.getElementById('removeIcon');
const removeText = document.getElementById('removeText');
const resultArea = document.getElementById('resultArea');
const resultImage = document.getElementById('resultImage');
const downloadLink = document.getElementById('downloadLink');
const errorArea = document.getElementById('errorArea');
const errorMessage = document.getElementById('errorMessage');

// !!! GANTI DENGAN API KEY ANDA DARI REMOVE.BG !!!
const apiKey = 'ocz4E91KePiFyQbws4CSWqUE'; // <-- PENTING: Masukkan API Key Anda di sini

// Fungsi untuk menampilkan/menyembunyikan elemen menggunakan kelas 'hidden' Tailwind
const showElement = (element) => element.classList.remove('hidden');
const hideElement = (element) => element.classList.add('hidden');

// Fungsi untuk mengatur status loading pada tombol
const setLoading = (isLoading) => {
    if (isLoading) {
        removeButton.disabled = true;
        removeIcon.classList.remove('fa-magic');
        removeIcon.classList.add('fa-spinner', 'spin'); // Tambahkan ikon spinner dan animasi
        removeText.textContent = 'Memproses...';
    } else {
        removeButton.disabled = false;
        removeIcon.classList.remove('fa-spinner', 'spin');
        removeIcon.classList.add('fa-magic');
        removeText.textContent = 'Hapus Latar Belakang';
    }
};

// Fungsi untuk menampilkan pesan error
const showError = (message) => {
    errorMessage.textContent = message;
    showElement(errorArea);
}

// Fungsi untuk menyembunyikan pesan error
const hideError = () => {
    hideElement(errorArea);
    errorMessage.textContent = '';
}

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    hideError(); // Sembunyikan error sebelumnya
    hideElement(resultArea); // Sembunyikan hasil sebelumnya
    hideElement(downloadLink); // Sembunyikan link download sebelumnya

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            showElement(previewArea); // Tampilkan area pratinjau
            showElement(buttonArea); // Tampilkan area tombol
            hideElement(resultArea); // Pastikan hasil disembunyikan
            hideElement(downloadLink); // Pastikan link download disembunyikan
        }
        reader.readAsDataURL(file);
    } else {
        // Jika tidak ada file dipilih (misalnya user cancel)
        hideElement(previewArea);
        hideElement(buttonArea);
    }
});

removeButton.addEventListener('click', () => {
    const file = imageInput.files[0];
    hideError(); // Sembunyikan error sebelumnya

    if (!apiKey || apiKey === 'ganti_dengan_api_key_remove_bg_anda') {
         showError('Kesalahan: API Key Remove.bg belum diatur dalam file script.js.');
         return; // Hentikan proses jika API Key belum ada
    }

    if (file) {
        setLoading(true); // Aktifkan status loading
        hideElement(resultArea); // Sembunyikan hasil sebelumnya
        hideElement(downloadLink); // Sembunyikan link download sebelumnya

        const formData = new FormData();
        formData.append('image_file', file);
        formData.append('size', 'auto'); // atau 'preview', 'medium', 'hd', '4k' tergantung kebutuhan dan kredit API Anda

        fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                // Coba baca error dari response jika ada (remove.bg mengirim error sbg JSON)
                return response.json().then(errData => {
                    // Cari pesan error yang relevan
                    const errorMsg = errData?.errors?.[0]?.title || `HTTP error! status: ${response.status}`;
                    throw new Error(errorMsg);
                }).catch(() => {
                    // Jika gagal parse JSON error, lempar error HTTP biasa
                     throw new Error(`HTTP error! status: ${response.status}`);
                });
            }
            return response.blob(); // Jika sukses, kembalikan sebagai blob
        })
        .then(blob => {
            const resultUrl = URL.createObjectURL(blob);
            resultImage.src = resultUrl;
            downloadLink.href = resultUrl;
            showElement(resultArea); // Tampilkan area hasil
            showElement(downloadLink); // Tampilkan tombol download
            hideElement(previewArea); // Sembunyikan pratinjau setelah hasil muncul
        })
        .catch(error => {
            console.error('Error:', error);
            showError(`Terjadi kesalahan: ${error.message}`);
        })
        .finally(() => {
            setLoading(false); // Matikan status loading baik sukses maupun gagal
        });
    } else {
        showError('Silakan pilih gambar terlebih dahulu.');
    }
});

// Inisialisasi awal: sembunyikan elemen yang tidak perlu
document.addEventListener('DOMContentLoaded', () => {
    hideElement(previewArea);
    hideElement(buttonArea);
    hideElement(resultArea);
    hideElement(downloadLink);
    hideElement(errorArea);
});