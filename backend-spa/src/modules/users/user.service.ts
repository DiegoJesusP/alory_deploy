import { User } from "../../models/user.model";
import { hashPassword } from "../../security/bcrypt";
import { Op } from "sequelize";

export class UserService {

  private static sanitizeEmployeeUpdatePayload(data: any) {
    const payload = { ...data };

    // Defensive: never allow privilege or identity mutations from employee update endpoint.
    delete payload.id;
    delete payload.role;
    delete payload.is_active;
    delete payload.token;
    delete payload.date_expiration;
    delete payload.created_at;

    return payload;
  }

  private static validatePasswordSecurity(password: string) {
    const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!passwordRule.test(password)) {
      throw new Error("La contrasena debe tener minimo 8 caracteres, mayuscula, minuscula, numero y simbolo");
    }
  }

  private static validateRequiredFields(data: any) {
    const requiredFields: Array<{ key: string; label: string }> = [
      { key: "full_name", label: "Nombre completo" },
      { key: "email", label: "Correo electronico" },
      { key: "phone", label: "Telefono" },
      { key: "birth_date", label: "Fecha de nacimiento" },
      { key: "username", label: "Nombre de usuario" },
      { key: "password", label: "Contrasena" },
    ];

    for (const field of requiredFields) {
      const value = data?.[field.key];
      if (value === undefined || value === null || String(value).trim() === "") {
        throw new Error(`${field.label} es obligatorio`);
      }
    }
  }

  private static async ensureUniqueFields(email: string, username: string, excludeId?: number) {
    const conflict = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      },
    });

    if (!conflict) return;

    if (conflict.get("email") === email) {
      throw new Error("El correo electronico ya esta registrado");
    }

    if (conflict.get("username") === username) {
      throw new Error("El nombre de usuario ya esta registrado");
    }
  }

  //Crear empleado
  static async createEmployee(data: any) {
    try {
      this.validateRequiredFields(data);
      this.validatePasswordSecurity(String(data.password));
      await this.ensureUniqueFields(String(data.email).trim(), String(data.username).trim());

      const hashedPassword = await hashPassword(data.password);

      const user = await User.create({
        ...data,
        email: String(data.email).trim().toLowerCase(),
        username: String(data.username).trim(),
        password: hashedPassword,
        role: "EMPLOYEE"
      });

      const userData = user.toJSON();
      delete userData.password;

      return userData;

    } catch (error) {
      console.error("Error en createEmployee:", error);
      throw error;
    }
  }


  //Obtener empleados (paginado)
  static async getEmployees(page = 1, size = 10) {
    try {
      const offset = (page - 1) * size;

      const { rows, count } = await User.findAndCountAll({
        where: {
          role: "EMPLOYEE",
          is_active: true
        },
        attributes: { exclude: ['password'] },
        limit: size,
        offset
      });

      return { data: rows, total: count };

    } catch (error) {
      console.error("Error en getEmployees:", error);
      throw new Error("Error al obtener empleados");
    }
  }


  //Obtener empleado por ID
  static async findByIdEmployee(id: number) {
    try {
      return await User.findOne({
        where: {
          id,
          role: "EMPLOYEE",
          is_active: true
        },
        attributes: { exclude: ['password'] }
      });

    } catch (error) {
      console.error("Error en findByIdEmployee:", error);
      throw new Error("Error al obtener empleado");
    }
  }


  //Actualizar empleado
  static async updateEmployee(id: number, data: any) {
    try {
      const user = await User.findOne({
        where: {
          id,
          role: "EMPLOYEE",
          is_active: true,
        },
      });

      if (!user) return null;

      const sanitizedData = this.sanitizeEmployeeUpdatePayload(data);

      if (sanitizedData.email || sanitizedData.username) {
        await this.ensureUniqueFields(
          String(sanitizedData.email ?? user.get("email")).trim(),
          String(sanitizedData.username ?? user.get("username")).trim(),
          id
        );
      }

      if (sanitizedData.password) {
        this.validatePasswordSecurity(String(sanitizedData.password));
        sanitizedData.password = await hashPassword(sanitizedData.password);
      }

      if (sanitizedData.email) sanitizedData.email = String(sanitizedData.email).trim().toLowerCase();
      if (sanitizedData.username) sanitizedData.username = String(sanitizedData.username).trim();

      await user.update(sanitizedData);

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      return updatedUser;

    } catch (error) {
      console.error("Error en updateEmployee:", error);
      throw error;
    }
  }


  //Eliminar empleado (soft delete)
  static async deleteEmployee(id: number) {
    try {
      const user = await User.findOne({
        where: {
          id,
          role: "EMPLOYEE",
          is_active: true,
        },
      });

      if (!user) return null;

      await user.update({ is_active: false });

      const deletedUser = user.toJSON();
      delete deletedUser.password;

      return deletedUser;

    } catch (error) {
      console.error("Error en deleteEmployee:", error);
      throw new Error("Error al eliminar empleado");
    }
  }
}