export type Language = 
  | 'en' | 'hi' | 'kn' | 'ml' | 'ta' | 'te' | 'mr' | 'gu' 
  | 'pa' | 'bn' | 'ur' | 'or' | 'as' | 'kok' | 'ks' | 'sa' 
  | 'sd' | 'ne' | 'mni' | 'brx' | 'doi' | 'mai' | 'sat' 
  | 'tulu' | 'bho' | 'raj' | 'chg' | 'gar' | 'kum' | 'mizo';

export interface Product {
  id: string;
  category: string;
  title: Record<string, string>;
  description: Record<string, string>;
  image: string;
  price: number;
  costPrice: number;
  blueprints?: string[];
  blueprintImage?: string;
  measurements: string;
  materials: string[];
  tools: string[];
  steps: string[];
  timeRequired?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  file?: {
    name: string;
    mimeType: string;
    data: string; // base64
  };
}

export interface MaterialEntry {
  id: string;
  name: string;
  count: number;
  cost: number;
  date: string;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  language: Language;
}
