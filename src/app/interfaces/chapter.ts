export interface Chapter {
  data: ChapterData;
  meta: ChapterMeta;
}

interface ChapterMeta {
  fums: string;
  fumsId: string;
  fumsJsInclude: string;
  fumsJs: string;
  fumsNoScript: string;
}

export interface ChapterData {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  reference: string;
  copyright: string;
  verseCount: number;
  content: string;
  next: Next;
  previous: Next;
}

interface Next {
  id: string;
  number: string;
  bookId: string;
}
