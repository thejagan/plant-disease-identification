const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const resultContainer = document.getElementById('result-container');
const loading = document.getElementById('loading');
const uploadText = document.getElementById('upload-text');
const previewImg = document.getElementById('preview-img');
const diseaseName = document.getElementById('disease-name');
const confidenceFill = document.getElementById('confidence-fill');
const confidenceText = document.getElementById('confidence-text');
const diseaseQuery = document.getElementById('disease-query');

// Navigation & Sidebar
const navAnalyze = document.getElementById('nav-analyze');
const navHistory = document.getElementById('nav-history');
const navAbout = document.getElementById('nav-about');
const navAnalytics = document.getElementById('nav-analytics');
const historySidebar = document.getElementById('history-sidebar');
const closeHistory = document.getElementById('close-history');
const clearHistory = document.getElementById('clear-history');
const historyList = document.getElementById('history-list');
const aboutModal = document.getElementById('about-modal');
const closeAbout = document.getElementById('close-about');
const overlay = document.getElementById('overlay');

// Phase 3 Elements
const analyticsSection = document.getElementById('analytics-section');
const installAppBtn = document.getElementById('install-app');
const downloadReportBtn = document.getElementById('download-report');

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installAppBtn.style.display = 'block';
});

installAppBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            deferredPrompt = null;
            installAppBtn.style.display = 'none';
        }
    }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker Registered'))
        .catch(err => console.log('SW Registration failed:', err));
}

// UI Toggle Functions
function toggleHistory(show) {
    if (show) {
        historySidebar.classList.remove('hidden-sidebar');
        overlay.classList.remove('hidden');
        loadHistory();
    } else {
        historySidebar.classList.add('hidden-sidebar');
        if (aboutModal.classList.contains('hidden')) {
            overlay.classList.add('hidden');
        }
    }
}

function toggleAbout(show) {
    if (show) {
        aboutModal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    } else {
        aboutModal.classList.add('hidden');
        if (historySidebar.classList.contains('hidden-sidebar')) {
            overlay.classList.add('hidden');
        }
    }
}

// Navigation Events
navAnalytics.addEventListener('click', (e) => {
    e.preventDefault();
    toggleHistory(false);
    toggleAbout(false);

    // Hide other sections
    dropZone.classList.add('hidden');
    resultContainer.classList.add('hidden');
    loading.classList.add('hidden');

    // Show analytics
    analyticsSection.classList.remove('hidden');
    renderChart();
});

navAnalyze.addEventListener('click', (e) => {
    e.preventDefault();
    toggleHistory(false);
    toggleAbout(false);
    analyticsSection.classList.add('hidden');
    dropZone.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

navHistory.addEventListener('click', (e) => { e.preventDefault(); toggleHistory(true); });
closeHistory.addEventListener('click', () => toggleHistory(false));
navAbout.addEventListener('click', (e) => { e.preventDefault(); toggleAbout(true); });
closeAbout.addEventListener('click', () => toggleAbout(false));
overlay.addEventListener('click', () => { toggleHistory(false); toggleAbout(false); });

clearHistory.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear your scan history?")) {
        localStorage.removeItem('thorHistory');
        loadHistory();
    }
});

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary)';
    dropZone.style.transform = 'scale(1.02)';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--glass-border)';
    dropZone.style.transform = 'scale(1)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--glass-border)';
    dropZone.style.transform = 'scale(1)';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File Input
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);

    showLoading();

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Prediction failed');
        }

        const data = await response.json();

        setTimeout(() => {
            saveScanToHistory(data, previewImg.src);
            displayResult(data);
        }, 1500);

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during detection.');
        hideLoading();
    }
}

function showLoading() {
    resultContainer.classList.add('hidden');
    dropZone.classList.add('hidden');
    analyticsSection.classList.add('hidden');
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
    dropZone.classList.remove('hidden');
}

function displayResult(data) {
    loading.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    analyticsSection.classList.add('hidden');

    const displayName = data.prediction.replace(/_/g, " ");
    diseaseName.textContent = displayName;

    const confidencePercent = Math.round(data.confidence * 100);
    confidenceText.textContent = `${confidencePercent}%`;

    setTimeout(() => {
        confidenceFill.style.width = `${confidencePercent}%`;
    }, 100);

    const isHealthy = displayName.toLowerCase().includes("healthy");
    if (isHealthy) {
        confidenceFill.style.backgroundColor = "var(--primary)";
        confidenceFill.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.5)";
        diseaseName.style.color = "var(--primary)";
    } else {
        confidenceFill.style.backgroundColor = "#EF4444";
        confidenceFill.style.boxShadow = "0 0 10px rgba(239, 68, 68, 0.5)";
        diseaseName.style.color = "#EF4444";
    }

    // Update Treatment
    const treatmentContainer = document.querySelector('.treatment-content');
    if (data.description && data.treatment) {
        let treatmentHtml = `
            <p class="snippet">
                <strong>Analysis:</strong> ${data.description}
                <br><br>
                <strong>Recommended next steps:</strong>
                <ul class="treatment-list">
                    ${data.treatment.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </p>
            <button class="btn-secondary" onclick="location.reload()">Analyze Another</button>
        `;
        treatmentContainer.innerHTML = treatmentHtml;
    }
}

// History Functions
function saveScanToHistory(data, imageSrc) {
    const historyItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        disease: data.prediction.replace(/_/g, " "),
        confidence: Math.round(data.confidence * 100),
        image: imageSrc,
        fullData: data
    };

    let history = JSON.parse(localStorage.getItem('thorHistory')) || [];
    history.unshift(historyItem);
    if (history.length > 20) history.pop();
    localStorage.setItem('thorHistory', JSON.stringify(history));
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem('thorHistory')) || [];
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-msg">No scans yet.</p>';
        return;
    }

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <img src="${item.image}" class="history-thumb" alt="thumb">
            <div class="history-info">
                <h4>${item.disease}</h4>
                <p>${item.date} • ${item.confidence}%</p>
            </div>
        `;
        div.addEventListener('click', () => {
            displayResult(item.fullData);
            previewImg.src = item.image;
            toggleHistory(false);
            window.scrollTo({ top: 300, behavior: 'smooth' });
        });
        historyList.appendChild(div);
    });
}

// Analytics Chart
let chartInstance;
function renderChart() {
    const history = JSON.parse(localStorage.getItem('thorHistory')) || [];
    const ctx = document.getElementById('diseaseChart')?.getContext('2d');

    if (!ctx) return;

    const diseaseCounts = {};
    history.forEach(item => {
        const name = item.disease;
        diseaseCounts[name] = (diseaseCounts[name] || 0) + 1;
    });

    const labels = Object.keys(diseaseCounts);
    const data = Object.values(diseaseCounts);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9CA3AF' }
                }
            }
        }
    });
}

// PDF Generation
if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const dName = diseaseName.textContent;
        const conf = confidenceText.textContent;
        const date = new Date().toLocaleString();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129);
        doc.text("Thor Intelligence", 20, 20);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Disease Diagnosis Report", 20, 35);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${date}`, 20, 45);

        doc.setLineWidth(0.5);
        doc.line(20, 50, 190, 50);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Diagnosis: ${dName}`, 20, 65);

        doc.setFont("helvetica", "normal");
        doc.text(`Confidence: ${conf}`, 20, 75);

        doc.text("Recommended Actions:", 20, 95);

        const listItems = document.querySelectorAll('.treatment-list li');
        let y = 105;
        listItems.forEach(item => {
            doc.text(`• ${item.textContent}`, 25, y);
            y += 10;
        });

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Generated by Thor Plant Disease Prediction App", 20, 280);

        doc.save(`Thor-Report-${dName}.pdf`);
    });
}
