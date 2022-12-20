import React, { useEffect, useContext } from 'react';

import DataTable from '../../components/DataTable/DataTable'

import { DataContext } from '../../contexts/DataContext'

const Routes = () => {

    const { drivers, getDrivers } = useContext(DataContext)

    useEffect(() => {
        getDrivers()
    }, [])

    const endpoint = '/api/users'
    const columns = [
        { name: 'Name', apiName: 'driverName', type: 'name', width: 400, order: 1, modalOrder: 1, hideCell: false }, 
        { name: 'Email', apiName: 'email', type: 'text', width: 300, order: 2, modalOrder: 2, hideCell: false },
        { name: 'User Name', apiName: 'username', type: 'text', width: 300, order: 3, modalOrder: 3, hideCell: true }, 
        { name: 'Password', apiName: 'password', type: 'password', width: 100, order: 4, modalOrder: 4, hideCell: true }, 
        { name: 'Salesforce User', apiName: 'sfUser', type: 'select', width: 100, order: 5, modalOrder: 5, hideCell: true, data: drivers.map(driver => ({ label: driver.Name, value: driver.Id })) }, 
        { name: 'isActive', apiName: 'isActive', type: 'checkbox', width: 100, order: 6, modalOrder: 6, hideCell: false }, 
        { name: 'isAdmin', apiName: 'isAdmin', type: 'checkbox', width: 100, order: 7, modalOrder: 7, hideCell: false }
    ]

    return (
        <div style={{ width: 1100 }} className="d-flex justify-content-center">
            <div style={{ width: 1000 }}>
                <DataTable endpoint={ endpoint } columns={ columns }/>
            </div>
        </div>
    );
}

export default Routes;
