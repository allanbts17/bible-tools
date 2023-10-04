import cloneDeep from 'lodash.clonedeep'
import * as moment from 'moment'

export const copy = (source: any) => {
  return cloneDeep(source)
}

export const formatDate = (_date: string | Date, format = 'll', locale = 'en') => {
  let date = _date//new Date(_date)
  var localMoment = moment(date)
  console.log('mom', localMoment);

  localMoment.locale(locale);
  return localMoment.format(format)
}

/**
 * Elimina elementos del array mediante una lista de índices
 * @param array 
 * @param indices 
 */
export const removeByIndexList = (array: Array<any>, indices: Array<number>) => {
  indices.sort((a, b) => b - a);
  for (const indice of indices) {
    if (indice >= 0 && indice < array.length) {
      array.splice(indice, 1);
    }
  }
}

export enum Colors {
  statusBarDarkMode = '#1F1F1F',
  statusBarLightMode = '#FFFFFF',
  statusBarModalDarkMode = '#0d0d0d',
  statusBarModalLightMode = '#222428',
}

export class Utils {
  private stack: Array<any> = []
  private runFor = true

  addToStack(callback: any) {
    this.stack.push(callback)
    this.functionStack()
  }

  private async functionStack() {
    if (!this.runFor)
      return
    this.runFor = false
    for (let callback of this.stack) {
      await callback()
    }
    this.runFor = true
    this.stack = []
  }
}


