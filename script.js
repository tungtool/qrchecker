// ===== Biến toàn cục =====
let currentQR = null;
let currentCardData = null;
let imageDataUrl = null; // lưu ảnh từ file
let avatarDataUrl = null; // lưu avatar từ file

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

// ===== Chuyển tab từ menu hoặc nút hero =====
function switchTab(tabId) {
    // Cập nhật active button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    // Hiển thị tab content tương ứng
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('tab-' + tabId).classList.add('active');
    // Ẩn kết quả QR
    document.getElementById('qrResult').classList.remove('show');
}

// Gán sự kiện cho các link trong nav có data-tab
document.querySelectorAll('.nav a[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');
        // Cuộn tới phần generator
        document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
        switchTab(tabId);
    });
});

// Gán sự kiện cho các nút hero
document.querySelectorAll('.hero-buttons .btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = btn.getAttribute('data-tab');
        document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
        switchTab(tabId);
    });
});

// Tab buttons trong generator
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchTab(tabId);
    });
});

// ===== Hàm tạo QR =====
function createQR(content) {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    try {
        currentQR = new QRCode(qrContainer, {
            text: content,
            width: 220,
            height: 220,
            colorDark: '#2C3E50',
            colorLight: '#FFFFFF',
            correctLevel: QRCode.CorrectLevel.H
        });
        document.getElementById('qrResult').classList.add('show');
    } catch (e) {
        alert('Nội dung quá lớn để tạo mã QR. Vui lòng giảm kích thước hoặc dùng URL thay vì file.');
        document.getElementById('qrResult').classList.remove('show');
    }
}

// ===== Tạo QR từ Văn bản =====
function generateTextQR() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        alert('Vui lòng nhập văn bản.');
        return;
    }
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedData = encodeURIComponent(text);
    const url = `${baseUrl}#type=text&data=${encodedData}`;
    createQR(url);
}

// ===== Xử lý file ảnh =====
function handleImageFile() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        imageDataUrl = e.target.result;
        // Hiển thị preview
        const previewDiv = document.getElementById('imagePreview');
        const previewImg = document.getElementById('imagePreviewImg');
        previewImg.src = imageDataUrl;
        previewDiv.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// ===== Tạo QR từ Hình ảnh =====
function generateImageQR() {
    let imageSrc = '';
    if (imageDataUrl) {
        // Kiểm tra kích thước base64 (ước lượng byte)
        const base64 = imageDataUrl.split(',')[1];
        const byteSize = base64.length * 3 / 4;
        if (byteSize > 2000) {
            alert('Ảnh quá lớn để nhúng vào QR (tối đa ~2KB). Vui lòng dùng URL ảnh hoặc ảnh nhỏ hơn.');
            return;
        }
        imageSrc = imageDataUrl;
    } else {
        const imageUrl = document.getElementById('imageUrl').value.trim();
        if (!imageUrl) {
            alert('Vui lòng chọn ảnh hoặc nhập URL ảnh.');
            return;
        }
        imageSrc = imageUrl;
    }
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedSrc = encodeURIComponent(imageSrc);
    const url = `${baseUrl}#type=image&src=${encodedSrc}`;
    createQR(url);
}

// ===== Xử lý file video =====
function handleVideoFile() {
    const fileInput = document.getElementById('videoFile');
    const file = fileInput.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const previewDiv = document.getElementById('videoPreview');
    const previewPlayer = document.getElementById('videoPreviewPlayer');
    previewPlayer.src = objectUrl;
    previewDiv.style.display = 'block';
    alert('Video đã tải lên để xem trước, nhưng không thể tạo mã QR từ file local. Vui lòng tải video lên hosting và dùng URL.');
}

// ===== Tạo QR từ Video =====
function generateVideoQR() {
    const videoUrl = document.getElementById('videoUrl').value.trim();
    if (!videoUrl) {
        alert('Vui lòng nhập URL video (không hỗ trợ file local).');
        return;
    }
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedSrc = encodeURIComponent(videoUrl);
    const url = `${baseUrl}#type=video&src=${encodedSrc}`;
    createQR(url);
}

// ===== Xử lý file avatar =====
function handleAvatarFile() {
    const fileInput = document.getElementById('avatarFile');
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        avatarDataUrl = e.target.result;
    };
    reader.readAsDataURL(file);
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
        alert('Vui lòng nhập ít nhất họ tên.');
        return;
    }

    const cardData = {
        fullName,
        phone,
        email,
        company,
        position,
        website,
        avatar: avatarDataUrl || ''
    };

    // Kiểm tra kích thước avatar nếu có
    if (avatarDataUrl) {
        const base64 = avatarDataUrl.split(',')[1];
        const byteSize = base64.length * 3 / 4;
        if (byteSize > 2000) {
            alert('Ảnh đại diện quá lớn (tối đa 2KB). Vui lòng chọn ảnh nhỏ hơn hoặc bỏ qua avatar.');
            return;
        }
    }

    currentCardData = cardData;

    const baseUrl = window.location.origin + window.location.pathname;
    const encodedData = encodeURIComponent(JSON.stringify(cardData));
    const url = `${baseUrl}#type=card&data=${encodedData}`;
    createQR(url);
}

// ===== Tạo QR từ Quyên góp =====
function generateDonationQR() {
    const name = document.getElementById('donationName').value.trim();
    const account = document.getElementById('donationAccount').value.trim();
    const amount = document.getElementById('donationAmount').value.trim();
    const message = document.getElementById('donationMessage').value.trim();

    if (!name || !account) {
        alert('Vui lòng nhập tên tài khoản và số tài khoản.');
        return;
    }

    const amountNum = Number(amount);
    if (amountNum < 1000 || amountNum > 500000) {
        alert('Số tiền phải từ 1.000 đến 500.000 VNĐ.');
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
        name: name,
        account: account,
        amount: amountNum.toString(),
        message: message
    });
    const url = `${baseUrl}#type=donation&${params.toString()}`;
    createQR(url);
}

// ===== Tải QR xuống PNG =====
function downloadQR() {
    const qrContainer = document.getElementById('qrcode');
    const img = qrContainer.querySelector('img');
    if (!img) {
        alert('Chưa có mã QR để tải.');
        return;
    }
    const link = document.createElement('a');
    link.href = img.src;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            const decodedSrc = decodeURIComponent(src);
            displayContent.innerHTML = `<img src="${decodedSrc}" class="display-image" alt="Hình ảnh">`;
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
                currentCardData = cardData;
                const avatarHtml = cardData.avatar ? `<img src="${cardData.avatar}" style="max-width:100px; border-radius:50%; margin-bottom:15px;">` : '';
                const cardHtml = `
                    <div class="card-info">
                        <div style="text-align:center; margin-bottom:20px;">
                            ${avatarHtml}
                        </div>
                        <h2>${escapeHtml(cardData.fullName)}</h2>
                        ${cardData.position ? `<p><strong><i class="fas fa-briefcase"></i> Chức vụ:</strong> ${escapeHtml(cardData.position)}</p>` : ''}
                        ${cardData.company ? `<p><strong><i class="fas fa-building"></i> Công ty:</strong> ${escapeHtml(cardData.company)}</p>` : ''}
                        ${cardData.phone ? `<p><strong><i class="fas fa-phone"></i> Điện thoại:</strong> ${escapeHtml(cardData.phone)}</p>` : ''}
                        ${cardData.email ? `<p><strong><i class="fas fa-envelope"></i> Email:</strong> ${escapeHtml(cardData.email)}</p>` : ''}
                        ${cardData.website ? `<p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${escapeHtml(cardData.website)}" target="_blank">${escapeHtml(cardData.website)}</a></p>` : ''}
                        <div style="text-align:center; margin-top:20px;">
                            <button class="btn-copy" onclick="downloadVCard()"><i class="fas fa-download"></i> Lưu danh bạ</button>
                        </div>
                    </div>
                `;
                displayContent.innerHTML = cardHtml;
                showOverlay();
            } catch (e) {
                displayContent.innerHTML = `<p>Không thể đọc dữ liệu card.</p>`;
                showOverlay();
            }
        }
    } else if (type === 'donation') {
        const name = params.get('name');
        const account = params.get('account');
        const amount = params.get('amount');
        const message = params.get('message');

        if (name && account) {
            const donationHtml = `
                <div class="donation-info">
                    <div style="text-align:center; margin-bottom:20px;">
                        <i class="fas fa-hand-holding-heart" style="font-size:3rem; color:#e74c3c;"></i>
                    </div>
                    <h2>Ủng hộ từ thiện</h2>
                    <p><strong><i class="fas fa-user"></i> Tên tài khoản:</strong> ${escapeHtml(name)}</p>
                    <p><strong><i class="fas fa-credit-card"></i> Số tài khoản:</strong> <span id="accountNumber">${escapeHtml(account)}</span></p>
                    <p><strong><i class="fas fa-money-bill-wave"></i> Số tiền:</strong> ${Number(amount).toLocaleString('vi-VN')} VNĐ</p>
                    ${message ? `<p><strong><i class="fas fa-comment"></i> Nội dung:</strong> ${escapeHtml(message)}</p>` : ''}
                    <div style="text-align:center; margin-top:20px;">
                        <button class="btn-copy" onclick="copyAccountNumber()"><i class="fas fa-copy"></i> Sao chép STK</button>
                    </div>
                </div>
            `;
            displayContent.innerHTML = donationHtml;
            showOverlay();
        } else {
            displayContent.innerHTML = `<p>Thông tin quyên góp không đầy đủ.</p>`;
            showOverlay();
        }
    }

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
function downloadVCard() {
    if (!currentCardData) return;
    const cardData = currentCardData;
    let vCard = 'BEGIN:VCARD\nVERSION:3.0\n';
    vCard += `FN:${cardData.fullName}\n`;
    if (cardData.phone) vCard += `TEL;TYPE=CELL:${cardData.phone}\n`;
    if (cardData.email) vCard += `EMAIL:${cardData.email}\n`;
    if (cardData.company) vCard += `ORG:${cardData.company}\n`;
    if (cardData.position) vCard += `TITLE:${cardData.position}\n`;
    if (cardData.website) vCard += `URL:${cardData.website}\n`;
    if (cardData.avatar) vCard += `PHOTO;ENCODING=b;TYPE=JPEG:${cardData.avatar.split(',')[1]}\n`;
    vCard += 'END:VCARD';

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${cardData.fullName}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== Sao chép STK =====
function copyAccountNumber() {
    const accountElement = document.getElementById('accountNumber');
    if (!accountElement) return;
    const account = accountElement.textContent;
    navigator.clipboard.writeText(account).then(() => {
        alert('Đã sao chép số tài khoản!');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = account;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Đã sao chép số tài khoản!');
    });
}

// ===== Helper =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function extractVimeoId(url) {
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

// ===== Sự kiện nút "Quay lại" =====
document.getElementById('resetDisplayLink').addEventListener('click', function(e) {
    e.preventDefault();
    closeDisplay();
    if (window.location.hash) {
        history.pushState('', document.title, window.location.pathname + window.location.search);
    }
});

// ===== Khởi động =====
window.addEventListener('load', () => {
    // Mặc định pre-fill tên quyên góp
    document.getElementById('donationName').value = 'Vũ Mạnh Tùng';
    parseHashAndDisplay();
});

window.addEventListener('hashchange', () => {
    closeDisplay();
    parseHashAndDisplay();
});
