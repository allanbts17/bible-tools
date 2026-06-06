import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { environment } from 'src/environments/environment';
import { SQLiteService } from './sqlite.service';

interface SQLiteDBConnectionCallback<T> { (myArguments: SQLiteDBConnection): T }

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  retainConnection = false

  constructor(private sqlite: SQLiteService) {
  }

  /**
   * this function will handle the sqlite isopen and isclosed automatically for you.
   * @param callback: The callback function that will execute multiple SQLiteDBConnection commands or other stuff.
   * @param databaseName optional another database name
   * @returns any type you want to receive from the callback function.
   */
  async executeQuery<T>(callback: SQLiteDBConnectionCallback<T>, _retainConnection = false, databaseName: string = environment.databaseName): Promise<T> {
    try {
      let isConnection = await this.sqlite.isConnection(databaseName);
      console.log("error",'isConnection', isConnection)
      let db: SQLiteDBConnection;

      if (isConnection.result) {
        try {
          db = await this.sqlite.retrieveConnection(databaseName);
        } catch (err){
          db = await this.createConnection(databaseName)
        }
      } else {
        try {
          console.log("error",'try to create', isConnection)
          db = await this.createConnection(databaseName)
        } catch (err) {
          console.log("error",'try to retrieve', err)
          db = await this.sqlite.retrieveConnection(databaseName);
        }
      }
      console.log("error",'about to callback')

      let cb = await callback(db);
      console.log("error",'after callback',cb)
      if ((!_retainConnection) || (!this.retainConnection)){
        console.log("error",'about to close connection',this.retainConnection,_retainConnection)
        try {
          await this.sqlite.closeConnection(databaseName);
        } catch (err) {
          console.log("catched",err)
        }
      }
      console.log("error",'after to close or not connection',this.retainConnection,_retainConnection)

      return cb;

    } catch (error) {
      throw Error(`DatabaseServiceError: ${error}`);
    }
  }

  // try {
  //   const db = await this.sqlite.createConnection(databaseName, false, "no-encryption", 1);
  //   await db.open();
  //   let cb = await callback(db);
  //   if (!retainConnection)
  //     await this.sqlite.closeConnection(databaseName);
  //   return cb;
  // } catch (err) {
  //   let db = await this.sqlite.retrieveConnection(databaseName);
  //   return await callback(db);
  // }

  async createConnection(databaseName: string = environment.databaseName): Promise<SQLiteDBConnection> {
    const db = await this.sqlite.createConnection(databaseName, false, "no-encryption", 1);
    await db.open();
    return db;
  }

  async closeConnection(databaseName: string = environment.databaseName): Promise<void> {
    return await this.sqlite.closeConnection(databaseName);
  }

  async exportToJson(databaseName: string = environment.databaseName) {
    await this.createConnection()
    let data = await this.sqlite.exportToJson(databaseName)
    await this.closeConnection()
    return data
  }
  async importFromJson(jsonString: string, databaseName: string = environment.databaseName) {
    await this.createConnection()
    let data = await this.sqlite.importFromJson(jsonString)
    await this.closeConnection()
    return data
  }

  async deleteDatabase() {
    await this.createConnection()
    await this.sqlite.deleteDatabase()
    await this.closeConnection()
  }

  async getDB() {
    await this.createConnection()
    let data = await this.sqlite.getDatabaseList()
    console.log('db list', data)
    await this.closeConnection()
  }


}

