// app/javascript/check_capture.js

document.addEventListener('DOMContentLoaded', function() {
  initCheckCapture();
});

document.addEventListener('turbo:load', function() {
  initCheckCapture();
});

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
    retakeButton: document.getElementById('retake-btn')
  };

  let stream = null;

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser doesn't support camera access.");
      return;
    }

    try {
      elements.captureInterface.classList.add("hidden");
      elements.cameraContainer.classList.remove("hidden");

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: false
      });

      elements.videoElement.srcObject = stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access the camera.");
      elements.cameraContainer.classList.add("hidden");
      elements.captureInterface.classList.remove("hidden");
    }
  }

  function takePhoto() {
    const canvas = document.createElement('canvas');
    const videoElement = elements.videoElement;

    if (!videoElement.videoWidth) {
      alert("Camera is not ready yet.");
      return;
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/png');
    elements.previewImage.src = imageDataUrl;
    elements.imageData.value = imageDataUrl;

    elements.cameraContainer.classList.add("hidden");
    elements.imagePreview.classList.remove("hidden");

    stopCamera();
  }

  function cancelCapture() {
    stopCamera();
    elements.cameraContainer.classList.add("hidden");
    elements.captureInterface.classList.remove("hidden");
  }

  function retakePhoto() {
    elements.imagePreview.classList.add("hidden");
    elements.imageData.value = "";
    startCamera();
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  elements.startButton?.addEventListener('click', (e) => {
    e.preventDefault();
    startCamera();
  });

  elements.captureButton?.addEventListener('click', (e) => {
    e.preventDefault();
    takePhoto();
  });

  elements.cancelButton?.addEventListener('click', (e) => {
    e.preventDefault();
    cancelCapture();
  });

  elements.retakeButton?.addEventListener('click', (e) => {
    e.preventDefault();
    retakePhoto();
  });

  window.addEventListener('beforeunload', stopCamera);
}
