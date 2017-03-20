import * as R from 'ramda'
import moment from 'moment'

export default {
  people: {
    /**
     * specify a sort function, which takes an array of rows as input.
     * Here, we use ramda to create such a function for us.
     */
    sort: R.sortWith([
      R.ascend(R.prop('lastName')),
      R.ascend(R.prop('firstName'))
    ]),
    columnSpecs: {
      firstName: {
        label: 'First name'
      },
      lastName: {},
      fullName: { // TODO: Not a good idea! Cannot group on a value that does not
                  // exist in the raw data...
        label: 'Full name',
        format: v => ([ v.firstName, v.lastName ].join(' '))
      },
      'details.dob': {
        label: 'Birth date',
        format: v => v.details.dob && v.details.dob.toLocaleDateString()
      }
    },
    groups: [
      {
        type: 'byColumn',
        columnKey: 'lastName'
      },
      {
        type: 'custom',
        expression: 'moment(v.details.dob).format("YYYY")',
        label: 'By year-of-birth',
        sort: 'descending'
      }
    ],
    predefinedGroups: [
      {
        label: 'By last name and yob',
        groups: [
          {
            type: 'byColumn',
            columnKey: 'lastName'
          },
          {
            type: 'custom',
            expression: 'moment(v.details.dob).format("YYYY")',
            label: 'By year-of-birth',
            sort: 'descending'
          }
        ]
      },
      {
        label: 'By last name',
        groups: [
          {
            type: 'byColumn',
            columnKey: 'lastName'
          }
        ]
      },
      {
        label: 'Silly many groups',
        groups: R.times(n => ({
          type: 'custom',
          expression: `v.firstName && v.firstName[${ n }]`,
          label: `By firstName, char ${ n+1 }:`
        }), 9)
      }
    ],
    aggregationSpecs: {
      count: {
        f: rows => rows.length,
        label: '#',
        width: 20
      },
      ageRange: {
        label: 'Age range',
        f: rows => {
          const dob = R.path(['details', 'dob'])
          const ageOf = d => moment().diff(d, 'years', false)
          const byAge = R.pipe(R.sortBy(dob), R.map(dob), R.map(ageOf))(rows)
          const domain = [ R.last(byAge), R.head(byAge) ]
          if (domain[0]) {
            if (domain[0] === domain[1]) {
              return `${ domain[0] } years of age`
            } else {
              return `${ domain[0] } to ${ domain[1] } years of age`
            }
          }
        },
        width: 50
      }
    },
    groupColumnWidth: 120,
    tableMinWidth: 450
  }
}
