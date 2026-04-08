import { Client } from "../../models/client.model";

export class ClientService {

  // Expresiones regulares
  private static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static phoneRegex = /^[0-9]{10}$/;

  // Crear cliente
  static async createClient(data: any) {
    try {

      // 🔹 Validaciones obligatorias
      if (!data.full_name) {
        throw new Error("El nombre es obligatorio");
      }

      if (!data.phone) {
        throw new Error("El teléfono es obligatorio");
      }

      // 🔹 Validación de teléfono
      if (!this.phoneRegex.test(data.phone)) {
        throw new Error("El teléfono debe tener 10 dígitos");
      }

      // 🔹 Validación de email
      if (data.email) {
        if (!this.emailRegex.test(data.email)) {
          throw new Error("Formato de email inválido");
        }

        // 🔹 Verificar duplicado
        const existing = await Client.findOne({
          where: { email: data.email }
        });

        if (existing) {
          throw new Error("El correo ya está registrado");
        }
      }

      const client = await Client.create({
        ...data,
        is_active: true
      });

      return client;

    } catch (error) {
      console.error("Error en createClient:", error);
      throw error;
    }
  }


  // Obtener clientes (paginado)
  static async getClients(page = 1, size = 10) {
    try {
      const offset = (page - 1) * size;

      const { rows, count } = await Client.findAndCountAll({
        where: { is_active: true },
        limit: size,
        offset
      });

      return { data: rows, total: count };

    } catch (error) {
      console.error("Error en getClients:", error);
      throw new Error("Error al obtener clientes");
    }
  }


  // Obtener cliente por ID
  static async findByIdClient(id: number) {
    try {
      return await Client.findOne({
        where: { id, is_active: true }
      });

    } catch (error) {
      console.error("Error en findByIdClient:", error);
      throw new Error("Error al obtener cliente");
    }
  }


  // Actualizar cliente
  static async updateClient(id: number, data: any) {
    try {
      const client = await Client.findByPk(id);
      if (!client) return null;

      // 🔹 Validaciones si vienen datos nuevos

      if (data.phone) {
        if (!this.phoneRegex.test(data.phone)) {
          throw new Error("El teléfono debe tener 10 dígitos");
        }
      }

      if (data.email) {
        if (!this.emailRegex.test(data.email)) {
          throw new Error("Formato de email inválido");
        }

        const existing = await Client.findOne({
          where: { email: data.email }
        });

        if (existing && existing.getDataValue("id") !== id) {
          throw new Error("El correo ya está registrado");
        }
      }

      await client.update(data);

      return client;

    } catch (error) {
      console.error("Error en updateClient:", error);
      throw error;
    }
  }


  // Eliminar cliente (soft delete)
  static async deleteClient(id: number) {
    try {
      const client = await Client.findByPk(id);
      if (!client) return null;

      await client.update({ is_active: false });

      return client;

    } catch (error) {
      console.error("Error en deleteClient:", error);
      throw new Error("Error al eliminar cliente");
    }
  }
}
