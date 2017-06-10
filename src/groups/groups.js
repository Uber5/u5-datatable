// @flow

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
    // return items.reduce(())
    return [] // TODO
  }

}
