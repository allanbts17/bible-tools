import cloneDeep from 'lodash.clonedeep'
import * as moment from 'moment'

export const copy = (source: any) => {
  return cloneDeep(source)
}

export const formatDate = (_date: string | Date, format = 'll', locale = 'en') => {
  let date = _date//new Date(_date)
  var localMoment = moment(date)
  console.log('mom',localMoment);

  localMoment.locale(locale);
  return localMoment.format(format)
}

export enum Colors {
  statusBarDarkMode = '#1F1F1F',
  statusBarLightMode = '#FFFFFF',
  statusBarModalDarkMode = '#0d0d0d',
  statusBarModalLightMode = '#222428',
}
