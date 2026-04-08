import { Request, Response } from "express";
import { ProductService } from "../products/product.service";
import { ApiResponse } from "../../kernel/api.response";
import { TypesResponse } from "../../kernel/types.response";
import { Metadata } from "../../kernel/metadata";

export class ProductController {

  static async createProduct(req: Request, res: Response) {
    try {
      const product = await ProductService.createProduct(req.body);
      return res.status(201).json(new ApiResponse(product, TypesResponse.SUCCESS, "Producto creado con éxito"));

    } catch (error: any) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, error.message));
    }
  }


  static async getProducts(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const size = Number(req.query.size) || 10;

      const { data, total } = await ProductService.getProducts(page, size);
      const totalPages = Math.ceil(total / size);

      const metadata = new Metadata(
        total,
        data.length,
        page,
        size,
        totalPages
      );
      return res.json(new ApiResponse(data, metadata, TypesResponse.SUCCESS, "Productos obtenidos"));

    } catch (error: any) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, error.message));
    }
  }


  static async findByIdProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const product = await ProductService.findByIdProduct(id);

      if (!product) {
        return res.status(404).json(new ApiResponse(TypesResponse.WARNING, "Producto no encontrado"));
      }
      return res.json(new ApiResponse(product, TypesResponse.SUCCESS, "Producto encontrado"));

    } catch (error: any) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, error.message));
    }
  }


  static async updateProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const product = await ProductService.updateProduct(id, req.body);

      if (!product) {
        return res.status(404).json(new ApiResponse(TypesResponse.WARNING, "Producto no encontrado"));
      }
      return res.json(new ApiResponse(product, TypesResponse.SUCCESS, "Producto actualizado con éxito"));

    } catch (error: any) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, error.message));
    }
  }


  static async deleteProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const product = await ProductService.deleteProduct(id);

      if (!product) {
        return res.status(404).json(new ApiResponse(TypesResponse.WARNING, "Producto no encontrado"));
      }
      return res.json(new ApiResponse(product, TypesResponse.SUCCESS, "Producto eliminado con éxito"));

    } catch (error: any) {
      return res.status(500).json(new ApiResponse(TypesResponse.ERROR, error.message));
    }
  }
}