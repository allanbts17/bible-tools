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
    requestToFirebase: false
  }
  availableBibleLanguages = [{id:"spa",name:"Español"},{id:"eng",name:"English"}]

  text_data = {
    en:{
      menu:{
        header:"Bible Tools",
        note:"Choose a section",
        items:["Bible","Daily devoctional","My verses"],
        theme:["Light theme","Dark theme"]
      },
      daly_devotional:{
        tab:"All",
        add_menu:{}
      }
    },
    es:{
      menu:{
        header:"Herramientas Bíblicas",
        note:"Escoje una sección",
        items:["Biblia","Diario devocional","Mis versículos"],
        theme:["Modo claro","Modo oscuro"]
      },
      daly_devotional:{
        tab:"Todo"
      }
    }
  }

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
