
import { SQLiteService } from './sqlite.service';

import { Injectable } from '@angular/core';
import { MigrationService } from './migrations.service';
import { StorageService } from './storage.service';
import { SharedInfoService } from './shared-info.service';
import { NetworkService } from './network.service';
import _ from 'underscore'

@Injectable()
export class InitializeAppService {

  constructor(
    private sqliteService: SQLiteService,
    private migrationService: MigrationService,
    private storageService: StorageService,
    private shareInfo: SharedInfoService,
    private network: NetworkService) { }

  async initializeApp() {
    await this.sqliteService.initializePlugin().then(async (ret) => {
      try {
        //execute startup queries
        await this.migrationService.migrate();
        await this.storageService.init();
        let status = await this.network.getStatus()
        if (status.connected) {
          await this.shareInfo.init()
        } else {
          let obs$ = this.network.status$.subscribe(async status => {
            if (status.connected){
              await this.shareInfo.init()
              obs$.unsubscribe()
            }
          })

        }

      } catch (error) {
        throw Error(`initializeAppError: ${error}`);
      }

    });
  }

}
