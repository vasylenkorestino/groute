import React, { useContext } from 'react'

import "bootstrap/dist/css/bootstrap.min.css";

import { AuthContext } from '../../contexts/AuthContext'

import { Navbar } from 'react-bootstrap'
import { Container } from 'react-bootstrap'
import { Nav } from 'react-bootstrap'

import { IconContext } from 'react-icons'
import { IoMdLogIn, IoMdLogOut } from 'react-icons/io'
import { BiUserCircle } from 'react-icons/bi'
import { GiFoodTruck } from 'react-icons/gi'

const Navigation = () => {

    const { logout, isLogin, isAdmin } = useContext(AuthContext)

    return (
        <div style={{ width: '100%' }}>
            <Navbar bg="#292d33" variant="dark">
                <Container>
                <div style={{ flex: 1, width: '100%', height: 100, alignItems: 'center' }} className='d-flex justify-content-between'>
                    <div style={{ flex: 0.9 }}>
                        <Navbar.Brand href="/">
                            <IconContext.Provider value={{ size: "4em" }}>
                                < GiFoodTruck />
                            </IconContext.Provider>
                        </Navbar.Brand>
                    </div>
        
                    <div style={{ flex: 0.1 }}>
                        <Navbar.Collapse className="justify-content-end">
                            <Navbar.Text>
                                        {
                                            isLogin 
                                            ? 
                                                <Nav className="me-auto">
                                                    { 
                                                        isAdmin 
                                                        && 
                                                        <Nav.Link href="/account">
                                                            <IconContext.Provider value={{ size: "3em" }}>
                                                                < BiUserCircle />
                                                            </IconContext.Provider>
                                                        </Nav.Link>
                                                    }
                                                    
                                                    <Nav.Link href="/" onClick={ logout }>
                                                        <IconContext.Provider value={{ size: "3em" }}>
                                                            < IoMdLogOut />
                                                        </IconContext.Provider>
                                                    </Nav.Link>
                                                </Nav>
                                            :
                                                <Nav className="me-auto">
                                                    <Nav.Link href="/login">
                                                        <IconContext.Provider value={{ size: "3em" }}>
                                                            < IoMdLogIn />
                                                        </IconContext.Provider>
                                                    </Nav.Link>
                                                </Nav>
                                        }
                            </Navbar.Text>
                        </Navbar.Collapse>
                    </div>
                    
                </div>
            </Container>
            </Navbar>
        </div>
    );
}

export default Navigation;
