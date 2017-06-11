// @flow

import {
  keys, map, pipe, sort, tail
} from 'ramda'

export type Item = any

type Aggregation = any

export interface Group {
  getKey(i: Item): any,
  sort?: (GroupItem, GroupItem) => number,
  aggregations?: { [string]: (Array<Item>) => any }
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

const aggregate = (aggregations, items) => {
  return keys(aggregations).reduce((result, key) => {
    // $FlowFixMe
    result[key] = aggregations[key](items)
    return result
  }, {})
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
        entries: makeGroups(grouped[key].entries, tail(groups)),
        aggregations: aggregate(group.aggregations, grouped[key].entries)
      })),
      sort(group.sort)
    )(grouped)
  }

}
