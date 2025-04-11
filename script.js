// script.js

// Typing Animation
const professions = ["Web Developer", "Developer", "Web Designer", "Fesnuker", "Script Writer"];
let currentProfession = 0;
const typingElement = document.getElementById('typing');
const cursorElement = document.querySelector('.cursor');

function typeWriter(text, i, cb) {
    if (i < text.length) {
        typingElement.textContent = text.substring(0, i + 1);
        setTimeout(() => typeWriter(text, i + 1, cb), 100);
    } else {
        setTimeout(cb, 1500);
    }
}

function eraseText(cb) {
    const text = typingElement.textContent;
    if (text.length > 0) {
        typingElement.textContent = text.substring(0, text.length - 1);
        setTimeout(() => eraseText(cb), 50);
    } else {
        setTimeout(cb, 500);
    }
}

function typingAnimation() {
    const text = professions[currentProfession];
    typeWriter(text, 0, () => {
        setTimeout(() => {
            eraseText(() => {
                currentProfession = (currentProfession + 1) % professions.length;
                typingAnimation();
            });
        }, 2000);
    });
}

// Cursor blink animation
setInterval(() => {
    cursorElement.style.opacity = cursorElement.style.opacity === '0' ? '1' : '0';
}, 500);

// Navigation functionality
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

// Toggle mobile menu
hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Handle smooth scrolling
        const targetId = link.getAttribute('href');
        if (targetId !== '#') {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }

        // Update active class
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        link.classList.add('active');

        // Close mobile menu
        hamburgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Update active link on scroll
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    
    // Update header style
    const header = document.querySelector('header');
    header.classList.toggle('sticky', scrollPosition > 0);
    
    // Update active nav link
    document.querySelectorAll('section').forEach(section => {
        const sectionId = section.getAttribute('id');
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Section visibility control
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    
    // Fungsi untuk memeriksa visibilitas section
    function checkVisibility() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        sections.forEach(section => {
            const sectionId = section.getAttribute('id');
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            // Jika section berada dalam viewport atau dekat dengan viewport
            if (scrollPosition + windowHeight * 0.7 > sectionTop && 
                scrollPosition < sectionBottom + windowHeight * 0.3) {
                section.classList.remove('section-hidden');
                section.classList.add('section-visible');
            } else {
                // Sembunyikan semua section kecuali yang sedang aktif
                section.classList.remove('section-visible');
                section.classList.add('section-hidden');
            }
        });
        
        // Pastikan section home selalu terlihat jika di atas
        const homeSection = document.getElementById('home');
        if (scrollPosition < windowHeight * 0.5) {
            homeSection.classList.remove('section-hidden');
            homeSection.classList.add('section-visible');
        }
    }
    
    // Panggil fungsi pertama kali
    checkVisibility();
    
    // Tambahkan event listener untuk scroll
    window.addEventListener('scroll', checkVisibility);
    
    // Saat mengklik nav link, pastikan section tujuan terlihat
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Tampilkan section tujuan
                    sections.forEach(s => {
                        s.classList.remove('section-visible');
                        s.classList.add('section-hidden');
                    });
                    
                    targetSection.classList.remove('section-hidden');
                    targetSection.classList.add('section-visible');
                }
            }
        });
    });
});
