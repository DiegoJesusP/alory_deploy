export interface ServiceEntity {
  id: number;
  name: string;
  price: number;
  duration: number;
  description?: string | null;
  image?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface ServiceFormInput {
  name: string;
  price: number;
  duration: number;
  description?: string;
  image?: string;
  is_active?: boolean;
}

export interface ServiceCardItem {
  id: number | string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
}
