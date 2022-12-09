
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Note } from '../interfaces/note';

const pagSize = 10

@Injectable({
    providedIn: 'root'
})

export class NoteRepository {
    constructor(private _databaseService: DatabaseService) {
    }
    async getNotes(): Promise<Note[]> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            var notes: DBSQLiteValues = await db.query("select * from notes");
            return notes.values as Note[];
        });
    }

    async createNote(note: Note) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "insert into notes (category, date, title, text) values (?, ?, ?, ?)";
            let values: Array<any> = [note.category, note.date, note.title, note.text];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.lastId > 0) {
                return ret.changes as Note;
            }
            throw Error('create note failed');
        });
    }

    async updateNote(note: Note) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "update notes set category = ?, date = ?, title = ?, text = ?, where id = ?";
            let values: Array<any> = [note.category, note.date, note.title, note.text, note.id];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.changes > 0) {
                return await this.getNoteById(note.id);
            }
            throw Error('update note failed');
        });
    }

    async getNoteById(id: number): Promise<Note> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "select * from notes where id = ? limit 1";
            let values: Array<any> = [id];
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                return ret.values[0] as Note;
            }
            throw Error('get note by id failed');
        });
    }

    async deleteNoteById(id: number): Promise<void> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            await db.query(`delete from notes where id = ${id};`);
        });
    }

    async getNotesByCategory(category: string, lastId = 0): Promise<Note[]> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = `
            select * from notes
            where category = ? AND id > ${lastId}
            ORDER BY id ASC
            LIMIT ${pagSize}`;
            let values: Array<any> = [category];
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                return ret.values as Note[];
            }
            throw Error('get notes by category failed');
        });
    }

}

