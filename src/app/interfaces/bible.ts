import { Language } from "./language";

export interface Bible {
  id:	string;
  dblId:	string
  abbreviation:	string;
  abbreviationLocal:	string;
  copyright:	string;
  language:	Language;
  countries:	[];
  name:	string;
  nameLocal:	string;
  description:	string;
  descriptionLocal:	string;
  info:	string;
  type:	string;
  updatedAt:	string;
  relatedDbl:	string;
  audioBibles:	[];
}
