import { Router } from "express";
import { ServiceController } from '../services/service.controller'
import { protectedEndpoint } from "../../security/protected-endpoint";

const router = Router();

router.get('/public', ServiceController.findActiveServices)
router.post('/createService', protectedEndpoint('ADMIN'), ServiceController.createService)
router.get('/getAll', protectedEndpoint('ADMIN', 'EMPLOYEE'), ServiceController.findAllServices)
router.get('/getById/:id', protectedEndpoint('ADMIN', 'EMPLOYEE'), ServiceController.findByIdService)
router.put('/updateService/:id', protectedEndpoint('ADMIN'), ServiceController.updateService)
router.delete('/deleteService/:id', protectedEndpoint('ADMIN'), ServiceController.deleteService)
router.patch('/reactivateService/:id', protectedEndpoint('ADMIN'), ServiceController.reactivateService)

export default router;