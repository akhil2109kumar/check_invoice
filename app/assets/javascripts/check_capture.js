// app/javascript/check_capture.js

document.addEventListener('DOMContentLoaded', function() {
  initCheckCapture();
});

// For Turbo compatibility
document.addEventListener('turbo:load', function() {
  initCheckCapture();
});

function initCheckCapture() {
  // Only initialize if we're on the capture page
  const container = document.getElementById('check-capture-container');
  if (!container) {
    console.log("Not on capture page, exiting initialization");
    return;
  }
  
  console.log("Initializing check capture functionality");
  
  // Elements
  const elements = {
    captureInterface: document.getElementById('capture-interface'),
    cameraContainer: document.getElementById('camera-container'),
    imagePreview: document.getElementById('image-preview'),
    videoElement: document.getElementById('camera-stream'),
    previewImage: document.getElementById('preview-image'),
    imageData: document.getElementById('check_image_data'),
    companySelect: document.getElementById('check_company_id'),
    form: document.getElementById('check-form'),
    fileInput: document.getElementById('file-input'),
    startButton: document.getElementById('start-camera-btn'),
    captureButton: document.getElementById('capture-btn'),
    cancelButton: document.getElementById('cancel-btn'),
    retakeButton: document.getElementById('retake-btn')
  };
  
  // Debug log all elements
  console.log("Element status:");
  Object.entries(elements).forEach(([key, element]) => {
    console.log(`- ${key}: ${element ? 'Found' : 'MISSING'}`);
  });
  
  let stream = null;
  
  // Check if the browser supports camera access
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  console.log("Camera API available:", hasGetUserMedia);
  
  // Start camera capture
  async function startCamera() {
    console.log("Starting camera...");
    
    if (!hasGetUserMedia) {
      alert("Your browser doesn't support camera access. Please use a different browser or upload an image.");
      return;
    }
    
    try {
      elements.captureInterface.classList.add("hidden");
      elements.cameraContainer.classList.remove("hidden");
      
      // Request camera access with preference for the rear camera on mobile
      stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log("Camera stream obtained");
      elements.videoElement.srcObject = stream;
    } 
    catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access the camera. Please check your permissions or try uploading an image instead.");
      elements.cameraContainer.classList.add("hidden");
      elements.captureInterface.classList.remove("hidden");
    }
  }
  
  // Take a photo
  function takePhoto() {
    console.log("Take photo function called");
    
    // Create a canvas element to capture the video frame
    const canvas = document.createElement('canvas');
    const videoElement = elements.videoElement;
    
    // Check if video dimensions are available
    if (!videoElement.videoWidth) {
      console.error("Video element has no dimensions. Stream may not be ready.");
      alert("Camera is not ready yet. Please wait a moment and try again.");
      return;
    }
    
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw the current video frame onto the canvas
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, width, height);
    
    // Convert the canvas to a data URL
    const imageDataUrl = canvas.toDataURL('image/png');
    
    console.log("Photo captured, length of data URL:", imageDataUrl.length);
    
    // Set the image source and store the data in the hidden field
    elements.previewImage.src = imageDataUrl;
    elements.imageData.value = imageDataUrl;
    
    // Show the preview and hide the camera
    elements.cameraContainer.classList.add("hidden");
    elements.imagePreview.classList.remove("hidden");
    
    // Stop the camera stream
    stopCamera();
  }
  
  // Cancel capture and return to initial state
  function cancelCapture() {
    console.log("Canceling capture");
    stopCamera();
    elements.cameraContainer.classList.add("hidden");
    elements.captureInterface.classList.remove("hidden");
  }
  
  // Retake the photo
  function retakePhoto() {
    console.log("Retaking photo");
    elements.imagePreview.classList.add("hidden");
    elements.imageData.value = "";
    startCamera();
  }
  
  // Stop the camera stream
  function stopCamera() {
    if (stream) {
      console.log("Stopping camera stream");
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }
  
  // Handle file upload
  function handleFileUpload(event) {
    console.log("File upload handler called");
    
    const file = event.target.files[0];
    if (!file) {
      console.warn("No file selected");
      return;
    }
    
    if (!file.type.match('image.*')) {
      alert('Please select an image file.');
      return;
    }
    
    console.log("File selected:", file.name, file.type, file.size);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      console.log("File read successfully, data URL length:", imageDataUrl.length);
      
      // Set the image source and store the data in the hidden field
      elements.previewImage.src = imageDataUrl;
      elements.imageData.value = imageDataUrl;
      
      // Show the preview and hide the capture interface
      elements.captureInterface.classList.add("hidden");
      elements.imagePreview.classList.remove("hidden");
    };
    
    reader.onerror = (e) => {
      console.error("Error reading file:", e);
      alert("Error reading the selected file. Please try another file.");
    };
    
    reader.readAsDataURL(file);
  }
  
  // Set up event listeners with direct function assignment for debugging
  function setupEventListeners() {
    console.log("Setting up event listeners");
    
    if (elements.startButton) {
      elements.startButton.addEventListener('click', function(e) {
        console.log("Start camera button clicked");
        e.preventDefault();
        startCamera();
      });
      console.log("Start button listener added");
    }
    
    if (elements.captureButton) {
      elements.captureButton.addEventListener('click', function(e) {
        console.log("Capture button clicked");
        e.preventDefault();
        takePhoto();
      });
      console.log("Capture button listener added");
    }
    
    if (elements.cancelButton) {
      elements.cancelButton.addEventListener('click', function(e) {
        console.log("Cancel button clicked");
        e.preventDefault();
        cancelCapture();
      });
      console.log("Cancel button listener added");
    }
    
    if (elements.retakeButton) {
      elements.retakeButton.addEventListener('click', function(e) {
        console.log("Retake button clicked");
        e.preventDefault();
        retakePhoto();
      });
      console.log("Retake button listener added");
    }
    
    if (elements.fileInput) {
      elements.fileInput.addEventListener('change', handleFileUpload);
      console.log("File input listener added");
    }
    
    // Clean up camera stream when leaving the page
    window.addEventListener('beforeunload', stopCamera);
  }
  
  // Initialize the functionality
  setupEventListeners();
  console.log("Check capture initialized");
}