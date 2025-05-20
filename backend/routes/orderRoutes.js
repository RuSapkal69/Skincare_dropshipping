import { Router } from 'express';
const router = Router();
import { createOrder } from '../controllers/orderController.js';
import { trackOrder } from '../controllers/orderController.js';


router.get('/track/:id', trackOrder);

// Create new order
router.post('/', createOrder);


export default router;