import { Request, Response } from 'express'
import { UserService } from './user.service'
import { ApiResponse } from '../../kernel/api.response'
import { TypesResponse } from '../../kernel/types.response'
import { Metadata } from '../../kernel/metadata'

export class UserController {

  //Crear empleado
  static async createEmployee(req: Request, res: Response) {
    try {
      const employee = await UserService.createEmployee(req.body)

      return res.json(
        new ApiResponse(employee, TypesResponse.SUCCESS, 'Empleado creado correctamente')
      )

    } catch (error) {
      return res.status(400).json(
        new ApiResponse(TypesResponse.ERROR, (error as Error).message || 'Error al crear empleado')
      )
    }
  }


  //Obtener todos los empleados (con paginación)
  static async findAllEmployees(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const size = Number(req.query.size) || 10

      const { data, total } = await UserService.getEmployees(page, size)
      const totalPages = Math.ceil(total / size)

      const metadata = new Metadata(
        total,
        data.length,
        page,
        size,
        totalPages
      )

      return res.json(
        new ApiResponse(data, metadata, TypesResponse.SUCCESS, 'Empleados obtenidos')
      )

    } catch (error) {
      return res.status(500).json(
        new ApiResponse(TypesResponse.ERROR, 'Error al obtener empleados')
      )
    }
  }


  //Obtener empleado por ID
  static async findByIdEmployee(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const employee = await UserService.findByIdEmployee(id)

      if (!employee) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, 'Empleado no encontrado')
        )
      }

      return res.json(
        new ApiResponse(employee, TypesResponse.SUCCESS, 'Empleado encontrado')
      )

    } catch (error) {
      return res.status(500).json(
        new ApiResponse(TypesResponse.ERROR, 'Error al obtener empleado')
      )
    }
  }


  //Actualizar empleado
  static async updateEmployee(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const employee = await UserService.updateEmployee(id, req.body)

      if (!employee) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, 'Empleado no encontrado')
        )
      }

      return res.json(
        new ApiResponse(employee, TypesResponse.SUCCESS, 'Empleado actualizado')
      )

    } catch (error) {
      return res.status(400).json(
        new ApiResponse(TypesResponse.ERROR, (error as Error).message || 'Error al actualizar empleado')
      )
    }
  }


  //Eliminar empleado (soft delete)
  static async deleteEmployee(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const employee = await UserService.deleteEmployee(id)

      if (!employee) {
        return res.status(404).json(
          new ApiResponse(TypesResponse.WARNING, 'Empleado no encontrado')
        )
      }

      return res.json(
        new ApiResponse(employee, TypesResponse.SUCCESS, 'Empleado eliminado')
      )

    } catch (error) {
      return res.status(500).json(
        new ApiResponse(TypesResponse.ERROR, 'Error al eliminar empleado')
      )
    }
  }
}