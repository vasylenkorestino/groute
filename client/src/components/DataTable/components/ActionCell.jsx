import React, { useContext, useEffect } from 'react';

import { DataContext } from '../../../contexts/DataContext'

import { Cell } from 'rsuite-table'
import EditIcon from '@rsuite/icons/Edit';
import MoreIcon from '@rsuite/icons/More';

import { Whisper, Divider, Popover, Dropdown } from 'rsuite'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Actioncell = ({ rowData, dataKey, endpoint, setShow, ...props }) => {

  const { records, setRecord, setIsNew, cloneRecord, deleteRecord } = useContext(DataContext)

  const renderMenu = ({ onClose, left, top, className }, ref) => {

    const handleSelect = eventKey => {
      onClose()
      switch (eventKey) {
        case 'delete':
            deleteRecord(endpoint, rowData[dataKey]).then(response => {
                console.log('response : ', response)
                response.status === 200 ? toast.success(response.data.message) : toast.error('Something went wrong')
            })
          break;
        case 'clone':
            // cloneRecord(endpoint, rowData[dataKey]).then(response => {
            //     console.log('response : ', response)
            //     response.status === 201 ? toast.success(response.data.message) : toast.error('Something went wrong')
            // })
          break;
      
        default:
          break;
      }
    }
    return (
      <Popover ref={ref} className={className} style={{ left, top }} full>
        <Dropdown.Menu onSelect={ handleSelect }>
          <Dropdown.Item eventKey={'delete'}>Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Popover>
    );
  };

  const handleEdit = () => {
      setShow(true)
      setIsNew(false)
      setRecord(records.find(record => record._id === rowData[dataKey]))
  }

    return (
      <Cell {...props} className="link-group">
        <EditIcon onClick={ handleEdit }/>
        <Divider vertical />
        <Whisper placement="autoVerticalStart" trigger="click" speaker={ renderMenu }>
          <MoreIcon />
        </Whisper>
      </Cell>
    );
}

export default Actioncell;
