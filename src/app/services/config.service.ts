import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  lang = "es"
  settings

  text_data = {
    en:{
      menu:{
        header:"Bible Tools",
        note:"Choose a section",
        items:["Bible","Daily devoctional","Verse index"],
        theme:["Light theme","Dark theme"]
      },
      daly_devotional:{
        tab:"All",
        add_menu:{}
      }
    },
    es:{
      menu:{
        header:"Herramientas bíblicas",
        note:"Escoje una sección",
        items:["Biblia","Diario devocional","Índice de versículos"],
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
