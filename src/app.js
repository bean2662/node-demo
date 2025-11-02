require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

/** ------------------------------------------
 * 🧩 Kết nối MongoDB
 * ------------------------------------------ */
connectDB();

/** ------------------------------------------
 * ⚙️ Middleware toàn cục
 * ------------------------------------------ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** ------------------------------------------
 * 🚀 Route test
 * ------------------------------------------ */
app.get('/', (req, res) => {
    res.send('✅ Server Express đang hoạt động!');
});

/** ------------------------------------------
 * 🛠️ API routes
 * ------------------------------------------ */
app.use('/api', routes);

/** ------------------------------------------
 * 🧱 Middleware xử lý lỗi
 * ------------------------------------------ */
app.use(errorHandler);

module.exports = app;
