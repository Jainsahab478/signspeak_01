class SignLanguageApp {
        constructor() {
        this.camera = null;
        this.hands = null;
        this.signLanguageModel = null;
        this.isActive = false;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.recognitionText = '';
        this.speechSynthesis = window.speechSynthesis;
        this.availableVoices = [];
        this.currentLanguage = 'en-US';
        this.currentVoice = null;
        this.lastGestureTime = 0;
        this.gestureHoldTime = 1000; // ms to hold gesture before recognition
        this.animationFrameId = null;

        this.init();
    }

    /**
     * Initialize the application
     */    async init() {
        try {
            // Show loading spinner
            this.showLoadingSpinner();

            // Initialize sign language model
            this.signLanguageModel = new SignLanguageModel();

            // Get DOM elements
            this.initializeElements();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize MediaPipe
            await this.initializeMediaPipe();

            // Initialize speech synthesis
            this.initializeSpeechSynthesis();

            // Populate gesture library
            this.populateGestureLibrary();

            // Hide loading spinner
            this.hideLoadingSpinner();

            console.log('Sign Language Translator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    /**
     * Get DOM elements
     */
    initializeElements() {
        this.videoElement = document.getElementById('videoElement');
        this.canvasElement = document.getElementById('canvasElement');
        this.canvasCtx = this.canvasElement.getContext('2d');
        
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        this.captureButton = document.getElementById('captureButton');
        this.speakButton = document.getElementById('speakButton');
        this.clearTextButton = document.getElementById('clearText');
        
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.currentGestureElement = document.getElementById('currentGesture');
        this.confidenceBar = document.getElementById('confidenceBar');
        this.confidenceText = document.getElementById('confidenceText');
        this.textOutput = document.getElementById('textOutput');
        this.languageSelect = document.getElementById('languageSelect');
        this.voiceSpeed = document.getElementById('voiceSpeed');
        this.speedValue = document.getElementById('speedValue');
        this.gestureGrid = document.getElementById('gestureGrid');
        this.loadingSpinner = document.getElementById('loadingSpinner');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Camera controls
        this.startButton.addEventListener('click', () => this.startCamera());
        this.stopButton.addEventListener('click', () => this.stopCamera());
        this.captureButton.addEventListener('click', () => this.captureGesture());

        // Voice controls
        this.speakButton.addEventListener('click', () => this.speakText());
        this.clearTextButton.addEventListener('click', () => this.clearText());

        // Language selection
        this.languageSelect.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.updateVoice();
        });

        // Voice speed control
        this.voiceSpeed.addEventListener('input', (e) => {
            this.speedValue.textContent = e.target.value + 'x';
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.startCamera();
                        break;
                    case 'c':
                        e.preventDefault();
                        this.captureGesture();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.speakText();
                        break;
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Initialize MediaPipe Hands
     */
    async initializeMediaPipe() {
        try {
            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            // Configure MediaPipe Hands
            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            // Set up results callback
            this.hands.onResults((results) => this.onHandResults(results));

            console.log('MediaPipe Hands initialized');
        } catch (error) {
            console.error('Failed to initialize MediaPipe:', error);
            throw error;
        }
    }

    /**
     * Initialize speech synthesis
     */
    initializeSpeechSynthesis() {
        // Get available voices
        this.updateVoices();
        
        // Update voices when they change
        this.speechSynthesis.addEventListener('voiceschanged', () => {
            this.updateVoices();
        });
    }

    /**
     * Update available voices
     */
    updateVoices() {
        this.availableVoices = this.speechSynthesis.getVoices();
        this.updateVoice();
    }

    /**
     * Update current voice based on selected language
     */
    updateVoice() {
        const preferredVoice = this.availableVoices.find(voice => 
            voice.lang === this.currentLanguage
        );
        
        if (preferredVoice) {
            this.currentVoice = preferredVoice;
        } else {
            // Fallback to default voice
            this.currentVoice = this.availableVoices[0] || null;
        }
    }

    /**
     * Start camera and begin recognition
     */
    async startCamera() {
        try {
            this.updateStatus('Starting camera...', 'inactive');
            
            // Create camera
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.hands && this.isActive) {
                        await this.hands.send({ image: this.videoElement });
                    }
                },
                width: 640,
                height: 480
            });

            // Start camera
            await this.camera.start();
            
            this.isActive = true;
            this.updateStatus('Camera active - Show gestures', 'active');
            this.updateButtonStates(true);
            
            // Resize canvas to match video
            this.resizeCanvas();

        } catch (error) {
            console.error('Failed to start camera:', error);
            this.showError('Failed to access camera. Please ensure camera permissions are granted.');
            this.updateStatus('Camera access denied', 'inactive');
        }
    }

    /**
     * Stop camera and recognition
     */
    stopCamera() {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.isActive = false;
        this.updateStatus('Camera stopped', 'inactive');
        this.updateButtonStates(false);
        
        // Clear canvas
        this.clearCanvas();
        
        // Clear current gesture
        this.updateGestureDisplay(null, 0);
    }

    /**
     * Handle MediaPipe hand results
     */
    onHandResults(results) {
        if (!this.isActive) return;

        // Clear canvas
        this.clearCanvas();
        
        // Draw video frame
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // Draw hand landmarks
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(this.canvasCtx, landmarks, HAND_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 2
                });
                drawLandmarks(this.canvasCtx, landmarks, {
                    color: '#FF0000',
                    lineWidth: 1,
                    radius: 2
                });
            }

            // Recognize gesture from first hand
            const landmarks = results.multiHandLandmarks[0];
            this.recognizeGesture(landmarks);
        } else {
            // No hands detected
            this.updateGestureDisplay(null, 0);
        }
    }

    /**
     * Recognize gesture from landmarks
     */
    recognizeGesture(landmarks) {
        if (!this.signLanguageModel) return;

        const recognition = this.signLanguageModel.analyzeGesture(landmarks);
        
        if (recognition && recognition.gesture) {
            const confidence = recognition.confidence;
            const gestureName = recognition.gesture.name;
            
            // Update display
            this.updateGestureDisplay(gestureName, confidence);
            
            // Add to text if confidence is high enough and gesture is held
            if (confidence > 0.7 && this.isGestureHeld(gestureName)) {
                this.addRecognizedText(recognition.gesture);
            }
        } else {
            this.updateGestureDisplay(null, 0);
        }
    }

    /**
     * Check if gesture is held long enough
     */
    isGestureHeld(gestureName) {
        const currentTime = Date.now();
        
        if (this.lastGestureName === gestureName) {
            return (currentTime - this.lastGestureTime) > this.gestureHoldTime;
        } else {
            this.lastGestureName = gestureName;
            this.lastGestureTime = currentTime;
            return false;
        }
    }

    /**
     * Add recognized text to output
     */
    addRecognizedText(gesture) {
        const translation = this.signLanguageModel.getTranslation(gesture.name, this.currentLanguage);
        
        if (translation && translation !== this.lastAddedText) {
            this.recognitionText += translation + ' ';
            this.textOutput.textContent = this.recognitionText;
            this.lastAddedText = translation;
            
            // Auto-scroll to bottom
            this.textOutput.scrollTop = this.textOutput.scrollHeight;
        }
    }

    /**
     * Update gesture display
     */
    updateGestureDisplay(gestureName, confidence) {
        if (gestureName) {
            this.currentGestureElement.textContent = gestureName;
            this.confidenceBar.style.width = `${confidence * 100}%`;
            this.confidenceText.textContent = `${Math.round(confidence * 100)}%`;
        } else {
            this.currentGestureElement.textContent = 'None';
            this.confidenceBar.style.width = '0%';
            this.confidenceText.textContent = '0%';
        }
    }

    /**
     * Capture current gesture
     */
    captureGesture() {
        if (!this.isActive) {
            this.showError('Please start the camera first');
            return;
        }

        // Take a snapshot of current canvas
        const imageData = this.canvasElement.toDataURL('image/png');
        
        // Create a temporary download link
        const link = document.createElement('a');
        link.download = `gesture_${Date.now()}.png`;
        link.href = imageData;
        link.click();
        
        // Visual feedback
        this.showNotification('Gesture captured!');
    }

    /**
     * Speak the recognized text
     */
    speakText() {
        if (!this.recognitionText.trim()) {
            this.showError('No text to speak');
            return;
        }

        if (!this.speechSynthesis) {
            this.showError('Speech synthesis not supported');
            return;
        }

        // Stop any current speech
        this.speechSynthesis.cancel();

        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(this.recognitionText);
        utterance.lang = this.currentLanguage;
        utterance.rate = parseFloat(this.voiceSpeed.value);
        
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }

        // Speak
        this.speechSynthesis.speak(utterance);

        // Visual feedback
        this.showNotification('Speaking...');
    }

    /**
     * Clear recognized text
     */
    clearText() {
        this.recognitionText = '';
        this.textOutput.textContent = '';
        this.lastAddedText = '';
    }

    /**
     * Populate gesture library
     */
    populateGestureLibrary() {
        if (!this.signLanguageModel) return;

        const gestures = this.signLanguageModel.getAllGestures();
        
        gestures.forEach(gesture => {
            const card = document.createElement('div');
            card.className = 'gesture-card';
            card.innerHTML = `
                <div class="gesture-icon">✋</div>
                <div class="gesture-name">${gesture.name}</div>
                <div class="gesture-description">${gesture.description}</div>
            `;
            
            card.addEventListener('click', () => {
                this.showGestureDetails(gesture);
            });
            
            this.gestureGrid.appendChild(card);
        });
    }

    /**
     * Show gesture details
     */
    showGestureDetails(gesture) {
        const translation = this.signLanguageModel.getTranslation(gesture.name, this.currentLanguage);
        this.showNotification(`${gesture.name}: "${translation}" - ${gesture.description}`);
    }

    /**
     * Update button states
     */
    updateButtonStates(isActive) {
        this.startButton.disabled = isActive;
        this.stopButton.disabled = !isActive;
        this.captureButton.disabled = !isActive;
    }

    /**
     * Update status indicator
     */
    updateStatus(text, status) {
        this.statusText.textContent = text;
        this.statusIndicator.className = `status-indicator ${status}`;
    }

    /**
     * Resize canvas to match video
     */
    resizeCanvas() {
        if (this.videoElement && this.canvasElement) {
            const rect = this.videoElement.getBoundingClientRect();
            this.canvasElement.width = this.videoElement.videoWidth || rect.width;
            this.canvasElement.height = this.videoElement.videoHeight || rect.height;
        }
    }

    /**
     * Clear canvas
     */
    clearCanvas() {
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    /**
     * Show loading spinner
     */
    showLoadingSpinner() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'flex';
        }
    }

    /**
     * Hide loading spinner
     */
    hideLoadingSpinner() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            ${type === 'error' ? 'background: #ef4444;' : 'background: #10b981;'}
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Cleanup when page unloads
     */
    cleanup() {
        this.stopCamera();
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add notification animations to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
   document.head.appendChild(style);
   // Initialize the app
    window.signLanguageApp = new SignLanguageApp();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.signLanguageApp) {
            window.signLanguageApp.cleanup();
        }
    });
});

// Export for debugging
window.SignLanguageApp = SignLanguageApp