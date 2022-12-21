import React, { memo, useState, useEffect, useContext, useCallback } from 'react'

import { AuthContext } from '../../contexts/AuthContext'
import { DataContext } from '../../contexts/DataContext'

import './Route.css'

import { List, Panel, Row, Col, DatePicker, SelectPicker } from 'rsuite';

import { ThreeDots } from  'react-loader-spinner'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RouteCard from '../../components/RouteCard/RouteCard'

const Route = ({ user }) => {

    const { isAdmin } = useContext(AuthContext)
    const { drivers, groutes, getDrivers, getRoutes, setIsReady, loading } = useContext(DataContext)

    const endpoint = 'api/salesforce/routes'
    const columns = [
        { 
            name: 'Service Issues', 
            apiName: 'Notes2__c', 
            type: 'select', 
            searchable: false, 
            width: 300, 
            order: 2, 
            modalOrder: 2, 
            hideCell: false, 
            data: ['Not Collected - Low', 'Not Collected - Empty', 'Inaccessible', 'Restaurant Closed'].map(item => ({ label: item, value: item })) 
        },
        { 
            name: 'Gallons', 
            apiName: 'Gallons_Collected__c', 
            type: 'text', 
            width: 300, 
            order: 3, 
            modalOrder: 3, 
            hideCell: false 
        }, 
        { 
            name: 'Description', 
            apiName: 'Driver_Notes__c', 
            type: 'long', 
            width: 100, 
            order: 4, 
            modalOrder: 4, 
            hideCell: false 
        }, 
        { 
            name: 'Photo', 
            apiName: 'CompletedRoutePhoto__c', 
            type: 'camera', 
            width: 100, 
            order: 4, 
            modalOrder: 4, 
            hideCell: true 
        },
        { 
            name: 'Unserviced', 
            apiName: 'Inactive__c', 
            type: 'checkbox', 
            width: 100, 
            order: 5, 
            modalOrder: 5, 
            hideCell: false 
        }
    ]

    const [filter, setFilter] = useState({ driverName: null, dateOfService: null })

    useEffect(() => {
        if(!filter.driverName){ setFilter( f => ({ ...f, driverName: user.userName })) }
        if(!filter.dateOfService){ setFilter( f => ({ ...f, dateOfService: new Date() })) }
        getDrivers()
        getRoutes(filter)
    }, [ filter ])

    const handleChangeDate = (event) => {
        setIsReady(false)
        setFilter( f => ({ ...f, dateOfService: event }))
    }

    const handleChangeDriver = (event) => {
        setIsReady(false)
        setFilter( f => ({ ...f, driverName: event }))
    }

    return (
        <div>
            <ToastContainer />
            <Panel>
                <Row className="show-grid">
                    <Col xs={12}>
                        { isAdmin && <SelectPicker size="lg" data={ drivers.map(driver => ({ label: driver.Name, value: driver.Name })) } style={{ width: 200, margin: 3 }} onChange={ handleChangeDriver } value={ filter.driverName } /> }
                        <DatePicker size="lg" style={{ width: 200, margin: 3 }} placeholder="Select Date" value={ filter.dateOfService } onOk={ e => handleChangeDate(e) }/>
                    </Col>
                    <Col xs={12}>
                        <div className="d-flex justify-content-center display-3 mt-2" style={{ marginBottom: 70 }}>
                            { filter.driverName }
                        </div>
                    </Col>
                </Row>
                <Row className="show-grid">
                { 
                    !loading 
                    ?
                    <div style={{ position: 'fixed', width: '100%', height: '100%', zIndex: 1, left: '47%', top: '40%' }}>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                    :
                        groutes && groutes.length 
                        ? 
                            <List size="lg" autoScroll hover sortable>
                                { 
                                    groutes && groutes.map((route, index) => (
                                        <List.Item key={index} index={index} className={ route.style }>
                                            <RouteCard route={ route } endpoint={ endpoint } columns={ columns } reload={ () => getRoutes(filter) }/>
                                        </List.Item>
                                    ))
                                }
                            </List>
                        :
                        <div style={{ height: 300 }} className="display-6 d-flex justify-content-center align-items-center">Routes for { filter.driverName } not found!</div> 
                }
                </Row>
            </Panel>
        </div>
    );
}

export default Route;
