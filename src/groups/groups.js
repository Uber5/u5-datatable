// @flow

import {
  keys, map, pipe, sort
} from 'ramda'

type Item = any

type Aggregation = any

interface Group {
  getKey(i: Item): any,
  sort?: (GroupItem, GroupItem) => number
}

interface GroupItem {
  key: any,
  aggregations: { [string]: any },
  entries: Array<Item>
}

export const validate = (
  config: Array<Group>
) => {
  const errors = []
  // TODO: implement validation
  return errors
}

export const makeGroups = (
  items: Array<Item>,
  groups: Array<Group>
): Array<Item | GroupItem> => {

  if (groups.length === 0) {
    return items
  } else {
    const group = groups[0]
    const grouped = items.reduce((groupItems, item) => {
      const key = group.getKey(item)
      if (groupItems[key]) {
        groupItems[key].entries.push(item)
      } else {
        groupItems[key] = {
          entries: [ item ],
          key,
          aggregations: {}
        }
      }
      return groupItems
    }, {})
    return pipe(
      keys,
      map(key => ({
        key,
        entries: grouped[key].entries
      })),
      sort(group.sort)
    )(grouped)
  }

}
