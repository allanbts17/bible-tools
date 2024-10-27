import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { environment } from 'src/environments/environment';
import { SQLiteService } from './sqlite.service';

interface SQLiteDBConnectionCallback<T> { (myArguments: SQLiteDBConnection): T }

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private sqlite: SQLiteService) {
  }

  /**
   * this function will handle the sqlite isopen and isclosed automatically for you.
   * @param callback: The callback function that will execute multiple SQLiteDBConnection commands or other stuff.
   * @param databaseName optional another database name
   * @returns any type you want to receive from the callback function.
   */
  async executeQuery<T>(callback: SQLiteDBConnectionCallback<T>, retainConnection = false, databaseName: string = environment.databaseName): Promise<T> {
    try {
      let isConnection = await this.sqlite.isConnection(databaseName);
      //console.log('isConnection', isConnection)
      if (isConnection.result) {

        let db = await this.sqlite.retrieveConnection(databaseName);
        return await callback(db);
      }
      else {
        const db = await this.sqlite.createConnection(databaseName, false, "no-encryption", 1);
        await db.open();
        let cb = await callback(db);
        if(!retainConnection)
          await this.sqlite.closeConnection(databaseName);
        return cb;
      }
    } catch (error) {
      throw Error(`DatabaseServiceError: ${error}`);
    }
  }

  async createConnection(databaseName: string = environment.databaseName): Promise<SQLiteDBConnection>{
    const db = await this.sqlite.createConnection(databaseName, false, "no-encryption", 1);
    await db.open();
    return db;
  }

  async closeConnection(databaseName: string = environment.databaseName): Promise<void>{
    return await this.sqlite.closeConnection(databaseName);
  }

  async exportToJson(databaseName: string = environment.databaseName){
    await this.createConnection()
    let data = await this.sqlite.exportToJson(databaseName)
    await this.closeConnection()
    return data
  }
  async importFromJson(jsonString: string,databaseName: string = environment.databaseName){
    await this.createConnection()
    let data = await this.sqlite.importFromJson(jsonString)
    await this.closeConnection()
    return data
  }

  async deleteDatabase(){
    await this.createConnection()
    await this.sqlite.deleteDatabase()
    await this.closeConnection()
  }

  async getDB(){
      await this.createConnection()
    let data = await this.sqlite.getDatabaseList()
    console.log('db list',data)
    await this.closeConnection()
  }

  
}

