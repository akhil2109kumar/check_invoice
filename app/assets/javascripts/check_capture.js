document.addEventListener('DOMContentLoaded', initCheckCapture);
document.addEventListener('turbo:load', initCheckCapture);

function initCheckCapture() {
  const container = document.getElementById('check-capture-container');
  if (!container) return;

  const elements = {
    captureInterface: document.getElementById('capture-interface'),
    cameraContainer: document.getElementById('camera-container'),
    imagePreview: document.getElementById('image-preview'),
    videoElement: document.getElementById('camera-stream'),
    previewImage: document.getElementById('preview-image'),
    imageData: document.getElementById('check_image_data'),
    startButton: document.getElementById('start-camera-btn'),
    captureButton: document.getElementById('capture-btn'),
    cancelButton: document.getElementById('cancel-btn'),
    retakeButton: document.getElementById('retake-btn'),
  };

  let stream = null;

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      return alert("Your browser doesn't support camera access.");
    }
    try {
      toggleVisibility(elements.captureInterface, false);
      toggleVisibility(elements.cameraContainer, true);

      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: 1280, height: 720 }, audio: false });
      elements.videoElement.srcObject = stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access the camera.");
      toggleVisibility(elements.captureInterface, true);
      toggleVisibility(elements.cameraContainer, false);
    }
  }

  function takePhoto() {
    if (!elements.videoElement.videoWidth) return alert("Camera is not ready yet.");

    const canvas = document.createElement('canvas');
    canvas.width = elements.videoElement.videoWidth;
    canvas.height = elements.videoElement.videoHeight;
    canvas.getContext('2d').drawImage(elements.videoElement, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/png');
    elements.previewImage.src = imageDataUrl;
    elements.imageData.value = imageDataUrl;

    toggleVisibility(elements.cameraContainer, false);
    toggleVisibility(elements.imagePreview, true);
    stopCamera();
  }

  function stopCamera() {
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
  }

  function toggleVisibility(element, show) {
    element.classList.toggle("hidden", !show);
  }

  elements.startButton?.addEventListener('click', startCamera);
  elements.captureButton?.addEventListener('click', takePhoto);
  elements.cancelButton?.addEventListener('click', () => {
    stopCamera();
    toggleVisibility(elements.captureInterface, true);
    toggleVisibility(elements.cameraContainer, false);
  });
  elements.retakeButton?.addEventListener('click', () => {
    toggleVisibility(elements.imagePreview, false);
    elements.imageData.value = "";
    startCamera();
  });

  window.addEventListener('beforeunload', stopCamera);
}

function checkFormValidity() {
  const invoiceField = document.querySelector('input[name="check[invoice_numbers]"]');
  const checkField = document.querySelector('input[name="check[number]"]');
  const company = document.querySelector('select[name="check[company_id]"]').value;
  const imageData = document.querySelector('input[name="check[image_data]"]').value;
  const submitBtn = document.getElementById('submit-btn');

  const isValidInvoice = validateNumericField(invoiceField, 'invoice-number-error-frontend');
  const isValidCheck = validateNumericField(checkField, 'check-number-error-frontend');

  validateUniqueness(invoiceField.value, checkField.value);

  const canSubmit = isValidInvoice && isValidCheck && company && imageData;
  submitBtn.disabled = !canSubmit;
  submitBtn.className = `w-full py-3 ${canSubmit ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'} rounded font-semibold`;
}

function validateNumericField(field, errorContainerId) {
  const value = field.value.trim();
  const isValid = value.split(',').every(num => /^\d+$/.test(num.trim()));
  const errorContainer = document.getElementById(errorContainerId);
  errorContainer.innerText = isValid || !value ? '' : "Please enter numbers.";
  field.classList.toggle("border-red-500", !isValid && value);
  return isValid;
}

function validateUniqueness(invoiceNumbers, checkNumber) {
  fetch(`/checks/unique_check_number?check_number=${checkNumber}`)
    .then(res => res.json())
    .then(data => updateErrorState('check-number-error', 'check[number]', data.exists, "Check number already exists."));

  fetch(`/checks/unique_invoice_numbers?invoice_numbers=${invoiceNumbers}`)
    .then(res => res.json())
    .then(data => updateErrorState('invoice-number-error', 'check[invoice_numbers]', data.exists, "Invoice numbers already exist."));
}

function updateErrorState(errorContainerId, fieldName, exists, errorMessage) {
  const errorContainer = document.getElementById(errorContainerId);
  const field = document.querySelector(`input[name="${fieldName}"]`);
  errorContainer.innerText = exists ? errorMessage : "";
  field.classList.toggle("border-red-500", exists);
}
