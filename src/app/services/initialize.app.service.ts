
import { SQLiteService } from './sqlite.service';

import { Injectable } from '@angular/core';
import { MigrationService } from './migrations.service';
import { StorageService } from './storage.service';


@Injectable()
export class InitializeAppService {

  constructor(
    private sqliteService: SQLiteService,
    private migrationService: MigrationService,
    private storageService: StorageService) { }

  async initializeApp() {
    await this.sqliteService.initializePlugin().then(async (ret) => {
      try {
        //execute startup queries
        await this.migrationService.migrate();
        await this.storageService.init()
      } catch (error) {
        throw Error(`initializeAppError: ${error}`);
      }

    });
  }

}
