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

// Serve HTML file
app.get('/', (req, res) => {
  // Call the biometricVerificationCloudFunction when a client accesses the root URL
  biometricVerificationCloudFunction(req, res);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Define event handlers or send initial data to the client if needed
});

// Handle biometric verification and send result over WebSocket
const biometricVerification = () => {
  // Simulating biometric verification result (true for success, false for failure)
  const isVerified = Math.random() < 0.5; // Randomly generate true or false for demo
  return isVerified;
};

const sendBiometricResult = () => {
  const isVerified = biometricVerification();
  io.emit('biometricResult', isVerified ? 'Biometric verification successful' : 'Biometric verification failed');
};

// Cloud Function logic
function biometricVerificationCloudFunction(req, res) {
  // Send biometric verification result to client every 5 seconds
  interval = setInterval(sendBiometricResult, 5000);

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
