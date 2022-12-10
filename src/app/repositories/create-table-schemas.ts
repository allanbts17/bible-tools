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

export const CreateTables = [categories, notes, topics, verses, marked]

// export const bible: string = `
// CREATE TABLE IF NOT EXISTS bible (
//   id TEXT NOT NULL,
//   name TEXT NOT NULL
// );
// `;
