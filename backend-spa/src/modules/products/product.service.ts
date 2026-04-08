import { Product } from "../../models/product.model";

export class ProductService {

  static async createProduct(data: any) {
    try {
      const product = await Product.create(data);
      return product;

    } catch (error) {
      console.error("Error en createProduct:", error);
      throw new Error("Error al crear producto");
    }
  }

  static async getProducts(page = 1, size = 10) {
    try {
      const offset = (page - 1) * size;
      const { rows, count } = await Product.findAndCountAll({
        where: {
          is_active: true
        },
        limit: size,
        offset
      });
      return { data: rows, total: count };

    } catch (error) {
      console.error("Error en getProducts:", error);
      throw new Error("Error al obtener productos");
    }
  }

  static async findByIdProduct(id: number) {
    try {
      return await Product.findOne({
        where: {
          id,
          is_active: true
        }
      });

    } catch (error) {
      console.error("Error en findByIdProduct:", error);
      throw new Error("Error al obtener producto");
    }
  }

  static async updateProduct(id: number, data: any) {
    try {
      const product = await Product.findByPk(id);
      if (!product) return null;

      await product.update(data);
      return product;

    } catch (error) {
      console.error("Error en updateProduct:", error);
      throw new Error("Error al actualizar producto");
    }
  }

  static async deleteProduct(id: number) {
    try {
      const product = await Product.findByPk(id);
      if (!product) return null;

      await product.update({ is_active: false });
      return product;

    } catch (error) {
      console.error("Error en deleteProduct:", error);
      throw new Error("Error al eliminar producto");
    }
  }
}