import { Language } from "./language";
import { StoredBook } from "./stored-book";

export interface Bible {
  id:	string;
  dblId:	string
  abbreviation:	string;
  abbreviationLocal:	string;
  copyright:	string;
  language:	Language;
  countries:	any[];
  name:	string;
  nameLocal:	string;
  description:	string;
  descriptionLocal:	string;
  type:	string;
  updatedAt:	string;
  relatedDbl:	string;
  audioBibles:any[];
  bookList: StoredBook[];
  order: number;
}
