import React from 'react'
import { Cell } from 'rsuite-table'
import { Popover, Whisper } from 'rsuite'

const Namecell = ({ rowData, dataKey, ...props }) => {

    const skipFields = ['_id', '__v', 'password']

    const truncate = (string, n) => { 
        if (string.length <= n) { return string }
        const subString = string.slice(0, n - 1)
        return subString.slice(0, subString.lastIndexOf(" ")) + '...'
    }
    
    const speaker = (
        <Popover title="Description">
          { Object.keys(rowData).sort((a, b) => { return a.order - b.order }).map(field => {
            if(!skipFields.includes(field)){
              return( <p>{ field }: { field === 'description' ? truncate(rowData[field], 100) : `${rowData[field]}` }{' '}</p> )
            }
          })}
        </Popover>
      );
    

      // speaker={speaker}
      return (
        <Cell {...props}>
          <Whisper placement="top" speaker={speaker}>
            <a>{rowData[dataKey].toLocaleString()}</a>
          </Whisper>
        </Cell>
      );
}

export default Namecell;
