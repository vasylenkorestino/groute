import React, { useState, useContext, useEffect } from 'react';
import './Modal.css'

import Modal from 'react-bootstrap/Modal'

const ModalWindow = ({ show, close, context }) => {

    return (
        <Modal style={{ opacity: 1 }} show={ show } onHide={ close } size="md">
            { context }
        </Modal>
    );
}

export default ModalWindow;
