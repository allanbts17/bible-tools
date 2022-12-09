
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Category } from '../interfaces/category';
@Injectable({
    providedIn: 'root'
})
export class CategoryRepository {
    constructor(private _databaseService: DatabaseService) {
    }
    async getCategories(): Promise<Category[]> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            var categories: DBSQLiteValues = await db.query("select * from categories");
            return categories.values as Category[];
        });
    }

    async createCategory(category: Category) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "insert into categories (category, color) values (?, ?)";
            let values: Array<any> = [category.category, category.color];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.lastId > 0) {
                return ret.changes as Category;
            }
            throw Error('create category failed');
        });
    }

    async updateCategory(category: Category) {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "update categories set category = ?, color = ?, where id = ?";
            let values: Array<any> = [category.category, category.color, category.id];
            let ret: any = await db.run(sqlcmd, values);
            if (ret.changes.changes > 0) {
                return await this.getCategoryById(category.id);
            }
            throw Error('update category failed');
        });
    }

    async getCategoryById(id: number): Promise<Category> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            let sqlcmd: string = "select * from categories where id = ? limit 1";
            let values: Array<any> = [id];
            let ret: any = await db.query(sqlcmd, values);
            if (ret.values.length > 0) {
                return ret.values[0] as Category;
            }
            throw Error('get category by id failed');
        });
    }

    async deleteCategoryById(id: number): Promise<void> {
        return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
            await db.query(`delete from categories where id = ${id};`);
        });
    }

}

