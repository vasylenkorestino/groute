import React, { useState } from 'react';

import Users from '../Users/Users'
import Routes from '../Routes/Routes'

import { Grid, Row, Col, Sidenav, Nav, Dropdown } from 'rsuite'
import DashboardIcon from '@rsuite/icons/Dashboard'
import ListIcon from '@rsuite/icons/List'
import GridIcon from '@rsuite/icons/Grid';
import GearIcon from '@rsuite/icons/Gear'

import { BiExpandAlt } from 'react-icons/bi';

import CameraComponent from '../../components/Camera/Camera'

import 'rsuite/dist/rsuite.min.css'

const Admin = () => {

    const [expanded, setExpanded] = useState(false);
    const [activeKey, setActiveKey] = useState('users');

    const handleSelect = (eventKey) => {
        setActiveKey(eventKey)
        console.log('eventKey : ', eventKey)
    }

    const getContent = (activeKey) => {
        console.log('activeKey : ', activeKey)
        if(activeKey == 'routes'){
            return (<Routes />)
        } else if(activeKey == 'users'){
            return (<Users />)
        } else if(activeKey == 'settings'){
            return (<CameraComponent />)
        }
    }

    return (
            <Grid fluid>
                <Row className="show-grid">
                    <Col xs={4}>
                        <BiExpandAlt onClick={ () => setExpanded(!expanded) }/>
                        <Sidenav
                            expanded={ expanded }
                            defaultOpenKeys={[]}
                            activeKey={ activeKey }
                            onSelect={ handleSelect }
                        >
                        <Sidenav.Body>
                            <Nav>
                            <Nav.Item eventKey="routes" icon={<DashboardIcon  />}>
                                Routes
                            </Nav.Item>
                            <Nav.Item eventKey="users" icon={<ListIcon />}>
                                Users
                            </Nav.Item>
                            { /* 
                                <Dropdown
                                    placement="rightTop"
                                    eventKey="3"
                                    title="Advanced"
                                    icon={<GridIcon />}
                                >
                                    <Dropdown.Item eventKey="test">Test</Dropdown.Item>
                                </Dropdown>
                                <Dropdown
                                    placement="rightTop"
                                    eventKey="4"
                                    title="Settings"
                                    icon={<GearIcon />}
                                >
                                    <Dropdown.Item eventKey="settings">User Settings</Dropdown.Item>
                                </Dropdown>
                            */}
                            </Nav>
                        </Sidenav.Body>
                        </Sidenav>
                    </Col>
                    <Col xs={20}>
                        { 
                            getContent(activeKey)
                        } 
                    </Col>
                </Row>
            </Grid>
    );
}

export default Admin;