import api from "../api/axios";
import type { ServiceEntity, ServiceFormInput } from "./../types/service.types";

interface ApiEnvelope<T> {
  result?: T;
}

const unwrapResult = <T,>(payload: unknown): T | undefined => {
  if (payload && typeof payload === "object" && "result" in payload) {
    return (payload as ApiEnvelope<T>).result;
  }

  return payload as T;
};

export const getServices = async (): Promise<ServiceEntity[]> => {
  const response = await api.get("services/getAll?page=1&size=200&includeInactive=true");
  const list = unwrapResult<ServiceEntity[]>(response.data);
  return Array.isArray(list) ? list : [];
};

export const getPublicActiveServices = async (): Promise<ServiceEntity[]> => {
  const response = await api.get("services/public");
  const list = unwrapResult<ServiceEntity[]>(response.data);
  return Array.isArray(list) ? list : [];
};

export const createService = async (service: ServiceFormInput): Promise<ServiceEntity> => {
  const response = await api.post("services/createService", service);
  const created = unwrapResult<ServiceEntity>(response.data);

  if (!created) {
    throw new Error("No se pudo leer el servicio creado");
  }

  return created;
};

export const updateService = async (id: number, service: ServiceFormInput): Promise<ServiceEntity> => {
  const response = await api.put(`services/updateService/${id}`, service);
  const updated = unwrapResult<ServiceEntity>(response.data);

  if (!updated) {
    throw new Error("No se pudo leer el servicio actualizado");
  }

  return updated;
};

export const deactivateService = async (id: number): Promise<ServiceEntity> => {
  const response = await api.delete(`services/deleteService/${id}`);
  const deactivated = unwrapResult<ServiceEntity>(response.data);

  if (!deactivated) {
    throw new Error("No se pudo leer el servicio desactivado");
  }

  return deactivated;
};

export const reactivateService = async (id: number): Promise<ServiceEntity> => {
  const response = await api.patch(`services/reactivateService/${id}`);
  const reactivated = unwrapResult<ServiceEntity>(response.data);

  if (!reactivated) {
    throw new Error("No se pudo leer el servicio reactivado");
  }

  return reactivated;
};