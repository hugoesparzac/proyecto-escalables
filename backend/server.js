const app = require('./src/app');

const PORT = process.env.PORT || 3002; // Changed default port again

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 API Documentation: http://localhost:${PORT}/api-docs`);
});

// Nodemon restarts the server when this file is saved
// To force a restart, uncomment the following line and save the file
// console.log('Forcing nodemon to restart');
