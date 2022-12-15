
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Topic } from '../interfaces/topic';
@Injectable({
    providedIn: 'root'
})
export class TopicRepository {
    constructor(private _databaseService: DatabaseService) {
    }
    async getTopics(): Promise<Topic[]> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            var topics: DBSQLiteValues = await db.query("select * from topics");
            return topics.values as Topic[];
        });
    }

    async createTopic(topic: Topic) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "insert into topics (name) values (?)";
            let values: Array<any> = [topic.name];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.lastId > 0) {
                return {...topic, id:ret.changes.lastId} as Topic;
            }
            throw Error('create topic failed');
        });
    }

    async updateTopic(topic: Topic) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "update topics set name = ? where id = ?";
            let values: Array<any> = [topic.name, topic.id];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.changes > 0) {
                return topic//await this.getTopicById(topic.id);
            }
            throw Error('update topic failed');
        });
    }

    async getTopicById(id: number): Promise<Topic> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "select * from topics where id = ? limit 1";
            let values: Array<any> = [id];
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                return ret.values[0] as Topic;
            }
            throw Error('get topic by id failed');
        });
    }

    async deleteTopicById(id: number): Promise<void> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            await db.query(`delete from topics where id = ${id};`);
        });
    }

}

