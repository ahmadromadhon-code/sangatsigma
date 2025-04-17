const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const removeButton = document.getElementById('removeButton');
const resultImage = document.getElementById('resultImage');
const downloadLink = document.getElementById('downloadLink');

const apiKey = 'ocz4E91KePiFyQbws4CSWqUE'; 

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        previewImage.src = URL.createObjectURL(file);
    }
});

removeButton.addEventListener('click', () => {
    const file = imageInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image_file', file);
        formData.append('size', 'auto');

        fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
        })
        .then(response => response.blob())
        .then(blob => {
            resultImage.src = URL.createObjectURL(blob);
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menghapus latar belakang.');
        });
    } else {
        alert('Silakan pilih gambar terlebih dahulu.');
    }
});