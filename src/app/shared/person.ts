export interface Person {
  _id: string;
  isActive: boolean;
  balance?: number;
  picture: string;
  age: number;
  name?: {
    first: string;
    last?: string;
  };
  company?: string;
  email?: string;
  address: string;
  tags: string[];
  favoriteFruit: string;
}
