export interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

export interface Kid {
  uid: string;
  name: string;
  items?: Item[];
}

export interface PersonInfo {
  uid: string;
  name: string;
  email?: string;
}

export interface UserInfo {
  name: string;
  email: string;
  spouseUid?: string;
  kids?: Kid[];
  currSecretSanta?: PersonInfo[];
  inSecretSanta?: boolean;
}