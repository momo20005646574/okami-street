export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  stock: number;
  category: 'tops' | 'bottoms' | 'outerwear' | 'accessories';
  description?: string;
  dropId?: string;
  isNew?: boolean;
  hasFireEffect?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  wilaya: string;
  deliveryType: 'home' | 'desk';
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export interface Drop {
  id: string;
  name: string;
  releaseDate: Date;
  lookbookImages: string[];
  backgroundImage?: string;
  isActive: boolean;
  productIds: string[];
  globalFireEffect?: boolean;
}

export const WILAYAS = [
  'adrar', 'chlef', 'laghouat', 'oum el bouaghi', 'batna', 'béjaïa', 'biskra',
  'béchar', 'blida', 'bouira', 'tamanrasset', 'tébessa', 'tlemcen', 'tiaret',
  'tizi ouzou', 'alger', 'djelfa', 'jijel', 'sétif', 'saïda', 'skikda',
  'sidi bel abbès', 'annaba', 'guelma', 'constantine', 'médéa', 'mostaganem',
  'm\'sila', 'mascara', 'ouargla', 'oran', 'el bayadh', 'illizi', 'bordj bou arréridj',
  'boumerdès', 'el tarf', 'tindouf', 'tissemsilt', 'el oued', 'khenchela',
  'souk ahras', 'tipaza', 'mila', 'aïn defla', 'naâma', 'aïn témouchent',
  'ghardaïa', 'relizane', 'timimoun', 'bordj badji mokhtar', 'ouled djellal',
  'béni abbès', 'in salah', 'in guezzam', 'touggourt', 'djanet', 'el m\'ghair', 'el meniaa'
];
