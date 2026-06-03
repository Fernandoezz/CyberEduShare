require('dotenv').config();
const PORT = process.env.PORT || 5000;
const app = require('./app');
const connectDB = require('./config/db');

connectDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});