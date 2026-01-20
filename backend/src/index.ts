import dotenv from 'dotenv';
import { createApp } from './app';
import { initializeFirebase } from './config/firebase';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Initialize Firebase
    console.log('Initializing Firebase...');
    initializeFirebase();
    console.log('Firebase initialized successfully');

    // Create Express app
    const app = createApp();

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
