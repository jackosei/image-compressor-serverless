const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const formatSelect = document.getElementById("formatSelect");
const statusArea = document.getElementById("statusArea");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
const error = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");
const downloadLink = document.getElementById("downloadLink");
const resetBtn = document.getElementById("resetBtn");
const retryBtn = document.getElementById("retryBtn");

// Batch processing elements
const batchArea = document.getElementById("batchArea");
const batchProgress = document.getElementById("batchProgress");
const batchActions = document.getElementById("batchActions");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const batchResetBtn = document.getElementById("batchResetBtn");

// Modal elements
const privacyModal = document.getElementById("privacyModal");
const termsModal = document.getElementById("termsModal");
const privacyLink = document.getElementById("privacyLink");
const termsLink = document.getElementById("termsLink");
const privacyClose = document.getElementById("privacyClose");
const termsClose = document.getElementById("termsClose");

// Limit modal elements
const limitModal = document.getElementById("limitModal");
const limitClose = document.getElementById("limitClose");

// Format tooltip elements
const formatInfoBtn = document.getElementById("formatInfoBtn");
const formatTooltip = document.getElementById("formatTooltip");
const tooltipClose = document.getElementById("tooltipClose");

// Compression limit tracking
const MAX_FREE_COMPRESSIONS = 5;
let compressionsUsed = parseInt(
  localStorage.getItem("compressions_used") || "0",
);

// Store compressed files for batch download
let compressedFiles = [];

// Drag & Drop events
uploadArea.addEventListener("click", () => fileInput.click());

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length) handleFiles(Array.from(files));
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) handleFiles(Array.from(e.target.files));
});

resetBtn.addEventListener("click", resetUI);
retryBtn.addEventListener("click", resetUI);
batchResetBtn.addEventListener("click", resetUI);
downloadAllBtn.addEventListener("click", downloadAllAsZip);

// Modal event listeners
privacyLink.addEventListener("click", (e) => {
  e.preventDefault();
  privacyModal.hidden = false;
  document.body.style.overflow = "hidden";
});

termsLink.addEventListener("click", (e) => {
  e.preventDefault();
  termsModal.hidden = false;
  document.body.style.overflow = "hidden";
});

privacyClose.addEventListener("click", () => {
  privacyModal.hidden = true;
  document.body.style.overflow = "auto";
});

termsClose.addEventListener("click", () => {
  termsModal.hidden = true;
  document.body.style.overflow = "auto";
});

// Close modals when clicking outside
privacyModal.addEventListener("click", (e) => {
  if (e.target === privacyModal) {
    privacyModal.hidden = true;
    document.body.style.overflow = "auto";
  }
});

termsModal.addEventListener("click", (e) => {
  if (e.target === termsModal) {
    termsModal.hidden = true;
    document.body.style.overflow = "auto";
  }
});

// Limit modal event listeners
limitClose.addEventListener("click", () => {
  limitModal.hidden = true;
  document.body.style.overflow = "auto";
});

limitModal.addEventListener("click", (e) => {
  if (e.target === limitModal) {
    limitModal.hidden = true;
    document.body.style.overflow = "auto";
  }
});

// Format tooltip event listeners
formatInfoBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  formatTooltip.hidden = !formatTooltip.hidden;
  if (!formatTooltip.hidden) {
    lucide.createIcons();
  }
});

tooltipClose.addEventListener("click", () => {
  formatTooltip.hidden = true;
});

// Close tooltip when clicking outside
document.addEventListener("click", (e) => {
  if (
    !formatTooltip.hidden &&
    !formatTooltip.contains(e.target) &&
    e.target !== formatInfoBtn &&
    !formatInfoBtn.contains(e.target)
  ) {
    formatTooltip.hidden = true;
  }
});

// Close modals with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!privacyModal.hidden) {
      privacyModal.hidden = true;
      document.body.style.overflow = "auto";
    }
    if (!termsModal.hidden) {
      termsModal.hidden = true;
      document.body.style.overflow = "auto";
    }
    if (!limitModal.hidden) {
      limitModal.hidden = true;
      document.body.style.overflow = "auto";
    }
    if (!formatTooltip.hidden) {
      formatTooltip.hidden = true;
    }
  }
});

function resetUI() {
  statusArea.hidden = true;
  batchArea.hidden = true;
  loading.hidden = true;
  result.hidden = true;
  error.hidden = true;
  batchActions.hidden = true;
  uploadArea.hidden = false;
  fileInput.value = "";
  batchProgress.innerHTML = "";
  compressedFiles = [];
}

// Helper functions for compression limit
function checkCompressionLimit() {
  return compressionsUsed < MAX_FREE_COMPRESSIONS;
}

function incrementCompressionCount() {
  compressionsUsed++;
  localStorage.setItem("compressions_used", compressionsUsed.toString());
}

function showLimitModal() {
  limitModal.hidden = false;
  document.body.style.overflow = "hidden";
  lucide.createIcons();
}

function handleFiles(files) {
  // Filter only image files
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));

  if (imageFiles.length === 0) {
    alert("Please upload at least one image file.");
    return;
  }

  // Check compression limit
  if (!checkCompressionLimit()) {
    showLimitModal();
    return;
  }

  uploadArea.hidden = true;

  // Single file: use original flow
  if (imageFiles.length === 1) {
    statusArea.hidden = false;
    loading.hidden = false;
    uploadImage(imageFiles[0]);
  } else {
    // Multiple files: use batch processing
    batchArea.hidden = false;
    processBatch(imageFiles);
  }
}

// Single file upload (original functionality)
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("format", formatSelect.value);

  try {
    const response = await fetch("/api/compress", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Compression failed");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Increment compression count on success
    incrementCompressionCount();

    loading.hidden = true;
    result.hidden = false;

    downloadLink.href = url;
    downloadLink.download = `compressed_${file.name}`;
  } catch (err) {
    loading.hidden = true;
    error.hidden = false;
    errorMessage.textContent = err.message;
    console.error(err);
  }
}

// Batch processing
async function processBatch(files) {
  compressedFiles = [];
  batchProgress.innerHTML = "";

  // Create progress cards for each file
  for (const file of files) {
    const card = createProgressCard(file);
    batchProgress.appendChild(card);
  }

  // Process files sequentially to show progress
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const card = batchProgress.children[i];
    await compressFileWithProgress(file, card, i);
  }

  // All files processed - show download all button
  batchActions.hidden = false;
}

function createProgressCard(file) {
  const card = document.createElement("div");
  card.className = "file-progress-card";
  card.innerHTML = `
    <div class="file-info">
      <span class="file-name">${file.name}</span>
      <span class="file-size">${formatFileSize(file.size)}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <div class="file-status">Waiting...</div>
  `;
  return card;
}

async function compressFileWithProgress(file, card, index) {
  const statusElement = card.querySelector(".file-status");
  const progressFill = card.querySelector(".progress-fill");

  try {
    // Update status
    statusElement.textContent = "Compressing...";
    card.classList.add("processing");
    progressFill.style.width = "50%";

    const formData = new FormData();
    formData.append("image", file);
    formData.append("format", formatSelect.value);

    const response = await fetch("/api/compress", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Compression failed");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Determine file extension
    let ext = file.name.split(".").pop();
    const format = formatSelect.value;
    if (format === "image/png") ext = "png";
    else if (format === "image/jpeg") ext = "jpg";
    else if (format === "image/webp") ext = "webp";
    else if (format === "image/avif") ext = "avif";

    const fileName = `compressed_${file.name.split(".")[0]}.${ext}`;

    // Store compressed file
    compressedFiles.push({
      blob: blob,
      fileName: fileName,
      url: url,
    });

    // Increment compression count on success
    incrementCompressionCount();

    // Update status to complete
    progressFill.style.width = "100%";
    statusElement.innerHTML = `<i data-lucide="check-circle" style="display: inline-block; vertical-align: middle; margin-right: 0.25rem; width: 16px; height: 16px; color: #22c55e;"></i> Complete <a href="${url}" download="${fileName}" class="download-link">Download</a>`;
    card.classList.remove("processing");
    card.classList.add("completed");
    // Re-initialize icons for the newly added element
    lucide.createIcons();
  } catch (err) {
    // Update status to error
    progressFill.style.width = "100%";
    progressFill.classList.add("error");
    statusElement.innerHTML = `<i data-lucide="x-circle" style="display: inline-block; vertical-align: middle; margin-right: 0.25rem; width: 16px; height: 16px; color: #ef4444;"></i> ${err.message}`;
    card.classList.remove("processing");
    card.classList.add("error");
    console.error(`Error compressing ${file.name}:`, err);
    // Re-initialize icons for the newly added element
    lucide.createIcons();
  }
}

async function downloadAllAsZip() {
  if (compressedFiles.length === 0) {
    alert("No compressed files to download.");
    return;
  }

  try {
    downloadAllBtn.disabled = true;
    batchResetBtn.disabled = true;
    downloadAllBtn.textContent = "Creating ZIP...";

    // Create FormData with all original files
    const formData = new FormData();
    formData.append("format", formatSelect.value);

    // Get original files from file input
    const files = Array.from(fileInput.files);
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch("/api/compress-batch", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to create ZIP file");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed-images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    downloadAllBtn.disabled = false;
    batchResetBtn.disabled = false;
    downloadAllBtn.innerHTML =
      '<i data-lucide="package" style="display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>Download All as ZIP';
    lucide.createIcons();
  } catch (err) {
    alert(`Error creating ZIP: ${err.message}`);
    downloadAllBtn.disabled = false;
    batchResetBtn.disabled = false;
    downloadAllBtn.innerHTML =
      '<i data-lucide="package" style="display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>Download All as ZIP';
    lucide.createIcons();
    console.error(err);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
