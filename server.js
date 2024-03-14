const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

let interval;
let connectionTime;

// Serve HTML file
app.get('/', (req, res) => {
  // Call the biometricVerificationCloudFunction when a client accesses the root URL
  biometricVerificationCloudFunction(req, res);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected');
  connectionTime = new Date();

  // Send biometric verification result every 5 seconds
  interval = setInterval(() => {
    sendBiometricResult(socket);
  }, 5000);

  // Close WebSocket connection after 5 minutes
  setTimeout(() => {
    socket.disconnect();
    console.log('WebSocket connection closed after 5 minutes.');
  }, 300000); // 5 minutes in milliseconds
});

// Handle biometric verification and send result over WebSocket
const biometricVerification = () => {
  // Simulating biometric verification result (true for success, false for failure)
  const isVerified = Math.random() < 0.5; // Randomly generate true or false for demo
  return isVerified;
};

const sendBiometricResult = (socket) => {
  const isVerified = biometricVerification();
  socket.emit('biometricResult', isVerified ? 'Biometric verification successful' : 'Biometric verification failed');
};

// Cloud Function logic
function biometricVerificationCloudFunction(req, res) {
  // Construct the JSON response
  const isVerified = biometricVerification();
  const jsonResponse = {
    sessionInfo: {
      parameters: {
        isVerified: isVerified,
      },
    },
  };

  // Send the response
  res.status(200).send(jsonResponse);
}

// Handle stop action from Dialogflow
app.post('/stopBiometricVerification', (req, res) => {
  // Stop sending biometric verification result to clients
  clearInterval(interval);
  console.log('Biometric verification stopped');
  res.status(200).json({ message: 'Biometric verification stopped' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
