import { Request, Response } from "express";
import { ClientService } from "./client.service";
import { ApiResponse } from "../../kernel/api.response";
import { TypesResponse } from "../../kernel/types.response";
import { Metadata } from "../../kernel/metadata";

export class ClientController {

  // Crear cliente
  static async createClient(req: Request, res: Response) {
    try {
      const client = await ClientService.createClient(req.body);

      return res.json(
        new ApiResponse(client, TypesResponse.SUCCESS, "Cliente creado correctamente")
      );

    } catch (error: any) {
      return res.status(400).json(
        new ApiResponse(TypesResponse.ERROR, error.message)
      );
    }
  }


  // Obtener todos los clientes (paginado)
  static async findAllClients(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const size = Number(req.query.size) || 10;

      const { data, total } = await ClientService.getClients(page, size);
      const totalPages = Math.ceil(total / size);

      const metadata = new Metadata(
        total,
        data.length,
        page,
        size,
        totalPages
      );

      return res.json(
        new ApiResponse(data, metadata, TypesResponse.SUCCESS, "Clientes obtenidos")
      );

    } catch (error: any) {
      return res.status(500).json(
        new ApiResponse(TypesResponse.ERROR, "Error al obtener clientes")
      );
    }
  }


  // Obtener cliente por ID
  static async findByIdClient(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const client = await ClientService.findByIdClient(id);

      if (!client) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, "Cliente no encontrado")
        );
      }

      return res.json(
        new ApiResponse(client, TypesResponse.SUCCESS, "Cliente encontrado")
      );

    } catch (error: any) {
      return res.status(500).json(
        new ApiResponse(TypesResponse.ERROR, "Error al obtener cliente")
      );
    }
  }


  // Actualizar cliente
  static async updateClient(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const client = await ClientService.updateClient(id, req.body);

      if (!client) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, "Cliente no encontrado")
        );
      }

      return res.json(
        new ApiResponse(client, TypesResponse.SUCCESS, "Cliente actualizado")
      );

    } catch (error: any) {
      return res.status(400).json(
        new ApiResponse(TypesResponse.ERROR, error.message)
      );
    }
  }


  // Eliminar cliente (soft delete)
  static async deleteClient(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const client = await ClientService.deleteClient(id);

      if (!client) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, "Cliente no encontrado")
        );
      }

      return res.json(
        new ApiResponse(client, TypesResponse.SUCCESS, "Cliente eliminado")
      );

    } catch (error: any) {
      return res.status(500).json(
        new ApiResponse(TypesResponse.ERROR, "Error al eliminar cliente")
      );
    }
  }
}
