const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Storage config: files saved in 'uploads' folder, keep original filename but add timestamp
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Create uploads folder if missing
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Serve static files (uploads and frontend)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public')); // serve your frontend here

// Keep a simple in-memory gallery list (will reset if server restarts)
let gallery = [];

// Endpoint to get current gallery JSON
app.get('/api/gallery', (req, res) => {
  res.json(gallery);
});

// Endpoint to upload media files (accept multiple files)
app.post('/upload', upload.array('media', 10), (req, res) => {
  if (!req.files) return res.status(400).json({ error: 'No files uploaded' });

  // Add new files to gallery array
  req.files.forEach(file => {
    gallery.push({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video'
    });
  });

  res.json({ success: true, files: req.files.length });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
