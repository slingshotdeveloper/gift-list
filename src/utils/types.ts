export interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

export interface Kid {
  parentEmail: string;
  name: string;
  items: Item[];
}

export interface Person {
  email: string;
  name: string;
}