import { Router } from 'express';
const router = Router();
import { createOrder } from '../controllers/orderController';


router.get('/track/:id', trackOrder);

// Create new order
router.post('/', createOrder);


export default router;