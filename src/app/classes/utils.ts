import cloneDeep from 'lodash.clonedeep'

export const copy = (source: any) => {
  return cloneDeep(source)
}
