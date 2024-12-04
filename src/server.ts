// src/server.ts
import express from 'express';
import bodyParser from 'body-parser';
import compilerRoutes from './routes/compiler.route';
import multer from 'multer';
import { loadCompilerImage } from './services/compiler.service'; // Import hàm load image

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());  // Để xử lý JSON trong request body

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Giữ tên gốc
    cb(null, file.originalname);
    
    // Hoặc thêm timestamp để tránh trùng
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // cb(null, file.originalname.split('.')[0] + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Đăng ký routes
app.use('/api', upload.fields([
  { name: 'source', maxCount: 1 },
  { name: 'config', maxCount: 1 }
]), compilerRoutes);

async function startServer() {
  try {
    console.log('Starting server...');
    await loadCompilerImage(); // Load image khi server khởi động

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
