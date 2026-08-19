// ===== Biến toàn cục =====
let currentQR = null;

// ===== Xử lý menu mobile =====
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Đóng menu khi click vào link
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===== Chuyển tab =====
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Cập nhật active button
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Hiển thị tab content tương ứng
        tabContents.forEach(content => content.classList.remove('active'));
        const tabId = btn.getAttribute('data-tab');
        document.getElementById('tab-' + tabId).classList.add('active');
        // Ẩn kết quả QR khi chuyển tab
        document.getElementById('qrResult').classList.remove('show');
    });
});

// ===== Hàm tạo QR =====
function createQR(content) {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = ''; // Xóa QR cũ
    currentQR = new QRCode(qrContainer, {
        text: content,
        width: 220,
        height: 220,
        colorDark: '#2C3E50',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.H
    });
    document.getElementById('qrResult').classList.add('show');
    document.getElementById('qrUrl').textContent = 'Nội dung: ' + content;
}

// ===== Tạo QR từ Văn bản =====
function generateTextQR() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        showAlert('Vui lòng nhập văn bản.');
        return;
    }
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedData = encodeURIComponent(text);
    const url = `${baseUrl}#type=text&data=${encodedData}`;
    createQR(url);
}

// ===== Tạo QR từ Hình ảnh =====
function generateImageQR() {
    const imageUrl = document.getElementById('imageUrl').value.trim();
    if (!imageUrl) {
        showAlert('Vui lòng nhập URL hình ảnh.');
        return;
    }
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedSrc = encodeURIComponent(imageUrl);
    const url = `${baseUrl}#type=image&src=${encodedSrc}`;
    createQR(url);
}

// ===== Tạo QR từ Video =====
function generateVideoQR() {
    const videoUrl = document.getElementById('videoUrl').value.trim();
    if (!videoUrl) {
        showAlert('Vui lòng nhập URL video.');
        return;
    }
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedSrc = encodeURIComponent(videoUrl);
    const url = `${baseUrl}#type=video&src=${encodedSrc}`;
    createQR(url);
}

// ===== Tạo QR từ Cards Info =====
function generateCardQR() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const company = document.getElementById('company').value.trim();
    const position = document.getElementById('position').value.trim();
    const website = document.getElementById('website').value.trim();

    if (!fullName) {
        showAlert('Vui lòng nhập ít nhất họ tên.');
        return;
    }

    // Tạo object chứa thông tin
    const cardData = {
        fullName,
        phone,
        email,
        company,
        position,
        website
    };

    // Tạo URL với hash để mở trang hiển thị card
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedData = encodeURIComponent(JSON.stringify(cardData));
    const url = `${baseUrl}#type=card&data=${encodedData}`;
    createQR(url);
}

// ===== Tải QR xuống PNG =====
function downloadQR() {
    const qrContainer = document.getElementById('qrcode');
    const img = qrContainer.querySelector('img');
    if (!img) {
        showAlert('Chưa có mã QR để tải.');
        return;
    }
    const link = document.createElement('a');
    link.href = img.src;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== Hiển thị thông báo nhỏ =====
function showAlert(message) {
    // Có thể thay bằng toast hoặc alert đơn giản
    alert(message);
}

// ===== Xử lý hiển thị khi quét mã =====
function parseHashAndDisplay() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const displayOverlay = document.getElementById('displayOverlay');
    const displayContent = document.getElementById('displayContent');

    if (type === 'text') {
        const data = params.get('data');
        if (data) {
            displayContent.innerHTML = `<div class="display-text">${escapeHtml(decodeURIComponent(data))}</div>`;
            showOverlay();
        }
    } else if (type === 'image') {
        const src = params.get('src');
        if (src) {
            displayContent.innerHTML = `<img src="${decodeURIComponent(src)}" class="display-image" alt="Hình ảnh">`;
            showOverlay();
        }
    } else if (type === 'video') {
        const src = params.get('src');
        if (src) {
            const decodedSrc = decodeURIComponent(src);
            let videoHtml = '';
            if (decodedSrc.includes('youtube.com') || decodedSrc.includes('youtu.be')) {
                const videoId = extractYouTubeId(decodedSrc);
                if (videoId) {
                    videoHtml = `<iframe class="display-video" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="width:100%; height:500px;"></iframe>`;
                } else {
                    videoHtml = `<p>Không thể nhận diện video YouTube.</p>`;
                }
            } else if (decodedSrc.includes('vimeo.com')) {
                const vimeoId = extractVimeoId(decodedSrc);
                if (vimeoId) {
                    videoHtml = `<iframe class="display-video" src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allowfullscreen style="width:100%; height:500px;"></iframe>`;
                }
            } else {
                videoHtml = `<video class="display-video" controls autoplay><source src="${decodedSrc}" type="video/mp4">Trình duyệt không hỗ trợ video.</video>`;
            }
            displayContent.innerHTML = videoHtml;
            showOverlay();
        }
    } else if (type === 'card') {
        const data = params.get('data');
        if (data) {
            try {
                const cardData = JSON.parse(decodeURIComponent(data));
                const cardHtml = `
                    <div class="card-info" style="background:#F8FAFC; padding:40px; border-radius:16px; border:1px solid #E1E8ED; text-align:left; max-width:500px; margin:0 auto; box-shadow:0 8px 30px rgba(0,0,0,0.08);">
                        <div style="text-align:center; margin-bottom:20px;">
                            <i class="fas fa-id-card" style="font-size:3rem; color:#4A90E2;"></i>
                        </div>
                        <h2 style="text-align:center; margin-bottom:20px;">${escapeHtml(cardData.fullName)}</h2>
                        ${cardData.position ? `<p><strong><i class="fas fa-briefcase"></i> Chức vụ:</strong> ${escapeHtml(cardData.position)}</p>` : ''}
                        ${cardData.company ? `<p><strong><i class="fas fa-building"></i> Công ty:</strong> ${escapeHtml(cardData.company)}</p>` : ''}
                        ${cardData.phone ? `<p><strong><i class="fas fa-phone"></i> Điện thoại:</strong> ${escapeHtml(cardData.phone)}</p>` : ''}
                        ${cardData.email ? `<p><strong><i class="fas fa-envelope"></i> Email:</strong> ${escapeHtml(cardData.email)}</p>` : ''}
                        ${cardData.website ? `<p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${escapeHtml(cardData.website)}" target="_blank">${escapeHtml(cardData.website)}</a></p>` : ''}
                        <button onclick="downloadVCard('${escapeHtml(JSON.stringify(cardData))}')" style="margin-top:20px; padding:10px 25px; background:#28a745; color:#fff; border:none; border-radius:50px; cursor:pointer; font-family:'Poppins',sans-serif;">
                            <i class="fas fa-download"></i> Lưu danh bạ
                        </button>
                    </div>
                `;
                displayContent.innerHTML = cardHtml;
                showOverlay();
            } catch (e) {
                displayContent.innerHTML = `<p>Không thể đọc dữ liệu card.</p>`;
                showOverlay();
            }
        }
    }

    // Hiển thị nút quay lại trong menu
    document.getElementById('resetDisplayLink').style.display = 'inline';
}

function showOverlay() {
    document.getElementById('displayOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDisplay() {
    document.getElementById('displayOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('resetDisplayLink').style.display = 'none';
}

// ===== Tải vCard =====
function downloadVCard(cardDataJson) {
    try {
        const cardData = JSON.parse(cardDataJson);
        let vCard = 'BEGIN:VCARD\nVERSION:3.0\n';
        vCard += `FN:${cardData.fullName}\n`;
        if (cardData.phone) vCard += `TEL;TYPE=CELL:${cardData.phone}\n`;
        if (cardData.email) vCard += `EMAIL:${cardData.email}\n`;
        if (cardData.company) vCard += `ORG:${cardData.company}\n`;
        if (cardData.position) vCard += `TITLE:${cardData.position}\n`;
        if (cardData.website) vCard += `URL:${cardData.website}\n`;
        vCard += 'END:VCARD';

        const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${cardData.fullName}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        alert('Không thể tải vCard.');
    }
}

// ===== Hàm escape HTML =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Trích xuất YouTube ID =====
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// ===== Trích xuất Vimeo ID =====
function extractVimeoId(url) {
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

// ===== Sự kiện nút "Quay lại" =====
document.getElementById('resetDisplayLink').addEventListener('click', function(e) {
    e.preventDefault();
    closeDisplay();
    // Xóa hash
    if (window.location.hash) {
        history.pushState('', document.title, window.location.pathname + window.location.search);
    }
});

// ===== Kiểm tra hash khi tải trang =====
window.addEventListener('load', parseHashAndDisplay);

// ===== Khi hash thay đổi =====
window.addEventListener('hashchange', () => {
    closeDisplay();
    parseHashAndDisplay();
});
