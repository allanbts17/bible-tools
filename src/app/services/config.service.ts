import { Injectable } from '@angular/core';
import { Settings } from '../interfaces/settings';

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
      allowButtonSliding: false
    }
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
  constructor() { }

  setLang(lang){
    this.lang = lang
  }

  getData(){
    return this.text_data[this.lang]
  }
}
