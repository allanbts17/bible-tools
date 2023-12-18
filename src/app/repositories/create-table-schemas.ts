export const categories: string = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  color TEXT NOT NULL
);
`;

export const notes: string = `
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category INTEGER NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  text TEXT NOT NULL
);
`;

export const topics: string = `
CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);
`;

// Bible and passage will json strinfied json
export const verses: string = `
CREATE TABLE IF NOT EXISTS verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic INTEGER NOT NULL,
  bible TEXT NOT NULL,
  passage TEXT NOT NULL,
  text TEXT NOT NULL,
  date TEXT NOT NULL
);
`;

export const marked: string = `
CREATE TABLE IF NOT EXISTS marked (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  color TEXT NOT NULL,
  verse TEXT NOT NULL
);
`;

export const bibles: string = `
CREATE TABLE IF NOT EXISTS bibles (
  id TEXT NOT NULL,
  dblId TEXT,
  abbreviation TEXT,
  abbreviationLocal TEXT,
  language TEXT,
  countries TEXT,
  name TEXT,
  nameLocal TEXT,
  description TEXT,
  descriptionLocal TEXT,
  type TEXT,
  updatedAt TEXT,
  relatedDbl TEXT,
  audioBibles TEXT,
  bookList TEXT
);
`;

export const books: string = `
CREATE TABLE IF NOT EXISTS books (
  id TEXT NOT NULL,
  abbreviation TEXT,
  bibleId TEXT,
  chapterList TEXT,
  name TEXT,
  nameLong TEXT
);
`;

export const chapters: string = `
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT NOT NULL,
  bibleId TEXT,
  number TEXT,
  bookId TEXT,
  reference TEXT,
  copyright TEXT,
  verseCount INTEGER,
  content TEXT,
  next TEXT,
  previous TEXT,
  meta TEXT
);
`;

export const CreateTables = [categories, notes, topics, verses, marked, /*bibles, books, chapters*/]
