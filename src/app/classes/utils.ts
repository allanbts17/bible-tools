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
