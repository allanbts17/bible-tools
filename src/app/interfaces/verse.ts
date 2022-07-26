export interface Verse {
  id?: number;
  topic: number;
  bible: Bible;
  passage: Passage;
  text: string;
  date: string
}

export interface Bible {
  id: number;
  reference: string;
}

export interface Passage {
  id: Array<string>;
  reference: string;
}
