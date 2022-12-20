import React from 'react'

import { Cell } from 'rsuite-table'
import { Checkbox } from 'rsuite';

const CheckboxCell = ({ rowData, dataKey, ...props }) => {
    return (
        <Cell {...props} style={{ padding: 0 }}>
          <Checkbox checked={ rowData[dataKey] }></Checkbox>
        </Cell>
    );
}

export default CheckboxCell;
