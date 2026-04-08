import { Request, Response } from "express";
import { ApiResponse } from "../../kernel/api.response";
import { TypesResponse } from "../../kernel/types.response";
import { cancelAppointment, createAppointment, getAppointments, updateAppointment } from "./appointment.service";

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const role = req.role;

    if (!role) {
      return res.status(401).json(new ApiResponse(TypesResponse.ERROR, "Rol no disponible en el token"));
    }

    const appointments = await getAppointments(role, req.username);

    return res.json(
      new ApiResponse(appointments, TypesResponse.SUCCESS, "Citas obtenidas correctamente")
    );
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(TypesResponse.ERROR, "Error obteniendo citas")
    );
  }
};

export const createAppointmentController = async (req: Request, res: Response) => {
  try {
    const role = req.role;

    if (!role) {
      return res.status(401).json(new ApiResponse(TypesResponse.ERROR, "Rol no disponible en el token"));
    }

    const appointment = await createAppointment(req.body, role, req.username);

    return res.status(201).json(
      new ApiResponse(appointment, TypesResponse.SUCCESS, "Cita agendada correctamente")
    );
  } catch (error) {
    return res.status(400).json(
      new ApiResponse(TypesResponse.ERROR, (error as Error).message)
    );
  }
};

export const updateAppointmentController = async (req: Request, res: Response) => {
  try {
    const role = req.role;

    if (!role) {
      return res.status(401).json(new ApiResponse(TypesResponse.ERROR, "Rol no disponible en el token"));
    }

    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json(new ApiResponse(TypesResponse.ERROR, "Id de cita invalido"));
    }

    const appointment = await updateAppointment(id, req.body, role, req.username);

    return res.json(
      new ApiResponse(appointment, TypesResponse.SUCCESS, "Cita actualizada correctamente")
    );
  } catch (error) {
    return res.status(400).json(
      new ApiResponse(TypesResponse.ERROR, (error as Error).message)
    );
  }
};

export const cancelAppointmentController = async (req: Request, res: Response) => {
  try {
    const role = req.role;

    if (!role) {
      return res.status(401).json(new ApiResponse(TypesResponse.ERROR, "Rol no disponible en el token"));
    }

    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json(new ApiResponse(TypesResponse.ERROR, "Id de cita invalido"));
    }

    const appointment = await cancelAppointment(id, role, req.username);

    return res.json(
      new ApiResponse(appointment, TypesResponse.SUCCESS, "Cita cancelada correctamente")
    );
  } catch (error) {
    return res.status(400).json(
      new ApiResponse(TypesResponse.ERROR, (error as Error).message)
    );
  }
};