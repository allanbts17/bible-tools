import { Language } from "./language";

export interface BibleSummary {
  id:	string;
  dblId:	string;
  abbreviation:	string;
  abbreviationLocal:	string;
  language: Language;
  countries: [];
  name:	string;
  nameLocal:	string;
  description:	string;
  descriptionLocal:	string;
  relatedDbl:	string;
  type:	string;
  updatedAt:	string;
  audioBibles: []
}
