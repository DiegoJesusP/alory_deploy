import { Router } from "express";
import { protectedEndpoint } from "../../security/protected-endpoint";
import { ProductController } from "./product.controller";

const router = Router();

router.post('/createProduct', protectedEndpoint('ADMIN'), ProductController.createProduct)
router.get('/getAll', protectedEndpoint('ADMIN'), ProductController.getProducts)
router.get('/getById/:id', protectedEndpoint('ADMIN'), ProductController.findByIdProduct)
router.put('/updateProduct/:id', protectedEndpoint('ADMIN'), ProductController.updateProduct)
router.delete('/deleteProduct/:id', protectedEndpoint('ADMIN'), ProductController.deleteProduct)

export default router;