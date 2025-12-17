import multer from "multer";

const storage = multer.diskStorage({
    destination: './public/temp',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

const upload = multer({storage: storage});

export default upload;

