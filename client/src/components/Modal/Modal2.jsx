import React, { useState, useContext, useEffect } from 'react';

import './Modal.css'

import { DataContext } from '../../contexts/DataContext'

import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThreeDots } from  'react-loader-spinner'

import { SelectPicker, Input, Toggle } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

import CameraComponent from '../Camera/Camera'

const ModalWindow = ({ endpoint, show, close, columns, title }) => {

    const { record, loading, upsertRecord } = useContext(DataContext)

    const [form, setForm] = useState({})

    useEffect(() => { 
        console.log('record : ', record)
        setForm({ ...record })  
    },[ record ])

    const handleChangeCheckbox = (event) => { 
        console.log('event : ', event)
        setForm({ ...form, [event.name] : event.e }) 
    }

    const handleChange = (event) => { 
        console.log('event : ', event)
        setForm({ ...form, [event.target.name] : event.target.value }) 
        console.log('form : ', form)
    }

    const handleUpsert = () => {
        // upsertRecord(endpoint, form)
        // .then(response => response.status === 201 ? toast.success(response.data.message) : toast.error('Something went wrong'))
        // .catch(error => toast.error(error))
        // .finally(() => close())
    }

    const getInput = (column) => {
        switch (column.type) {
            case 'select': return <SelectPicker data={ column.data } block searchable={column.searchable} placeholder={ 'Select ' + column.name } value={ column.data && column.data.find(item => item.value === form[column.apiName])?.value }/>
            case 'long': return <Input as="textarea" rows={3} placeholder={ column.name + '...' } value={ form[column.apiName] } />
            case 'password': return <input name={ column.apiName } type="password" class="form-control" style={{ fontSize: 18 }} value={ form[column.apiName] } onChange={ handleChange } />
            case 'checkbox': return <Toggle name={ column.apiName } type="checkbox" checked={ form[column.apiName] } onChange={ e => handleChangeCheckbox({ name: column.apiName, e: e }) } />
            default: return <Form.Control name={ column.apiName } value={ form[column.apiName] } onChange={ handleChange } />
        }
    }

    const getInputFiled = (column) => (
        <div class="mb-3">
            <h6 class="d-flex justify-content-start" style={{ marginBottom: 10 }}>{ column.name }</h6>
            { getInput( column ) }
        </div>
    )

    return (
        <Modal style={{ opacity: 1 }} show={ show } onHide={ close } size="md">
            <Modal.Header closeButton>
            <Modal.Title><div className="display-5">{ title }</div></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { 
                    !loading 
                    ? 
                    <div style={{ height: 300 }} className='d-flex w-100 justify-content-center align-items-center'>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                    :
                    <form onSubmit={ e => e.preventDefault() }>
                        <div hidden={true}> <Form.Control name='_id' value={ form.name } onChange={ handleChange }/> </div>
                        { columns.sort((a, b) => { return a.modalOrder - b.modalOrder }).map(column => ( !column.hideField && getInputFiled(column) )) }
                    </form>
                }

            </Modal.Body>
            <Modal.Footer>
            <Button variant="primary" type="submit" onClick={ handleUpsert }>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalWindow;
