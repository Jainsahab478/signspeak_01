Sign Language Translator
A real-time sign language recognition web application that captures body movements and converts sign language gestures into text and voice messages in multiple languages.

Features
🎯 Core Functionality+- Real-time gesture recognition using MediaPipe hand tracking
Multi-language support with 10+ languages including English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, and Hindi
Text-to-speech conversion with adjustable speed and voice selection
Live camera feed with gesture overlay visualization
Confidence scoring for gesture recognition accuracy
🔧 Advanced Features
Gesture library with common ASL signs and words
Gesture capture - save snapshots of recognized gestures
Multi-hand detection - recognizes up to 2 hands simultaneously
Responsive design - works on desktop and mobile devices
Keyboard shortcuts for quick access to features
Real-time status indicators and notifications
🎨 User Interface
Modern, accessible design with professional styling
Interactive gesture cards showing available signs- Progress bars for confidence visualization
Smooth animations and transitions
High contrast mode support for accessibility
Supported Gestures
The application currently recognizes the following gestures:+

Letters
A - Closed fist with thumb alongside
B - Flat hand, fingers together, thumb folded
C - Curved hand forming C shape
Common Words
HELLO - Open hand waving motion
THANK YOU - Flat hand touching chin, moving forward
YES - Nodding fist motion
NO - Shaking hand motion
PLEASE - Circular motion on chest with flat hand
HELP - Flat hand supporting closed fist
SORRY - Circular motion on chest with closed fist
Getting Started
Prerequisites
Modern web browser with WebRTC support (Chrome, Firefox, Safari, Edge)
Camera/webcam access
Internet connection for MediaPipe models
Installation
Clone or download the repository
Navigate to the project directory3. Start a local server (required for camera access):
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP
php -S localhost:8000
Open your browser and navigate to http://localhost:8000
Usage
Start Camera: Click the "Start Camera" button to begin gesture recognition
Show Gestures: Position your hand in front of the camera and perform sign language gestures
View Recognition: Watch the real-time gesture recognition and confidence scores
Select Language: Choose your preferred output language from the dropdown
Listen: Use the "Speak Text" button to hear the recognized text in your selected language
Capture: Save snapshots of gestures using the "Capture Gesture" button
Keyboard Shortcuts
Ctrl/Cmd + S: Start camera
Ctrl/Cmd + C: Capture gesture
Ctrl/Cmd + V: Speak text
Technology Stack+
Frontend: HTM5, CSS3, JavaScript (ES6+)
Computer Vision: MediaPipe Hands
Speech: Web Speech API
Camera: WebRTC getUserMedia API
Styling: Custom CSS with Flexbox/Grid
Fonts: Inter, Font Awesome icons
Architecture
Core Components
SignLanguageModel (sign-language-model.js)

Gesture pattern recognition
Multi-language translations
Confidence scoring algorithms
Extensible gesture library
SignLanguageApp (script.js)

Main application logic
MediaPipe integration
Camera management
gUI interactions
Responsive UI (style.css)

Modern design system
Accessibility features
Mobile-friendly layouts
Data Flow
Camera captures video stream
MediaPipe processes hand landmarks
SignLanguageModel analyzes gestures
UI updates with recognition results
Text-to-speech converts to audio
Browser Compatibility
Browser	Support	Notes
Chrome	✅ Full	Best performance
Firefox	✅ Full	Good performance
Safari	✅ Full	MacOS/iOS support
Edge	✅ Full	Windows support
Performance Optimization
Efficient rendering with canvas-based visualization
Optimized MediaPipe configuration for real-time processing
Debounced recognition to prevent false positives
Memory management with cleanup on page unload
Extending the Application
Adding New Gestures
. Update the initializeGestures() method in SignLanguageModel . Add gesture patterns and translations . Update the gesture library UI

Adding New Languages
Add language option to the HTML select element
Update gesture translations in the model
Ensure Web Speech API voice availability
Advanced ML Integration
The current implementation uses rule-based recognition. For production use, consider:

TensorFlow.js models for gesture classification
Custom training data collection
Deep learning-based pose estimation
Accessibility Features
High contrast mode support
Keyboard navigation compatibility
Screen reader friendly markup
Reduced motion preferences
Focus indicators for interactive elements
Privacy & Security
Local processing - no data sent to external servers
Camera access only when explicitly granted
No persistent storage of video or personal data
HTTPS recommended for production deployment
Troubleshooting
Common Issues
Camera not working

Check browser permissions
Ensure HTTPS or localhost
Try different browsers
Poor recognition accuracy

Improve lighting conditions
Position hand clearly in frame
Hold gestures steady for 1+ seconds
No voice output

Check browser audio permissions
Verify speech synthesis support
Try different languages/voices
Debug Mode
Access the browser developer console for detailed logging:

// Access app instance
window.signLanguageApp

// View recognition history
window.signLanguageApp.signLanguageModel.getHistory()

// Export model data
window.signLanguageApp.signLanguageModel.exportModel()
Contributing
Fork the repository
Create a feature branch
Implement your changes
Test thoroughly
Submit a pull request
Development Guidelines
Follow ES6+ standards
Add JSDoc comments
Test across browsers
Maintain accessibility standards
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
MediaPipe team for hand tracking technology
Web Speech API for text-to-speech functionality
Font Awesome for icons
Inter font family for typography
Future Enhancements
 Support for full sign language sentences
 Custom gesture training interface
 Real-time translation between sign languages
 Mobile app versions
 Offline mode capability
 Advanced ML model integration
 Multi-user collaboration features
Support
For issues, questions, or contributions, please:

Check the troubleshooting section
Search existing GitHub issues
Create a new issue with detailed information
Include browser version and error messages Built with ❤️ for the deaf and hard-of-hearing community*
