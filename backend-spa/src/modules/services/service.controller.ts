import { Request, Response } from 'express'
import { ServiceService } from '../services/service.service'
import { ApiResponse } from '../../kernel/api.response'
import { TypesResponse } from '../../kernel/types.response'
import { Metadata } from '../../kernel/metadata'

export class ServiceController {

  static async createService(req: Request, res: Response) {
    try {
      const service = await ServiceService.create(req.body)
      return res.json(
        new ApiResponse(service, TypesResponse.SUCCESS, 'Servicio creado correctamente')
      )

    } catch (error) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error al crear el servicio'))
    }
  }


  static async findAllServices(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const size = Number(req.query.size) || 10
      const isAdmin = req.role === "ADMIN"
      const includeInactive = isAdmin && String(req.query.includeInactive) === "true"

      const { data, total } = await ServiceService.findAll(page, size, includeInactive)
      const totalPages = Math.ceil(total / size)

      const metadata = new Metadata(
        total,
        data.length,
        page,
        size,
        totalPages
      )

      return res.json(
        new ApiResponse(data, metadata, TypesResponse.SUCCESS, 'Servicios obtenidos')
      )

    } catch (error) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error al obtener servicios'))
    }
  }

  static async findActiveServices(req: Request, res: Response) {
    try {
      const services = await ServiceService.findActive()

      return res.json(
        new ApiResponse(services, TypesResponse.SUCCESS, "Servicios activos obtenidos")
      )
    } catch (error) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, "Error al obtener servicios activos"))
    }
  }


  static async findByIdService(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const service = await ServiceService.findById(id)

      if (!service) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, 'Servicio no encontrado')
        )
      }

      return res.json(
        new ApiResponse(service, TypesResponse.SUCCESS, 'Servicio encontrado')
      )

    } catch (error) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error al obtener el servicio'))
    }
  }


  static async updateService(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const service = await ServiceService.update(id, req.body)

      if (!service) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, 'Servicio no encontrado')
        )
      }

      return res.json(
        new ApiResponse(service, TypesResponse.SUCCESS, 'Servicio actualizado')
      )

    } catch (error) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error al actualizar el servicio'))
    }
  }


  static async deleteService(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const service = await ServiceService.delete(id)

      if (!service) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, 'Servicio no encontrado')
        )
      }

      return res.json(
        new ApiResponse(service, TypesResponse.SUCCESS, 'Servicio eliminado')
      )

    } catch (error) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error al eliminar el servicio'))
    }
  }

  static async reactivateService(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const service = await ServiceService.reactivate(id)

      if (!service) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, 'Servicio no encontrado')
        )
      }

      return res.json(
        new ApiResponse(service, TypesResponse.SUCCESS, 'Servicio reactivado')
      )

    } catch (error) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, 'Error al reactivar el servicio'))
    }
  }
}