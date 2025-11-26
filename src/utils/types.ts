export interface Item {
  id: string;
  name: string;
  price?: string;
  link?: string;
  bought?: boolean;
}

export interface Kid {
  parentEmail?: string;
  uid: string;
  name: string;
  items?: Item[];
}

export interface Person {
  uid: string;
  email: string;
  name: string;
}

export interface PersonInfo {
  name: string;
  email: string;
  uid: string;
}

export interface UserInfo {
  name: string;
  email: string;
  spouseUid?: string;
  kids?: Kid[];
  currSecretSanta?: PersonInfo[];
  inSecretSanta?: boolean;
}