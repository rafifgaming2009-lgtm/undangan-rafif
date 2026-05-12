// =========================================================================
// 1. KONFIGURASI UTAMA DATABASE (GOOGLE SHEETS)
// =========================================================================
// SALIN URL "APLIKASI WEB" DARI GOOGLE APPS SCRIPT ANDA DAN TEMPEL DI BAWAH INI
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx1I3ewA01cDoxH-p6TB3lGxmA0CmSQzIJFkxl4JPmpToOZHhhSYm9Ycf7OmZfCyywUsA/exec";

// Fungsi untuk mengambil data dari Google Sheets dan menampilkannya ke semua perangkat
function loadGuestList() {
    const guestList = document.getElementById('guestList');
    
    // Cegah fetch berjalan jika URL belum diganti oleh pengguna
    if (SCRIPT_URL === "GANTI_DENGAN_URL_WEB_APP_ANDA") {
        console.warn("Peringatan: SCRIPT_URL belum dikonfigurasi dengan URL Google Apps Script.");
        return;
    }

    fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
        guestList.innerHTML = ''; // Kosongkan daftar sebelum dimuat ulang
        data.forEach(guest => {
            const newGuest = document.createElement('li');
            const status = guest.attendance === 'hadir' ? '✅ Hadir' : '❌ Tidak Hadir';
            newGuest.innerHTML = `<strong>${guest.name}</strong> - ${status}`;
            guestList.appendChild(newGuest);
        });
    })
    .catch(error => console.error('Gagal memuat daftar tamu dari database:', error));
}

// =========================================================================
// 2. LOGIKA UTAMA FORM RSVP (KIRIM DATA & VALIDASI KE GOOGLE SHEETS)
// =========================================================================
document.getElementById('rsvpForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const attendance = document.getElementById('attendance').value;

    if (attendance === '') {
        alert('Silakan pilih apakah Anda akan hadir atau tidak.');
        return;
    }

    if (SCRIPT_URL === "GANTI_DENGAN_URL_WEB_APP_ANDA") {
        alert('Gagal mengirim! Pengembang belum memasukkan URL Google Apps Script pada file script.js.');
        return;
    }

    const newGuestData = {
        name: name,
        email: email,
        attendance: attendance
    };

    // Mengubah teks tombol saat proses pengiriman data sedang berlangsung
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Mengirim...";
    submitBtn.disabled = true;

    // Mengirim data ke Google Sheets menggunakan Fetch API secara online
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(newGuestData)
    })
    .then(response => response.json())
    .then(result => {
        // Balasan dari Apps Script jika validasi email ganda terpenuhi
        if (result.result === 'exists') {
            alert('Email ini sudah pernah mengisi formulir RSVP!');
            return;
        }
        
        if (result.result === 'success') {
            // Perbarui tampilan daftar tamu di semua perangkat layar secara online
            loadGuestList();

            // --- BAGIAN MUNCULIN GIF MODAL ---
            const modal = document.getElementById('thankYouModal');
            modal.style.display = 'block'; 

            document.getElementById('closeModal').onclick = function() {
                modal.style.display = 'none';
            }

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
            // ---------------------------------
            
            document.getElementById('rsvpForm').reset();
        } else {
            alert('Terjadi kesalahan pada sistem database, coba lagi nanti.');
        }
    })
    .catch(error => {
        console.error('Error saat mengirim data:', error);
        alert('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    })
    .finally(() => {
        // Mengembalikan status tombol kirim ke semula
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    });
});

// =========================================================================
// 3. FITUR ANIMASI SCROLL (INTERSECTION OBSERVER)
// =========================================================================
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.event-details, .rsvp, .couple').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// =========================================================================
// 4. LOGIKA HITUNG MUNDUR (COUNTDOWN)
// =========================================================================
function updateCountdown() {
    const targetDate = new Date('November 26, 2026 08:00:00').getTime();
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById('countdown').innerHTML = "<h4>Acara Dimulai!</h4>";
        return;
    }

    const msInSecond = 1000;
    const msInMinute = 60 * msInSecond;
    const msInHour = 60 * msInMinute;
    const msInDay = 24 * msInHour;
    const msInMonth = 30.44 * msInDay;

    const months = Math.floor(diff / msInMonth);
    const days = Math.floor((diff % msInMonth) / msInDay);
    const hours = Math.floor((diff % msInDay) / msInHour);
    const minutes = Math.floor((diff % msInHour) / msInMinute);
    const seconds = Math.floor((diff % msInMinute) / msInSecond);

    document.getElementById('months').innerText = months;
    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours;
    document.getElementById('minutes').innerText = minutes;
    document.getElementById('seconds').innerText = seconds;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// =========================================================================
// 5. KONTROL AUDIO & OVERLAY UTAMA
// =========================================================================
const audio = document.getElementById('myAudio');
const startBtn = document.getElementById('startButton');
const overlay = document.getElementById('overlay');
const musicBtn = document.getElementById('musicControl');
const musicIcon = document.getElementById('musicIcon');

startBtn.addEventListener('click', () => {
    audio.play().catch(err => console.log("Playback dicegah oleh browser:", err));
    overlay.style.display = 'none';
});

musicBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        musicIcon.innerText = '🎵';
    } else {
        audio.pause();
        musicIcon.innerText = '🔇';
    }
});

// =========================================================================
// 6. INISIALISASI AWAL SAAT WEB DIBUKA
// =========================================================================
// Langsung panggil fungsi ini agar daftar tamu online langsung termuat secara sinkron di perangkat manapun
loadGuestList();
