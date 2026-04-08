export interface Product {
  id: number;
  name: string;
  unit: string;
  cost: number;
  price: number;
  quantity: number;
  minimum_stock: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateProductDTO {
  name: string;
  unit: string;
  cost: number;
  price: number;
  quantity?: number;
  minimum_stock?: number;
  is_active?: boolean;
}