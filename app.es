// Global State
let currentImage = null;
let processedImage = null;
let history = [];
let undoStack = [];
let redoStack = [];
let isProcessing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    loadHistory();
    updatePrompt();
});

// Particle Background
function createParticles() {
    const bg = document.getElementById('particleBg');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 20) + 's';
        bg.appendChild(particle);
    }
}

// File Upload
function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImage = e.target.result;
            document.getElementById('beforeImage').src = currentImage;
            document.getElementById('sliderBeforeImage').src = currentImage;
            document.getElementById('previewSection').style.display = 'block';
            processedImage = currentImage;
            document.getElementById('afterImage').src = currentImage;
            undoStack = [];
            redoStack = [];
        };
        reader.readAsDataURL(file);
    }
}

// Enhance Image
function enhanceImage() {
    if (!currentImage) return;
    
    isProcessing = true;
    document.getElementById('progressContainer').classList.add('active');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
        
        if (progress === 100) {
            clearInterval(interval);
            undoStack.push(processedImage);
            processedImage = currentImage;
            document.getElementById('afterImage').src = processedImage;
            
            setTimeout(() => {
                document.getElementById('progressContainer').classList.remove('active');
                isProcessing = false;
                addToHistory(currentImage, processedImage);
            }, 500);
        }
    }, 300);
}

// Export Image
function exportImage(format) {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `enhanced-photo.${format}`;
    link.click();
}

// Undo/Redo
function undoAction() {
    if (undoStack.length > 0) {
        redoStack.push(processedImage);
        processedImage = undoStack.pop();
        document.getElementById('afterImage').src = processedImage;
    }
}

function redoAction() {
    if (redoStack.length > 0) {
        undoStack.push(processedImage);
        processedImage = redoStack.pop();
        document.getElementById('afterImage').src = processedImage;
    }
}

// Clear All
function clearAll() {
    currentImage = null;
    processedImage = null;
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('fileInput').value = '';
    undoStack = [];
    redoStack = [];
}

// Update Prompt
function updatePrompt() {
    const device = document.getElementById('deviceSelect').value;
    const category = document.getElementById('categorySelect').value;
    const style = document.getElementById('styleSelect').value;
    
    const prompt = `حسّن الصورة باحتراف شديد كما لو أنها ملتقطة بكاميرا ${device}، بفئة ${category}، بأسلوب ${style}، مع تحسين بصري طبيعي جداً يركز على وضوح الوجه والتفاصيل الدقيقة، مع الحفاظ الكامل 100% على ملامح الوجه، لون البشرة الطبيعي، ونسيج الجلد الحقيقي بدون أي تنعيم أو تأثير بلاستيكي.`;
    
    document.getElementById('promptDisplay').textContent = prompt;
    localStorage.setItem('lastSettings', JSON.stringify({ device, category, style }));
}

// Copy Prompt
function copyPrompt() {
    const prompt = document.getElementById('promptDisplay').textContent;
    navigator.clipboard.writeText(prompt).then(() => {
        alert('تم نسخ الـ Prompt');
    });
}

// History
function addToHistory(before, after) {
    history.unshift({
        id: Date.now(),
        before: before,
        after: after,
        timestamp: new Date().toLocaleString('ar-SA')
    });
    
    if (history.length > 10) history.pop();
    localStorage.setItem('photoHistory', JSON.stringify(history));
    updateHistoryDisplay();
}

function loadHistory() {
    const saved = localStorage.getItem('photoHistory');
    if (saved) {
        history = JSON.parse(saved);
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    const list = document.getElementById('historyList');
    if (history.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">لا توجد صور في السجل</p>';
        return;
    }
    
    list.innerHTML = history.map(item => `
        <div style="padding: 10px; border-bottom: 1px solid var(--glass-border); cursor: pointer;" onclick="loadHistoryItem(${item.id})">
            <div style="font-size: 12px; color: var(--text-secondary);">${item.timestamp}</div>
            <div style="margin-top: 8px; display: flex; gap: 10px;">
                <img src="${item.before}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                <span style="color: var(--accent);">→</span>
                <img src="${item.after}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
            </div>
        </div>
    `).join('');
}

function loadHistoryItem(id) {
    const item = history.find(h => h.id === id);
    if (item) {
        currentImage = item.before;
        processedImage = item.after;
        document.getElementById('beforeImage').src = currentImage;
        document.getElementById('afterImage').src = processedImage;
        document.getElementById('sliderBeforeImage').src = currentImage;
        document.getElementById('previewSection').style.display = 'block';
        closeModal('historyModal');
    }
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Language Change
function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    alert('تم تغيير اللغة إلى: ' + (lang === 'ar' ? 'العربية' : 'English'));
}

// Slider Interaction
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('sliderHandle');
    const container = document.querySelector('.slider-container');
    
    if (slider && container) {
        let isSliding = false;
        
        slider.addEventListener('mousedown', () => { isSliding = true; });
        document.addEventListener('mouseup', () => { isSliding = false; });
        
        container.addEventListener('mousemove', (e) => {
            if (!isSliding) return;
            
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = (x / rect.width) * 100;
            
            if (percent >= 0 && percent <= 100) {
                slider.style.left = percent + '%';
                document.querySelector('.slider-before').style.width = percent + '%';
            }
        });
    }
});

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Load last settings
window.addEventListener('load', () => {
    const saved = localStorage.getItem('lastSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        document.getElementById('deviceSelect').value = settings.device;
        document.getElementById('categorySelect').value = settings.category;
        document.getElementById('styleSelect').value = settings.style;
    }
});
