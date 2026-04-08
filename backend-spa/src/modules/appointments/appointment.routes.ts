import { Router } from "express";
import {
	cancelAppointmentController,
	createAppointmentController,
	getAllAppointments,
	updateAppointmentController,
} from "./appointment.controller";
import { protectedEndpoint } from "../../security/protected-endpoint";

const router = Router();

router.get("/", protectedEndpoint("ADMIN", "EMPLOYEE"), getAllAppointments);
router.get("/getAll", protectedEndpoint("ADMIN", "EMPLOYEE"), getAllAppointments);
router.post("/create", protectedEndpoint("ADMIN", "EMPLOYEE"), createAppointmentController);
router.put("/update/:id", protectedEndpoint("ADMIN", "EMPLOYEE"), updateAppointmentController);
router.patch("/cancel/:id", protectedEndpoint("ADMIN", "EMPLOYEE"), cancelAppointmentController);

export default router;