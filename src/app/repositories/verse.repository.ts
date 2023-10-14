
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { environment } from 'src/environments/environment';
import { Bible, Passage, Verse } from '../interfaces/verse';

@Injectable({
    providedIn: 'root'
})

export class VerseRepository {
    private pagSize
    constructor(private _databaseService: DatabaseService) {
        this.pagSize = environment.pageSize
        //this.deleteAll()
        //this.fillIfEmpty()
    }

    async fillIfEmpty(data: any) {
        let verses = await this.getVerses()
        console.log('verseRep', verses);
        //console.log();
        // for(let Verse of data){
        //    // console.log('VerseRep',Verse);
        //    await this.createVerse(Verse)
        // }
        //
    }

    verseConversion(verse,returnArr = true): Verse | Verse[]{
        const convert = (vrs) => {
            vrs.bible = <Bible>JSON.parse(vrs.bible)
            vrs.passage = <Passage>JSON.parse(vrs.passage)
            return vrs as Verse
        }
        if(verse === undefined && returnArr) return [];
        if(verse === undefined && !returnArr) return null;
        if(verse?.length != undefined){
            verse = verse.map(vrs => convert(vrs))
            return verse;
        } else {
            return convert(verse);
        }
    }

    async getVerses(): Promise<Verse[]> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            var verses: DBSQLiteValues = await db.query("select * from verses");
            return this.verseConversion(verses.values) as Verse[];
        });
    }

    async getPaginatedVerses(lastId?: number): Promise<Verse[]> {
        console.log('lastId',lastId);
        
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string;
            if (lastId) {
                sqlcmd = `
                select * from verses
                where id < ${lastId}
                ORDER BY id DESC
                LIMIT ${this.pagSize}`;
            } else {
                sqlcmd = `
                select * from verses
                ORDER BY id DESC
                LIMIT ${this.pagSize}`;
            }
            console.log('data',lastId,sqlcmd);
            
            var verses: DBSQLiteValues = await db.query(sqlcmd);
            return this.verseConversion(verses.values) as Verse[];
        });
    }


    async createVerse(verse: Verse) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "insert into verses (topic, bible, passage, text, date) values (?, ?, ?, ?, ?)";
            let values: Array<any> = [verse.topic, JSON.stringify(verse.bible), JSON.stringify(verse.passage), verse.text, verse.date];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.lastId > 0) {
                return {...verse, id:ret.changes.lastId} as Verse;
            }
            throw Error('create verse failed');
        });
    }

    async updateVerse(verse: Verse) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = `
            update verses
            set topic = ?, bible = ?, passage = ?, text = ?, date = ?
            where id = ?
            `;
            let values: Array<any> = [verse.topic, JSON.stringify(verse.bible), JSON.stringify(verse.passage), verse.text, verse.date, verse.id];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.changes > 0) {
                return verse//await this.getVerseById(Verse.id);
            }
            throw Error('update verse failed');
        });
    }

    async getVerseById(id: number): Promise<Verse> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "select * from verses where id = ? limit 1";
            let values: Array<any> = [id];
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                return this.verseConversion(ret.values[0],false) as Verse;
            }
            throw Error('get verse by id failed');
        });
    }

    async deleteVerseById(id: number): Promise<void> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            await db.query(`delete from verses where id = ${id};`);
        });
    }

    async getVersesByTopic(topic: string, lastId?: number): Promise<Verse[]> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string;
            if (lastId) {
                sqlcmd = `
                select * from verses
                where topic = ? AND id < ${lastId}
                ORDER BY id DESC
                LIMIT ${this.pagSize}`;
            } else {
                sqlcmd = `
                select * from verses
                where topic = ?
                ORDER BY id DESC
                LIMIT ${this.pagSize}`;
            }
            let values: Array<any> = [topic];
            let ret: any = await db.query(sqlcmd, values);
            //console.log('ret', ret);
            return this.verseConversion(ret.values) as Verse[];
            // if (ret.values.length > 0) {
            //     return ret.values as Verse[];
            // } else {
            //     return ret.values as Verse[];
            // }
            //throw Error('get Verses by category failed');
        });
    }

    setPageSize(size: number) {
        this.pagSize = size;
    }

    async deleteAll() {
        await this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            //delete all verses
            let sqlcmd: string = "DELETE FROM verses;";
            await db.execute(sqlcmd, false);
        });
    }

}

