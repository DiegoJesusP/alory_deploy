import { Router } from "express";
import { ClientController } from "./client.controller";
import { protectedEndpoint } from "../../security/protected-endpoint";

const router = Router();

//Crear cliente (ADMIN + EMPLOYEE)
router.post(
  "/createClient",
  protectedEndpoint("ADMIN", "EMPLOYEE"),
  ClientController.createClient
);

//Obtener todos los clientes (paginado)
router.get(
  "/getAllClients",
  protectedEndpoint("ADMIN", "EMPLOYEE"),
  ClientController.findAllClients
);

//Obtener cliente por ID
router.get(
  "/getClientById/:id",
  protectedEndpoint("ADMIN", "EMPLOYEE"),
  ClientController.findByIdClient
);

//Actualizar cliente
router.put(
  "/updateClient/:id",
  protectedEndpoint("ADMIN", "EMPLOYEE"),
  ClientController.updateClient
);

//Eliminar cliente (solo ADMIN)
router.delete(
  "/deleteClient/:id",
  protectedEndpoint("ADMIN"),
  ClientController.deleteClient
);

export default router;