import React, { useEffect, useState, useContext } from 'react';

import { DataContext } from '../../contexts/DataContext'

import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { ThreeDots } from  'react-loader-spinner'

import { SelectPicker, Input, Toggle, InputGroup, } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

import { BsFillEyeSlashFill, BsFillCameraFill } from 'react-icons/bs';
import { FaRegEye } from 'react-icons/fa';

import ModalWindow from '../Modal/Modal'
import Camera from '../Camera/Camera'

const InputForm = ({ endpoint, columns, close, title, mode }) => {

    const { isNew, record, loading, upsertRecord, uploadPhoto } = useContext(DataContext)

    const [form, setForm] = useState({})

    useEffect(() => { 
        console.log('record : ', record)
        setRecordWithoutPasswordKey();
    },[ record ])

    const setRecordWithoutPasswordKey = () => {
        setForm(current => {
            const copy = {...current};
            delete copy['password'];
            return copy;
          });
    }

    const handleChange = (event) => { 
        console.log('event select : ', event)
        setForm({ ...form, [event.name] : event.e }) 
        console.log('form : ', form)
    }

    const handleUpsert = () => {
        upsertRecord(endpoint, form)
        .then(response => response.status === 201 ? toast.success(response.data.message) : toast.error('Something went wrong'))
        .then(() => {
            if(imageUrl){
                uploadPhoto(endpoint, { fileName: record.Account_Name__c + '.jpeg', fileBase64: imageUrl, sourceId: record.AccountId__c }).then(response => {
                    console.log('response handleSetImageUrl : ', response)
                })
            }
        })
        .catch(error => toast.error(error))
        .finally(() => close())
    }

    const [changePassword, setChangePassword] = useState(false);
    const handleChangePassword = () => {
        setChangePassword(!changePassword)
        if(changePassword){
            setForm({ ...form, password : '' }) 
        } else {
            setRecordWithoutPasswordKey();
        }
        console.log('handleChangePassword form : ', form)
    }
    const [visible, setVisible] = useState(false);
    const handleChangePasswordView = () => setVisible(!visible)

    const getPasswordInput = (column) => {
        return (
            <>
            { 
                changePassword 
                ?
                    <>
                        <InputGroup inside>
                            { !isNew && <InputGroup.Button onClick={handleChangePassword}>X</InputGroup.Button> }
                            <Input type={visible ? 'text' : 'password'} value={ form[column.apiName] } onChange={ e => handleChange({ name: column.apiName, e: e }) } autocomplete="new-password" />
                            <InputGroup.Button onClick={handleChangePasswordView}>
                                {visible ? <FaRegEye /> : <BsFillEyeSlashFill />}
                            </InputGroup.Button>
                        </InputGroup>
                    </>
                :
                    !isNew && <Button variant="light" onClick={ handleChangePassword } size="sm">Change Password</Button>
            }
            </>
        )
    }

    const [showCamera, setShowCamera] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const handleChangeCameraView = () => setShowCamera(!showCamera)

    const handleSetImageUrl = (url) => {
        setImageUrl(url)
        //setForm({ ...form, 'CompletedRoutePhoto__c' : url }) 
    }


    const getCameraInput = (column) => {
        return (
            <>
                { 
                    imageUrl 
                    ?
                        <img style={{ height: 400 }} className="w-100" src={imageUrl} alt="routeImage"/>
                    :
                    <>
                        <InputGroup.Button onClick={handleChangeCameraView}><BsFillCameraFill /></InputGroup.Button>
                        <ModalWindow show={ showCamera } close={ () => handleChangeCameraView() } context={ <Camera setImageUrl={ handleSetImageUrl } /> }/>
                    </>
                }
            </>
        )
    }

    const getInput = (column) => {
        switch (column.type) {
            case 'select': return <SelectPicker data={ column.data } block searchable={column.searchable} onChange={ e => handleChange({ name: column.apiName, e: e }) } placeholder={ 'Select ' + column.name } value={ column.data && column.data.find(item => item.value === form[column.apiName])?.value }/>
            case 'long': return <Input as="textarea" rows={3} placeholder={ column.name + '...' } value={ form[column.apiName] } onChange={ e => handleChange({ name: column.apiName, e: e }) } />
            case 'password': return getPasswordInput(column)
            case 'checkbox': return <Toggle type="checkbox" checked={ form[column.apiName] } onChange={ e => handleChange({ name: column.apiName, e: e }) } />
            case 'camera': return getCameraInput(column)
            default: return <Input value={ form[column.apiName] } onChange={ e => handleChange({ name: column.apiName, e: e }) } />
        }
    }

    const getInputFiled = (column) => (
        <div class="mb-3">
            <h6 class="d-flex justify-content-start" style={{ marginBottom: 10 }}>{ column.name }</h6>
            { getInput( column ) }
        </div>
    )

    return (
        <>
            <Modal.Header closeButton>
            <Modal.Title><div className="display-5">{ title }</div></Modal.Title>
            </Modal.Header>
            { 
                record?.Account_Name__c && record?.Container_Address__c &&
                <div className='m-5'>
                    <div className="display-6 mb-3">{ record?.Account_Name__c }</div>
                    <div className="display-6">{ record?.Container_Address__c }</div>
                </div>
            }
            <Modal.Body> 
                { 
                    !loading 
                    ? 
                    <div style={{ height: 300 }} className='d-flex w-100 justify-content-center align-items-center'>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                    :
                    <form onSubmit={ e => e.preventDefault() } autocomplete="off" role="presentation">
                        <div hidden={true}><Form.Control name={ mode === 'salesforce' ? 'Id' : '_id'} value={ form[mode === 'salesforce' ? 'Id' : '_id'] } onChange={ handleChange }/> </div>
                        { columns.sort((a, b) => { return a.modalOrder - b.modalOrder }).map(column => ( !column.hideField && getInputFiled(column) )) }
                    </form>
                } 
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" type="submit" onClick={ handleUpsert } size="lg">Save</Button>
            </Modal.Footer>
        </>
    );
}

export default InputForm;
