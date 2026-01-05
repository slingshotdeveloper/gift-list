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

export interface List {
  uid: string;
  name: string;
  currSecretSanta?: PersonInfo[];
}

export interface UserInfo {
  uid: string;
  name: string;
  email: string;
  spouseUid?: string;
  kids?: Kid[];
  currSecretSanta?: PersonInfo[];
  isAdmin?: boolean;
}

export interface UserGroup {
  id: string;
  name: string;
}