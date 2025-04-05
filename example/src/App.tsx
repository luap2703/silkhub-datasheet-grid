/* eslint-disable react/react-in-jsx-scope */

import { useCallback, useMemo, useState } from 'react'
import {
  checkboxColumn,
  Column,
  DynamicDataSheetGrid,
  keyColumn,
  textColumn,
} from '../../src'

type Row = {
  active: boolean
  firstName: string | null
  lastName: string | null

  department: string | null

  isGroup?: boolean
}

function App() {
  const [data, setData] = useState<Row[]>([
    {
      isGroup: true,
      department: 'Engineering',
      firstName: 'First',
      lastName: 'Name',
      active: false,
    },
    {
      active: true,
      firstName: 'Elon',
      lastName: 'Musk',
      department: 'Engineering',
    },
    {
      active: false,
      firstName: 'Jeff',
      lastName: 'Bezos',
      department: 'Engineering',
    },
    {
      active: true,
      firstName: 'Bill',
      lastName: 'Gates',
      department: 'Engineering',
    },
    {
      active: true,
      firstName: 'Steve',
      lastName: 'Jobs',
      department: 'Engineering',
    },
    {
      active: true,
      firstName: 'Larry',
      lastName: 'Page',
      department: 'Engineering',
    },
    {
      active: true,
      firstName: 'Sergey',
      lastName: 'Brin',
      department: 'Engineering',
    },
    {
      active: true,
      firstName: 'Mark',
      lastName: 'Zuckerberg',
      department: 'Engineering',
    },
    {
      active: true,
      firstName: 'Satya',
      lastName: 'Nadella',
      department: 'Engineering',
    },
    {
      isGroup: true,
      department: 'Marketing',
      firstName: null,
      lastName: null,
      active: false,
    },
    {
      active: true,
      firstName: 'Sheryl',
      lastName: 'Sandberg',
      department: 'Marketing',
    },
    {
      active: true,
      firstName: 'Gary',
      lastName: 'Vaynerchuk',
      department: 'Marketing',
    },
    {
      active: true,
      firstName: 'Seth',
      lastName: 'Godin',
      department: 'Marketing',
    },
    {
      active: true,
      firstName: 'Ann',
      lastName: 'Handley',
      department: 'Marketing',
    },
    {
      isGroup: true,
      department: 'Sales',
      firstName: null,
      lastName: null,
      active: false,
    },
    {
      active: true,
      firstName: 'Grant',
      lastName: 'Cardone',
      department: 'Sales',
    },
    {
      active: true,
      firstName: 'Jordan',
      lastName: 'Belfort',
      department: 'Sales',
    },
    {
      active: true,
      firstName: 'Brian',
      lastName: 'Tracy',
      department: 'Sales',
    },
  ])

  const columns: Column<Row, any>[] = useMemo(
    () => [
      {
        ...keyColumn<Row, 'active'>('active', checkboxColumn),
        title: (v) => <>Active</>,
        disabled: ({ rowData }) => !!rowData.isGroup,
        sticky: 'left',
        basis: 100,
        minWidth: 100,
      },
      {
        ...keyColumn<Row, 'firstName'>('firstName', textColumn),
        title: () => <>2</>,
        disabled: ({ rowData }) => !!rowData.isGroup,
        sticky: 'left',
        basis: 100,
        minWidth: 100,
      },
      {
        ...keyColumn<Row, 'lastName'>('lastName', textColumn),
        title: () => <>3</>,
        disabled: ({ rowData }) => !!rowData.isGroup,
        sticky: 'left',
        minWidth: 100,

        grow: 2,
      },
      {
        ...keyColumn<Row, 'lastName'>('lastName', textColumn),
        title: () => <>4</>,
        disabled: ({ rowData }) => !!rowData.isGroup,
        sticky: 'left',
        minWidth: 100,
        basis: 100,
        grow: 2,
      },
      {
        ...keyColumn<Row, 'lastName'>('lastName', textColumn),
        title: () => <>Last name</>,
        disabled: ({ rowData }) => !!rowData.isGroup,

        grow: 2,
      },
      {
        ...keyColumn<Row, 'lastName'>('lastName', textColumn),
        title: () => <>Last name</>,
        disabled: ({ rowData }) => !!rowData.isGroup,

        grow: 2,
      },
      {
        ...keyColumn<Row, 'lastName'>('lastName', textColumn),
        title: () => <>Last name</>,
        disabled: ({ rowData }) => !!rowData.isGroup,

        grow: 2,
      },
      {
        ...keyColumn<Row, 'lastName'>('lastName', textColumn),
        title: () => <>Last name</>,
        disabled: ({ rowData }) => !!rowData.isGroup,

        grow: 2,
      },
      {
        ...keyColumn<Row, 'lastName'>('lastName', textColumn),
        title: () => <>Last name</>,
        disabled: ({ rowData }) => !!rowData.isGroup,

        grow: 2,
      },
    ],
    []
  )

  const groupRowComponent = useCallback(
    (v: { rowData: Row; rowIndex: number }) => {
      return <div className="w-full">Test</div>
    },
    []
  )

  return (
    <>
      <div
        style={{
          margin: '50px',
          padding: '50px',
          maxWidth: '900px',
          background: '#f3f3f3',
        }}
      >
        <DynamicDataSheetGrid
          value={data}
          onChange={setData}
          columns={columns}
          groupRowComponent={groupRowComponent}
          groupRowComponentProps={{
            keepColsLeft: 3,
            keepColsRight: 0,
            cellClassName: 'bg-red-500',
          }}
        />
      </div>
    </>
  )
}

export default App
