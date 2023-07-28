import React, { useState, useContext } from 'react';

import { Panel, IconButton, Row, Col } from 'rsuite'
import CheckOutlineIcon  from '@rsuite/icons/CheckOutline';

import { DataContext } from '../../contexts/DataContext'

import ModalWindow from '../Modal/Modal'
import InputForm from '../Forms/Form'

import { SiGooglemaps } from 'react-icons/si'

const RouteCard = ({ route, endpoint, columns, reload }) => {

    const { setRecord, setIsReady } = useContext(DataContext)

    const [show, setShow] = useState(false)
    const [updatedColumns, setUpdatedColumns] = useState([])

    const handleClose = () => {
        setShow(!show)
        reload()
    }

    const handleEdit = (route) => {
        setShow(true)
        if(route?.ServiceSubType__c){
            if(!route?.ServiceSubType__c?.includes('Deliver')){
                setUpdatedColumns(columns.filter(c => ( c.name != 'Serial Number')))
            } else {
                setUpdatedColumns(columns)
            }
        } else {
            setUpdatedColumns(columns.filter(c => ( c.name != 'Serial Number')))
        }
        setRecord(route)
        setIsReady(true)
    }

    return (
        <div>
            <ModalWindow show={ show } close={ handleClose } context={ < InputForm endpoint={ endpoint } columns={ updatedColumns } close={ handleClose } title={ 'Complete Route' } record={ route } mode='salesforce' /> } />
            <Panel>
                <Row className="show-grid d-flex justify-content-center align-items-center">
                    <Col xs={5} className='d-flex justify-content-center align-items-center'>
                        <IconButton className='d-flex justify-content-center align-items-center' style={{ width: 100, height: 100 }} circle size='lg' appearance="subtle" icon={<SiGooglemaps color="blue" style={{ width: 30, height: 30 }} />} href={ route.link } target="_blank"></IconButton>
                    </Col>
                    <Col xs={14}>
                        <div className="d-flex flex-column align-items-center">
                            <div>
                                <div className="display-4"> { route.Account_Name__c } </div>
                                <div className="lead mb-0"> Address: { route.Container_Address__c } </div>
                                <div className="lead mb-0"> Comment: { route.Notes__c } </div>
                                <div className="lead mb-0"> Gallons: { route.Gallons_Collected__c } </div>
                                <div className="lead mb-0"> Service Type: { route.ServiceType__c } </div>
                                {
                                    route.ServiceSubType__c && <div className="lead mb-0"> Service Sub Type: { route.ServiceSubType__c } </div>
                                }
                                <div className="lead mb-0"> ContainerSize: { route.Container_Size__c } </div>
                            </div>
                        </div></Col>
                    <Col xs={5} className='d-flex justify-content-center align-items-center'>
                        { 
                            !(route.style === 'bg-serviced') && 
                            <IconButton className='d-flex justify-content-center align-items-center' style={{ width: 100, height: 100 }} circle color="green" appearance="subtle" icon={<CheckOutlineIcon color="green" style={{ width: 30, height: 30 }} />} onClick={ () => handleEdit(route) }></IconButton>
                        }
                    </Col>
                </Row>
            </Panel>
        </div>
    );
}

export default RouteCard;
