export interface StoredBook {
    abbreviation: string;
    chapterList: ChapterFromBook[];
    id: string;
    name: string;
    nameLong: string;
}

export interface ChapterFromBook {
    bibleId: string;
    bookId: string;
    id: string;
    number: string;
    reference: string;
}
