//@flow

import { makeGroups } from '../groups'

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

      const groups = [
        {
          getKey: i => i.name,
          sort: (a, b) => a.key > b.key ? 1 : (a.key < b.key ? -1 : 0),
          aggregations: {
            maxAge: items => items.reduce((maxAge, i) => i.age > maxAge ? i.age : maxAge, 0)
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
  })

})
