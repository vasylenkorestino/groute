import React, { memo, useState, useEffect, useContext, useCallback } from 'react'

import { AuthContext } from '../../contexts/AuthContext'
import { DataContext } from '../../contexts/DataContext'

import './Route.css'

import { List, Panel, Row, Button, Col, DatePicker, SelectPicker } from 'rsuite';

import { ThreeDots } from  'react-loader-spinner'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RouteCard from '../../components/RouteCard/RouteCard'

import { isMobile } from 'react-device-detect'
import Map from '../Map/Map'

const Route = ({ user }) => {

    const { isAdmin } = useContext(AuthContext)
    const { drivers, groutes, getDrivers, getRoutes, setIsReady, loading, notifyAdmin } = useContext(DataContext)

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
            name: 'Driver Note', 
            apiName: 'Driver_Notes__c', 
            type: 'long', 
            width: 100, 
            order: 4, 
            modalOrder: 4, 
            hideCell: false 
        }, 
        { 
            name: 'Serial Number', 
            apiName: 'SerialNumber__c', 
            type: 'text', 
            width: 100, 
            order: 4, 
            modalOrder: 4, 
            hideCell: false 
        },
        { 
            name: 'Second Serial Number', 
            apiName: 'SecondSerialNumber__c', 
            type: 'text', 
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
            order: 5, 
            modalOrder: 5, 
            hideCell: true 
        },
        { 
            name: 'Unserviced', 
            apiName: 'Inactive__c', 
            type: 'checkbox', 
            width: 100, 
            order: 6, 
            modalOrder: 6, 
            hideCell: false 
        }
    ]

    const [filter, setFilter] = useState({ driverName: null, dateOfService: null })

    const [origin, setOrigin] = useState({ lat: 0, lng: 0 })//{ lat: 37.77, lng: -122.447 }) //

    const [destination, setDestination] = useState({ lat: 0, lng: 0 })//{ lat: 37.768, lng: -122.511 }) //

    const [waypoints, setWaypoints] = useState([]) //{ location: { lat: 38.768, lng: -122.511 } }

    useEffect(() => {
        if(!filter.driverName){ setFilter( f => ({ ...f, driverName: user.userName })) }
        if(!filter.dateOfService){ setFilter( f => ({ ...f, dateOfService: new Date() })) }
        getDrivers()
        getRoutes(filter)

        console.log('groutes :', groutes )

        if(groutes && groutes.length){
            setOrigin({ 
                lat: groutes[0]?.GRoute_Id__r?.Service_Location_Start__r?.Latitude__c,
                lng: groutes[0]?.GRoute_Id__r?.Service_Location_Start__r?.Longitude__c
            })

            setDestination({ 
                lat: groutes[0]?.GRoute_Id__r?.Service_Location_End__r?.Latitude__c,
                lng: groutes[0]?.GRoute_Id__r?.Service_Location_End__r?.Longitude__c
            })

            let waypoints = []

            groutes.forEach(p => {
                waypoints.push({ location: { lat: p.Latitude__c, lng: p.Longitude__c } })
            })

            setWaypoints(waypoints)
        }

    }, [ filter, groutes.length ])

    const handleChangeDate = (event) => {
        setIsReady(false)
        setFilter( f => ({ ...f, dateOfService: event }))
    }

    const handleChangeDriver = (event) => {
        setIsReady(false)
        setFilter( f => ({ ...f, driverName: event }))
    }

    const handleNotify = () => {
        let route = groutes.length && groutes[0]

        notifyAdmin(endpoint, route).then(response => {
            console.log('response  :', response)
            response.status === 201 ? toast.success(response.data.message) : toast.error('Something went wrong')
        })
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

                        
                        isMobile
                        ?
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ width: '100%', height: '75vh' }}>

                            { 
                                origin && destination && waypoints.length 
                                ?
                                <Map origin={origin} destination={destination} waypoints={waypoints} />
                                :
                                <></>
                            }

                            </div>

                            <div style={{ width: '100%', overflowY: 'scroll', height: '75vh' }}>

                                <List size="sm" autoScroll hover sortable>
                                    { 
                                        groutes && groutes.map((route, index) => (
                                            <List.Item key={index} index={index} className={ route.style }>
                                                <RouteCard route={ route } endpoint={ endpoint } columns={ columns } reload={ () => getRoutes(filter) }/>
                                            </List.Item>
                                        ))
                                    }
                                </List>
                                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', alignItems: 'center', height: 100 }}>
                                    <Button style={{ width: '90%', height: 60 }} size="lg" onClick={handleNotify}>Send Notification</Button>
                                </div>

                            </div>
                        </div>
                        :
                        <div style={{ display: 'flex' }}>
                            <div style={{ width: '60%' }}>

                            { 
                                origin && destination && waypoints.length 
                                ?
                                <Map origin={origin} destination={destination} waypoints={waypoints} />
                                :
                                <></>
                            }

                            </div>

                            <div style={{ width: '40%', overflowY: 'scroll', height: '75vh' }}>

                                <List size="sm" autoScroll hover sortable>
                                    { 
                                        groutes && groutes.map((route, index) => (
                                            <List.Item key={index} index={index} className={ route.style }>
                                                <RouteCard route={ route } endpoint={ endpoint } columns={ columns } reload={ () => getRoutes(filter) }/>
                                            </List.Item>
                                        ))
                                    }
                                </List>
                                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', alignItems: 'center', height: 100 }}>
                                    <Button style={{ width: '90%', height: 60 }} size="lg" onClick={handleNotify}>Send Notification</Button>
                                </div>

                            </div>
                        </div>
                        :
                        <div style={{ height: 300 }} className="display-6 d-flex justify-content-center align-items-center">Routes for { filter.driverName } not found!</div> 
                }
                </Row>
            </Panel>
        </div>
    );
}

export default Route;
