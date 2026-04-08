export interface Client {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  allergies?: string;
  preferences?: string;
  clinical_data?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateClientDTO {
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  allergies?: string;
  preferences?: string;
  clinical_data?: string;
}