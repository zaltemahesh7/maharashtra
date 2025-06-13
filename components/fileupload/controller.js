
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const singleFileStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const folderName = req.body.folderName || 'default';
    const uploadPath = path.join(__dirname, 'components/uploads', folderName);
    try {
      if (!fs.existsSync(uploadPath)) {
        await fs.promises.mkdir(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error creating directory:', error);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileNameWithoutExtension = path.basename(file.originalname, fileExtension);
    const utcDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const newFileName = `${fileNameWithoutExtension}_${utcDate}${fileExtension}`;
    cb(null, newFileName);
  }
});

const singleFileUpload = multer({ storage: singleFileStorage }).single('file');

exports.uploadSingleFile = (req, res) => {
  singleFileUpload(req, res, (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ success: false, message: 'File upload failed' });
    }
    const fileNameWithExtension = req.file.filename;
    const folderName = req.body.folderName || 'default';
    const filePath = `uploads/${folderName}/${fileNameWithExtension}`;
    res.json({ success: true, message: 'File uploaded successfully', filePath });
  });
};

const multipleFilesUpload = multer({ storage: singleFileStorage }).array('files', 10);

exports.uploadMultipleFiles = (req, res) => {
  multipleFilesUpload(req, res, (err) => {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(500).json({ success: false, message: 'Files upload failed' });
    }
    const files = req.files.map(file => {
      const fileNameWithExtension = file.filename;
      const folderName = req.body.folderName || 'default';
      const filePath = `uploads/${folderName}/${fileNameWithExtension}`;
      return filePath;
    });
    res.json({ success: true, message: 'Files uploaded successfully', files });
  });
};
