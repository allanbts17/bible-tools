import { Injectable } from '@angular/core';
import { Settings } from '../interfaces/settings';
import { RemoteConfig } from '../interfaces/remote-config';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  versionApp = 1
  lang = "es"
  settings: Settings
  default_settings: Settings = {
    darkMode: false,
    lang: 'es',
    options: {
      allowButtonSliding: false,
      fontSize: 1
    }
  }
  remoteConfig: RemoteConfig = {
    requestToFirebase: true
  }
  availableBibleLanguages = [{id:"spa",name:"Español"},{id:"eng",name:"English"}]

  text_data = {
    en:{
      menu:{
        header:"Bible Tools",
        note:"Choose a section",
        items:["Bible","Daily devotional","My verses","Offline versions"],
        theme:["Light theme","Dark theme"]
      },
      daly_devotional:{
        tab:"All",
        add_menu:{}
      }
    },
    es:{
      menu:{
        header:"Bible Tools",
        note:"Escoje una sección",
        items:["Biblia","Diario devocional","Mis versículos","Sin Conexión"],
        theme:["Modo claro","Modo oscuro"]
      },
      daly_devotional:{
        tab:"Todo"
      }
    }
  }

  readonly TOOLBAR_COLOR = "btprimary"
  readonly TOOLBAR_BUTTONS_COLOR = "btsecondary"
  readonly UNIQUEBAR_COLOR = "bttertiary"

  fontSizeChange$: Subject<number> = new Subject<number>
  constructor() { 
  }

  setLang(lang){
    this.lang = lang
  }

  getData(){
    return this.text_data[this.lang]
  }

  changeFontSize(size: number){
    const maxInput = 7
    const minInput = 1
    const maxOutput = 2
    const minOutput = 1
    let res = minOutput + (maxOutput - minOutput)/(maxInput - minInput) * (size - minInput)
    this.fontSizeChange$.next(res)
  }

  interpolateFontSize(size: number){
    const maxInput = 7
    const minInput = 1
    const maxOutput = 2
    const minOutput = 1
    return minOutput + (maxOutput - minOutput)/(maxInput - minInput) * (size - minInput)
  }
}
