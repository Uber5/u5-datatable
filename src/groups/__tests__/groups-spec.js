//@flow

import { makeGroups, type Item, type Group } from '../groups'

describe('groups', () => {

  describe('makeGroups', () => {

    it('is a noop for no groups', () => {

      const items = [
        { bla: 42 },
        { blu: 43 }
      ]

      expect(makeGroups(items, [])).toEqual(items)

    })

    describe('given a group and items', () => {

      const groups: Array<Group> = [
        {
          getKey: i => i.name,
          sort: (a, b) => a.key > b.key ? 1 : (a.key < b.key ? -1 : 0),
          aggregations: {
            ["maxAge"]: (items: Array<Item>) => items.reduce((maxAge, i) => i.age > maxAge ? i.age : maxAge, 0)
          }
        }
      ]

      const items = [
        { name: 'John', age: 37 },
        { name: 'John', age: 35 },
        { name: 'Jane', age: 44 },
        { name: 'Bob', age: 11 },
      ]

      it('groups items', () => {
        expect(makeGroups(items, groups)).toEqual([
          {
            key: 'Bob',
            entries: [
              items[3]
            ],
            aggregations: {
              maxAge: 11
            }
          },
          {
            key: 'Jane',
            entries: [
              items[2]
            ],
            aggregations: {
              maxAge: 44
            }

          },
          {
            key: 'John',
            entries: [
              items[0],
              items[1]
            ],
            aggregations: {
              maxAge: 37
            }

          }
        ])
      })
    })

    describe('given two group and items', () => {

      const groups = [
        {
          getKey: i => i.details.gender,
          sort: (a, b) => b.aggregations.minAge - a.aggregations.minAge,
          aggregations: {
            ["minAge"]: items => items.reduce(
              (minAge, i) => i.age < minAge ? i.age : minAge,
              items[0].age
            )
          }
        },
        {
          getKey: i => i.name,
          sort: (a, b) => a.key > b.key ? 1 : (a.key < b.key ? -1 : 0),
          aggregations: {
            ["maxAge"]: items => items.reduce(
              (maxAge, i) => i.age > maxAge ? i.age : maxAge,
              0
            )
          }
        }
      ]

      const items = [
        { name: 'John', age: 37, details: { gender: 'm' } },
        { name: 'John', age: 35, details: { gender: 'm' } },
        { name: 'Jane', age: 44, details: { gender: 'f' } },
        { name: 'Bob', age: 11, details: { gender: 'm' } },
      ]

      it('produces nested groupItems', () => {
        expect(makeGroups(items, groups)).toEqual([
          {
            key: 'f',
            entries: [
              {
                key: 'Jane',
                entries: [
                  items[2]
                ],
                aggregations: {
                  maxAge: 44
                }
              }
            ],
            aggregations: {
              minAge: 44
            }
          },
          {
            key: 'm',
            entries: [
              {
                key: 'Bob',
                entries: [
                  items[3]
                ],
                aggregations: {
                  maxAge: 11
                }
              },
              {
                key: 'John',
                entries: [
                  items[0],
                  items[1]
                ],
                aggregations: {
                  maxAge: 37
                }
              }
            ],
            aggregations: {
              minAge: 11
            }
          },
        ])

      })
    })

  })

})
