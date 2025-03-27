// app/javascript/check_capture.js

document.addEventListener('turbo:load', function() {
  // Use turbo:load instead of DOMContentLoaded for Turbo compatibility
  initCheckCapture();
});

document.addEventListener('DOMContentLoaded', function() {
  // Keep DOMContentLoaded for initial page load
  initCheckCapture();
});

function initCheckCapture() {
  // Only initialize if we're on the capture page
  if (!document.getElementById('check-capture-container')) return;
  
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
    availableInvoices: document.getElementById('available-invoices'),
    invoiceList: document.getElementById('invoice-list'),
    selectedInvoices: document.getElementById('check_invoice_ids'),
    form: document.getElementById('check-form'),
    fileInput: document.getElementById('file-input'),
    startButton: document.getElementById('start-camera-btn'),
    captureButton: document.getElementById('capture-btn'),
    cancelButton: document.getElementById('cancel-btn'),
    retakeButton: document.getElementById('retake-btn')
  };
  
  // Verify all elements are found
  for (const [key, element] of Object.entries(elements)) {
    if (!element) {
      console.warn(`Element not found: ${key}`);
    }
  }
  
  let stream = null;
  let selectedInvoices = [];
  
  // Check if the browser supports camera access
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  if (!hasGetUserMedia) {
    console.warn("This browser does not support camera access.");
    if (elements.startButton) {
      elements.startButton.disabled = true;
      elements.startButton.classList.add("opacity-50", "cursor-not-allowed");
    }
  }
  
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
      
      // Request camera access with preference for the environment-facing camera (rear camera on mobile)
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
    console.log("Taking photo...");
    
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
    
    // Show success message
    showSuccessMessage("Photo captured successfully!");
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
    console.log("Handling file upload");
    
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
      
      // Show the preview and hide the camera
      elements.captureInterface.classList.add("hidden");
      elements.imagePreview.classList.remove("hidden");
      
      // Show success message
      showSuccessMessage("Image uploaded successfully!");
    };
    
    reader.onerror = (e) => {
      console.error("Error reading file:", e);
      alert("Error reading the selected file. Please try another file.");
    };
    
    reader.readAsDataURL(file);
  }
  
  // Show success message
  function showSuccessMessage(message) {
    const flashMessage = document.createElement('div');
    flashMessage.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded';
    flashMessage.innerHTML = `<p>${message}</p>`;
    
    const container = document.querySelector('#check-capture-container');
    if (container) {
      container.insertBefore(flashMessage, container.firstChild);
      
      // Remove the message after a few seconds
      setTimeout(() => {
        flashMessage.remove();
      }, 3000);
    }
  }
  
  // Load invoices for the selected company
  function loadInvoices() {
    const companyId = elements.companySelect.value;
    if (!companyId) {
      elements.availableInvoices.innerHTML = '<p class="text-gray-500 italic">Please select a company to see available invoices.</p>';
      return;
    }
    
    console.log("Loading invoices for company ID:", companyId);
    
    // Fetch invoices for the selected company
    fetch(`/companies/${companyId}/invoices.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Invoices loaded:", data);
        
        if (data.length === 0) {
          elements.availableInvoices.innerHTML = '<p class="text-gray-500">No invoices found for this company.</p>';
          return;
        }
        
        let html = '<ul class="space-y-2">';
        data.forEach(invoice => {
          const isSelected = selectedInvoices.includes(invoice.id.toString());
          html += `
            <li class="flex items-center">
              <input type="checkbox" id="invoice-${invoice.id}" 
                class="mr-2" data-invoice-id="${invoice.id}" 
                ${isSelected ? 'checked' : ''}>
              <label for="invoice-${invoice.id}" class="cursor-pointer">
                ${invoice.number}
              </label>
            </li>
          `;
        });
        html += '</ul>';
        
        elements.availableInvoices.innerHTML = html;
        
        // Add event listeners to the newly created checkboxes
        document.querySelectorAll('#available-invoices input[type="checkbox"]').forEach(checkbox => {
          checkbox.addEventListener('change', toggleInvoice);
        });
      })
      .catch(error => {
        console.error('Error fetching invoices:', error);
        elements.availableInvoices.innerHTML = '<p class="text-red-500">Error loading invoices. Please try again.</p>';
      });
  }
  
  // Toggle invoice selection
  function toggleInvoice(event) {
    const invoiceId = event.target.dataset.invoiceId;
    console.log("Toggling invoice:", invoiceId, "checked:", event.target.checked);
    
    if (event.target.checked) {
      // Add to selected invoices
      selectedInvoices.push(invoiceId);
    } else {
      // Remove from selected invoices
      selectedInvoices = selectedInvoices.filter(id => id !== invoiceId);
    }
    
    // Update the hidden field and the selected invoices list
    elements.selectedInvoices.value = selectedInvoices.join(',');
    updateInvoiceList();
  }
  
  // Update the list of selected invoices
  function updateInvoiceList() {
    if (selectedInvoices.length === 0) {
      elements.invoiceList.innerHTML = '';
      return;
    }
    
    // Get all selected invoice numbers
    const selectedCheckboxes = document.querySelectorAll('#available-invoices input[type="checkbox"]:checked');
    const invoiceNumbers = Array.from(selectedCheckboxes).map(checkbox => {
      const label = checkbox.nextElementSibling;
      return label.textContent.trim();
    });
    
    console.log("Selected invoices:", invoiceNumbers);
    
    // Display the selected invoice numbers
    elements.invoiceList.innerHTML = invoiceNumbers.join(', ');
  }
  
  // Set up event listeners
  function setupEventListeners() {
    console.log("Setting up event listeners");
    
    if (elements.startButton) {
      elements.startButton.addEventListener('click', startCamera);
      console.log("Event listener added to start button");
    }
    
    if (elements.captureButton) {
      elements.captureButton.addEventListener('click', takePhoto);
      console.log("Event listener added to capture button");
    }
    
    if (elements.cancelButton) {
      elements.cancelButton.addEventListener('click', cancelCapture);
      console.log("Event listener added to cancel button");
    }
    
    if (elements.retakeButton) {
      elements.retakeButton.addEventListener('click', retakePhoto);
      console.log("Event listener added to retake button");
    }
    
    if (elements.fileInput) {
      elements.fileInput.addEventListener('change', handleFileUpload);
      console.log("Event listener added to file input");
    }
    
    if (elements.companySelect) {
      elements.companySelect.addEventListener('change', loadInvoices);
      console.log("Event listener added to company select");
    }
    
    // Clean up camera stream when leaving the page
    window.addEventListener('beforeunload', stopCamera);
  }
  
  // Initialize the functionality
  setupEventListeners();
}