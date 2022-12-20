import React from 'react';

import { useContext } from 'react';

import { AuthContext } from '../../contexts/AuthContext'

import Route from '../Route/Route'

const Routes = () => {

    const { getCurrentUser } = useContext(AuthContext)

    const user = getCurrentUser();

    return (
        <>
            <Route user={ user }/>
        </>
    );
}

export default Routes;
