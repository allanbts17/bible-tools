import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  lang: "es"|"en" = "es"

  text_data = {
    en:{
      menu:{
        header:"Bible Tools",
        note:"Choose a section",
        items:["Bible","Daily devoctional","Verse index"]
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
        items:["Biblia","Diario devocional","Índice de versículos"]
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
