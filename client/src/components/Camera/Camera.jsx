import React, { useState, useRef } from "react";
/*
import { Camera } from "react-camera-pro";

import { InputGroup, } from 'rsuite'
import { BsFillCameraFill, BsSkipBackwardCircle } from 'react-icons/bs'
import { CgArrowsExchangeV } from 'react-icons/cg'
import { GrStatusGood } from 'react-icons/gr'

*/

const CameraComponent = ({ close }) => {
    /*
  const camera = useRef(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState(null);
*/
  return (
    <div style={{ width: 200, height: 600 }}>
        { /*
        !image
        ?  <div>
            <Camera ref={camera} />
            <div className="w-100 fixed-bottom" style={{ height: 100, zIndex: 1 }}>
                <div className="w-100 d-flex justify-content-around align-items-center">
                    <div className="w-33 d-flex justify-content-center align-items-center">
                        <InputGroup.Button size='lg' onClick={ () => close() } style={{ background: 'transparent', border: 'none' }}>
                            <BsSkipBackwardCircle size={80} />
                        </InputGroup.Button>
                    </div>
                    <div className="w-33 d-flex justify-content-center align-items-center">
                        <InputGroup.Button size='lg' onClick={() => setImage(camera.current.takePhoto()) } style={{ background: 'transparent', border: 'none' }}>
                            <BsFillCameraFill size={80} />
                        </InputGroup.Button>
                    </div>
                    <div className="w-33 d-flex justify-content-center align-items-center">
                        <InputGroup.Button size='lg' onClick={() => camera.current.switchCamera()} style={{ background: 'transparent', border: 'none' }}>
                            <CgArrowsExchangeV size={80} />
                        </InputGroup.Button>
                    </div>
                </div>
            </div>
            { <button className="w-100 fixed-bottom" style={{ height: 100, zIndex: 1, opacity: 0.4 }} onClick={() => setImage(camera.current.takePhoto())}>BsFillCameraFill</button> }
            </div>
        : 
            <div style={{ width: 200, height: 600 }}>
            <img style={{ width: 200, height: 600 }} className="w-100" src={image} alt='Image preview' />
            <div className="w-100 fixed-bottom" style={{ height: 100, zIndex: 1, opacity: 0.4 }}>
                <div className="w-100 d-flex justify-content-center align-items-center">
                        <InputGroup.Button size='lg' onClick={() => setImage(camera.current.takePhoto())}>
                            <GrStatusGood size={80} />
                        </InputGroup.Button>
                    </div>
            </div>
            </div> */
        }
    </div>
  );
}

export default CameraComponent;