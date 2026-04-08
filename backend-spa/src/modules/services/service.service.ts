import { Service } from "../../models/service.model";

export class ServiceService {

  private static validateServiceInput(data: any) {
    if (!data?.name || String(data.name).trim() === "") {
      throw new Error("El nombre del servicio es obligatorio")
    }

    const price = Number(data.price)
    if (Number.isNaN(price) || price <= 0) {
      throw new Error("El precio debe ser mayor a 0")
    }

    const duration = Number(data.duration)
    if (!Number.isInteger(duration) || duration <= 0) {
      throw new Error("La duracion debe ser un numero entero mayor a 0")
    }
  }

  static async create(data: any) {
    try {
      this.validateServiceInput(data)
      return await Service.create(data)
    } catch (error: any) {
      console.error('Error en create:', error)
      throw new Error(error.message || 'Error al crear el servicio')
    }
  }

  static async findAll(page = 1, size = 10, includeInactive = false) {
    try {
      const offset = (page - 1) * size
      const where = includeInactive ? {} : { is_active: true }

      const { rows, count } = await Service.findAndCountAll({
        where,
        limit: size,
        offset,
        order: [["id", "DESC"]]
      })
      return { data: rows, total: count }
    } catch (error: any) {
      console.error('Error en findAll:', error)
      throw new Error(error.message || 'Error al obtener los servicios')
    }
  }

  static async findById(id: number) {
    try {
      return await Service.findOne({
        where: { id, is_active: true }
      })
    } catch (error: any) {
      console.error('Error en findById:', error)
      throw new Error(error.message || 'Error al obtener el servicio')
    }
  }

  static async update(id: number, data: any) {
    try {
      const service = await Service.findByPk(id)
      if (!service) return null

      if (data.name !== undefined || data.price !== undefined || data.duration !== undefined) {
        this.validateServiceInput({
          name: data.name ?? service.get("name"),
          price: data.price ?? service.get("price"),
          duration: data.duration ?? service.get("duration")
        })
      }

      await service.update(data)
      return service
    } catch (error: any) {
      console.error('Error en update:', error)
      throw new Error(error.message || 'Error al actualizar el servicio')
    }
  }

  static async findActive() {
    try {
      return await Service.findAll({
        where: { is_active: true },
        order: [["id", "DESC"]]
      })
    } catch (error: any) {
      console.error("Error en findActive:", error)
      throw new Error(error.message || "Error al obtener servicios activos")
    }
  }

  static async delete(id: number) {
    try {
      const service = await Service.findByPk(id)
      if (!service) return null
      await service.update({ is_active: false })
      return service
    } catch (error: any) {
      console.error('Error en delete:', error)
      throw new Error(error.message || 'Error al eliminar el servicio')
    }
  }

  static async reactivate(id: number) {
    try {
      const service = await Service.findByPk(id)
      if (!service) return null
      await service.update({ is_active: true })
      return service
    } catch (error: any) {
      console.error('Error en reactivate:', error)
      throw new Error(error.message || 'Error al reactivar el servicio')
    }
  }
}