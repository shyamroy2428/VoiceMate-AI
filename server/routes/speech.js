import { Router } from 'express';
import multer from 'multer';
import { postTranscription, postSynthesis } from '../controllers/speechController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024, files: 1, fieldSize: 1024 } });
router.post('/', upload.single('audio'), postTranscription);
router.post('/synthesize', postSynthesis);
export default router;
