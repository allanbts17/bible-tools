import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DatabaseService } from './database.service';
import { SQLiteService } from './sqlite.service';
import { CreateTables } from '../repositories/create-table-schemas';

export const createSchemaProducts: string = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMBER NOT NULL,
  imageUrl TEXT DEFAULT '',
  isAvailable BOOLEAN NOT NULL CHECK (isAvailable IN (0, 1)),
  isPopular BOOLEAN NOT NULL CHECK (isAvailable IN (0, 1)),
  category TEXT DEFAULT '',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

export const createSchemaTest: string = `
CREATE TABLE IF NOT EXISTS test (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);
`;

@Injectable({
  providedIn: 'root'
})
export class MigrationService {

  constructor(private sqliteService: SQLiteService, private databaseService: DatabaseService) {
  }

  async migrate(): Promise<any> {
    // await this.databaseService.executeQuery(async (db) => {
    //   await db.execute(`
    //   ALTER TABLE notes
    //   ADD date TEXT NOT NULL;
    //   `);
    // });
    //await this.createTestTable();
    //await this.createProductsTable();
    await this.createTables()
  }

  async createTables() {
    for (let table of CreateTables) {
      // await this.deleteTable('bibles')
      // await this.deleteTable('books')
      // await this.deleteTable('chapters')
      await this.databaseService.executeQuery(async (db) => {
      //  console.log(table);
        await db.execute(table);
      });
    }
  }

  async createProductsTable(): Promise<any> {
    await this.databaseService.executeQuery(async (db) => {
      await db.execute(createSchemaProducts);
    });
  }

  async deleteTable(table: string): Promise<any> {
    await this.databaseService.executeQuery(async (db) => {
      await db.execute(`DROP TABLE ${table}`);
    });
  } 

  async createTestTable(): Promise<void> {
    console.log(`going to create a connection`)
    const db = await this.sqliteService.createConnection(environment.databaseName, false, "no-encryption", 1);
    console.log(`db ${JSON.stringify(db)}`)
    await db.open();
    console.log(`after db.open`)
    let query = `
            CREATE TABLE IF NOT EXISTS test (
              id INTEGER PRIMARY KEY NOT NULL,
              name TEXT NOT NULL
            );
            `
    //console.log(`query ${query}`)

    const res: any = await db.execute(query);
    console.log(`res: ${JSON.stringify(res)}`)
    await this.sqliteService.closeConnection(environment.databaseName);
    console.log(`after closeConnection`)
  }
}
