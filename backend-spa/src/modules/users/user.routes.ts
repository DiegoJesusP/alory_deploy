import { Router } from "express";
import { UserController } from "./user.controller";
import { protectedEndpoint } from "../../security/protected-endpoint";

const router = Router();

//(solo ADMIN puede manejar empleados)
router.post('/createEmployee', protectedEndpoint("ADMIN"), UserController.createEmployee);
router.get('/getAllEmployees', protectedEndpoint("ADMIN"), UserController.findAllEmployees);
router.get('/getEmployeeById/:id', protectedEndpoint("ADMIN"), UserController.findByIdEmployee);
router.put('/updateEmployee/:id', protectedEndpoint("ADMIN"), UserController.updateEmployee);
router.delete('/deleteEmployee/:id', protectedEndpoint("ADMIN"), UserController.deleteEmployee);

export default router;