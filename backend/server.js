require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { bootstrapTaskEvents } = require('./services/events/bootstrapTaskEvents');

const app = express();

process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[uncaughtException]', error);
});

// Connect to MongoDB
connectDB();
bootstrapTaskEvents();

// Middleware
app.use((req, res, next) => {
    const started = Date.now();
    const traceId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    req.traceId = traceId;

    console.log(`[REQ] ${req.method} ${req.originalUrl}`, {
        traceId,
        body: req.body,
    });

    res.on('finish', () => {
        console.log(`[RES] ${req.method} ${req.originalUrl} ${res.statusCode}`, {
            traceId,
            ms: Date.now() - started,
        });
    });

    next();
});

app.use(cors({
    origin: [
        'http://localhost:5173', // Frontend dev server
        'http://localhost:3000',
        process.env.FRONTEND_URL,
    ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/suggestions', require('./routes/suggestions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/workload', require('./routes/workload'));
app.use('/api/employees', require('./routes/employees'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[ExpressError]', {
        traceId: req.traceId,
        message: err.message,
        stack: err.stack,
    });
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        traceId: req.traceId,
    });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server PID ${process.pid}`);
    console.log(`Server running on http://localhost:${PORT}`);
});