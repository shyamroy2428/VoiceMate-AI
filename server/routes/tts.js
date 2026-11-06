import { Router } from 'express';
import { postSynthesis } from '../controllers/speechController.js';

const router = Router();
router.post('/', postSynthesis);
export default router;
