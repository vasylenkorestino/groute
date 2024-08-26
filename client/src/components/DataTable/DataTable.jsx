import React, { useState, useContext, useEffect } from 'react';

import { DataContext } from '../../contexts/DataContext'

// rsuite
import { Container, Header, Content, Input, InputGroup, IconButton } from 'rsuite'
import { Table, Column, HeaderCell, Cell } from 'rsuite-table'

// Icons
import PlusIcon from '@rsuite/icons/Plus';
import SearchIcon from '@rsuite/icons/Search';

// toast notification
import { ToastContainer } from 'react-toastify';

import ModalWindow from '../Modal/Modal'
import NameCell from './components/NameCell'
import ActionCell from './components/ActionCell'
import CheckboxCell from './components/CheckboxCell'

import InputForm from '../Forms/Form'

import { isMobile } from 'react-device-detect'

const DataTable = ({ endpoint, columns }) => {

    const { records, setRecord, setRecords, getAllRecords, isNew, setIsNew, setIsReady, loading } = useContext(DataContext)

    const [show, setShow] = useState(false);

    const [filter, setFilter] = useState({})

    useEffect(() => {
        console.log('endpoint ?? ', endpoint)
        getAllRecords(endpoint, filter).then(response => {
            setRecords(response.records)
        });
    }, [ filter ])

    const handleClose = () => { 
        setShow(false); 
        setRecord({}) 
    }

    const capitalize = s => s && s[0].toUpperCase() + s.slice(1) 

    const getColumn = (width, name, cell ) => ( 
        <Column width={width} align="center" resizable>
            <HeaderCell>{ capitalize(name) }</HeaderCell>
            { cell }
        </Column>
    )

    const getCell = (column) => {
        switch (column.type) {
            case 'name': return getColumn(column.width, column.name, <NameCell dataKey={ column.apiName } />)
            case 'checkbox': return getColumn(column.width, column.name, <CheckboxCell dataKey={ column.apiName } disabled></CheckboxCell>)
            default: return getColumn(column.width, column.name, <Cell dataKey={ column.apiName } />) 
        }
    }
    
    const addNew = () => { 
        console.log('addNew1')
        setShow(true); setRecord({}); setIsNew(true)
        console.log('addNew2')
    }
    
    const handleFilterParams = (searchText) => {
        setIsReady(false)
        console.log('event ->> ', searchText)
        setTimeout(() => { 
            setFilter({ ...filter, name: searchText })
            //setFilter({ name: searchText }) 
        }, 2000)
    }

    return (
        <div>
            <ToastContainer />
            { /* <ModalWindow endpoint={ endpoint } show={ show } close={ handleClose } columns={ columns } title={ isNew ? 'New User' : 'Edit User'} /> */}
            <ModalWindow show={ show } close={ handleClose } context={ <InputForm endpoint={ endpoint } columns={ columns } close={ handleClose } title={ isNew ? 'New User' : 'Edit User'} mode='mongodb'/>} />
            <Container>
                <Header>
                    <div style={{ width: isMobile ? '85%' : '100%', display: 'flex', margin: '20px 10px'}}>
                        <div>
                            <IconButton style={{ margin: '0px 10px' }} icon={<PlusIcon />} onClick={ addNew }>Add</IconButton>
                        </div>
                        <div style={{ width: isMobile ? '85%' : '100%', display: 'flex', justifyContent: 'flex-end' }}>
                            <InputGroup inside style={{ width: !isMobile ? 400 : 200 }}>
                                <Input name='name' placeholder='Type product name...' onChange={ handleFilterParams } />
                                <InputGroup.Button>
                                <SearchIcon />
                                </InputGroup.Button>
                            </InputGroup>
                        </div>
                    </div>
                    <hr></hr>
                </Header>
                <Content>
                    <div style={{ width: isMobile ? '85%' : '100%', margin: 20 }}>
                        <Table height={300} data={ records } loading={ !loading }>

                        { columns.sort((a, b) => { return a.order - b.order }).map(column => {
                            if(isMobile){ 
                                if(column.name == 'Name'){
                                    return getCell(column)
                                }
                            } else {
                                return !column.hideCell && getCell(column) 
                            }
                        }) }
                        <Column width={100} resizable>
                            <HeaderCell>Action</HeaderCell>
                            <ActionCell dataKey="_id" setShow={ setShow } endpoint={ endpoint }/>
                        </Column>
                        </Table>
                    </div>
                </Content>
            </Container>
        </div>
    );
}

export default DataTable;
