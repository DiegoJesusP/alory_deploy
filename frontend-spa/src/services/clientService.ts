import api from "../api/axios";
import type { Client } from "../types/clients.types";

export const getClients = async (): Promise<Client[]> => {
  const response = await api.get("/clients/getAllClients");
  return response.data;
};

export const getClientById = async (id: number): Promise<Client> => {
  const response = await api.get(`/clients/getClientById/${id}`);
  return response.data;
};

export const createClient = async (client: Partial<Client>) => {
  const response = await api.post("/clients/createClient", client);
  return response.data;
};

export const updateClient = async (id: number, client: Partial<Client>) => {
  const response = await api.put(`/clients/updateClient/${id}`, client);
  return response.data;
};

export const deleteClient = async (id: number) => {
  const response = await api.delete(`/clients/deleteClient/${id}`);
  return response.data;
};