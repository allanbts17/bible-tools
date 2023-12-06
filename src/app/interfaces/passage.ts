export interface Passage {
    data: PassageData;
    meta: Meta|{fumsToken: string};
}

interface PassageData {
    id: string;
    orgId: string;
    bookId: string;
    chapterIds: string[];
    reference: string;
    content: string;
    verseCount: number;
    copyright: string;
}

interface Meta {
    fums: string;
    fumsId: string;
    fumsJsInclude: string;
    fumsJs: string;
    fumsNoScript: string;
  }
