
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Bible } from '../interfaces/bible';
import { Chapter } from '../interfaces/chapter';
import { lopy } from '../classes/utils';
@Injectable({
    providedIn: 'root'
})
export class BibleDataRepository {
    constructor(private _databaseService: DatabaseService) {
    }
    async getBibles(): Promise<Bible[]> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            var bibles: DBSQLiteValues = await db.query("select * from bibles");
            bibles.values.forEach(b => this.convertJSON(b,['language','countries','audioBibles','bookList']))
            return bibles.values as Bible[];
        });
    }

    async createBible(bible: Bible) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let init = "insert into bibles"
            let vars = "(id, dblId, abbreviation, abbreviationLocal, language, countries, name, nameLocal, description, descriptionLocal, type, updatedAt, relatedDbl, audioBibles, bookList)"
            let vals = "values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            let sqlcmd = `${init} ${vars} ${vals}`
            console.log(sqlcmd);
            console.log(bible.copyright,bible);
            
            let values: Array<any> = [
                bible.id, bible.dblId, bible.abbreviation, bible.abbreviationLocal,
                JSON.stringify(bible.language), JSON.stringify(bible.countries), bible.name, bible.nameLocal, bible.description,
                bible.descriptionLocal, bible.type, bible.updatedAt, bible.relatedDbl, JSON.stringify(bible.audioBibles),
                JSON.stringify(bible.bookList)
            ];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.lastId > 0) {
                return true;
            }
            throw Error('create bible failed');
        });
    }

    private convertJSON(data: any,params: string[]) {
        params.forEach(param => {
            data[param] = JSON.parse(data[param])
        })
    }

    async getBibleById(id: string): Promise<Bible> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "select * from bibles where id = ? limit 1";
            let values: Array<any> = [id];
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                this.convertJSON(ret.values[0],['language','countries','audioBibles','bookList'])
                return ret.values[0] as Bible;
            }
            throw Error('get bible by id failed');
        });
    }

    async deleteBibleById(id: string): Promise<void> {
        console.log("deleting bible",id)
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            await db.query(`DELETE FROM bibles WHERE id = ?;`, [id]);
        });
    }
    ////////////////////////////////////////////////////////
    async getBooks(): Promise<any[]> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            var bibles: DBSQLiteValues = await db.query("select * from books");
            bibles.values.forEach(b => this.convertJSON(b,['chapterList']))
            return bibles.values;
        });
    }

    async getBooksByBibleId(bibleId: string): Promise<any> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "select * from books where bibleId = ?";
            let values: Array<any> = [bibleId];
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                ret.values.forEach(b => this.convertJSON(b,['chapterList']))
                return ret.values;
            }
            throw Error('get book by id failed');
        });
    }

    async createBooks(book: any) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let init = "insert into books"
            let vars = "(id, abbreviation, bibleId, chapterList, name, nameLong)"
            let vals = "values (?,?,?,?,?,?)";
            let sqlcmd = `${init} ${vars} ${vals}`
            let values: Array<any> = [
                book.id, book.abbreviation, book.bibleId, JSON.stringify(book.chapterList), book.name, book.nameLong
            ];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.lastId > 0) {
                return true;
            }
            throw Error('create book failed');
        });
    }

    async getBookById(bibleId: string, id: string): Promise<any> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "select * from books where id = ? limit 1";
            let values: Array<any> = [id];
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                this.convertJSON(ret.values[0],['chapterList'])
                return ret.values[0] as Bible;
            }
            throw Error('get book by id failed');
        });
    }

    async deleteBookById(bibleId: string, id: string): Promise<void> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            await db.query(`delete from books where id = ${id};`);
        });
    }

    async deleteBooksByBibleId(id: string): Promise<void> {   
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            await db.query(`DELETE FROM books WHERE bibleId = ?;`, [id]);
        });
    }
    ////////////////////////////////////////////////////////
    async getChapters(): Promise<any[]> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            var bibles: DBSQLiteValues = await db.query("select * from chapters");
            bibles.values.forEach(b => this.convertJSON(b,['meta','next','previous']))
            return bibles.values as Bible[];
        });
    }

    async getChaptersByBibleIdAndBook(bibleId: string, bookId: string): Promise<any> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "select * from chapters where bibleId = ? and bookId = ?";
            let values: Array<any> = [bibleId,bookId];
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                ret.values.forEach(b => this.convertJSON(b,['meta','next','previous']))
                return ret.values as Bible[];
            }
            throw Error('get book by id failed');
        });
    }


    async createChapters(chapter: Chapter) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let init = "insert into chapters"
            let vars = "(id, bibleId, number, bookId, reference, copyright, verseCount, content, next, previous, meta)"
            let vals = "values (?,?,?,?,?,?,?,?,?,?,?)";
            let sqlcmd = `${init} ${vars} ${vals}`
            let values: Array<any> = [
                chapter.data.id, chapter.data.bibleId, chapter.data.number, chapter.data.bookId, chapter.data.reference,
                chapter.data.copyright, chapter.data.verseCount, chapter.data.content, JSON.stringify(chapter.data.next), JSON.stringify(chapter.data.previous),
                JSON.stringify(chapter.meta)
            ];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.lastId > 0) {
                return true;
            }
            throw Error('create chapter failed');
        });
    }

    async getChapterById(bibleId: string, id: string, retainConnection = false): Promise<any> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "SELECT * FROM chapters WHERE id = ? AND bibleId = ? LIMIT 1";
            let values: Array<any> = [id, bibleId]; 
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                this.convertJSON(ret.values[0],['meta','next','previous'])
                return ret.values[0] as Bible;
            }
            throw Error('get book by id failed');
        },retainConnection);
    }

    async deleteChapterById(bibleId: string, id: string): Promise<void> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            await db.query(`delete from chapters where id = ${id};`);
        });
    }

    async deleteChapterByBibleId(id: string): Promise<void> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            await db.query(`DELETE FROM chapters WHERE bibleId = ?;`,[id]);
            
        });
    }
}

