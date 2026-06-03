const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',           require('./routes/authRoutes'));
app.use('/api/users',           require('./routes/usersRoutes'));
app.use('/api/content',        require('./routes/contentRoutes'));
app.use('/api/courses',         require('./routes/coursesRoutes'));
app.use('/api/questions',      require('./routes/questionRoutes'));
app.use('/api/projects',       require('./routes/projectRoutes'));
app.use('/api/labs',           require('./routes/labRoutes'));
app.use('/api/challenges',     require('./routes/challengeRoutes'));
app.use('/api/performance',    require('./routes/performanceRoutes'));
app.use('/api/recommendations',require('./routes/recommendationRoutes'));
app.use('/api/notifications',   require('./routes/notificationRoutes'));
app.use('/api/admin',          require('./routes/adminRoutes'));

// ── Global error handler — catches multer/cloudinary errors
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;