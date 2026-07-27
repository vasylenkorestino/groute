import React, { useEffect, useState, useContext } from 'react';

import heic2any from 'heic2any';

import { DataContext } from '../../contexts/DataContext'

import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Carousel, Radio, RadioGroup } from 'rsuite';

import { ThreeDots } from  'react-loader-spinner'

import { SelectPicker, Input, Toggle, InputGroup, } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

import { BsFillEyeSlashFill, BsFillCameraFill } from 'react-icons/bs';
import FileUploadIcon from '@rsuite/icons/FileUpload';
import { FaRegEye } from 'react-icons/fa';

import ModalWindow from '../Modal/Modal'
import Camera from '../Camera/Camera'

import './Form.css'

const InputForm = ({ endpoint, columns, close, title, mode, hasImages }) => {

    const { isNew, record, loading, upsertRecord, uploadPhoto, getFiles } = useContext(DataContext)

    const [form, setForm] = useState({})

    const [imageLoading, setImageLoading] = useState(true)
    const [images, setImages] = useState([])

    useEffect(() => { 
        console.log('record : ', record)
        record && getRelatedFiles(record)
        setForm({ ...record })
        if(record.hasOwnProperty('password') && !isNew){
            setRecordWithoutPasswordKey()
        }
    },[ record ])

    const getRelatedFiles = (route) => {
        
        route.Account__c && getFiles({ accountId: route.Account__c }).then(files => {
            console.log('getFiles response : ', files)
                
            let base64files = []
            files && files.forEach(f => {
                let file = f[0]
                let base64_response = `data:image/jpeg;base64,${file}`
                base64files.push(base64_response)
            })
            console.log('base64files ; ',base64files)
            setImages(base64files)
            setImageLoading(false)
        }).catch(error => {
            console.log('ERROR GET RELATED FILES ')
        })
    }

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

    // Saves route fields, then awaits photo uploads before closing the modal.
    const handleUpsert = async () => {
        if(form.hasOwnProperty('password') && form?.password == ''){
            setRecordWithoutPasswordKey();
        }

        try {
            const response = await upsertRecord(endpoint, form)
            if (response.status !== 201) {
                toast.error('Something went wrong')
                return
            }
            toast.success(response.data.message)

            if (imageUrls.length) {
                const sourceId = record.Account__c || record.AccountId__c
                const results = await Promise.allSettled(
                    imageUrls.map(imageUrl =>
                        uploadPhoto(endpoint, {
                            fileName: record.Account_Name__c + '.jpeg',
                            fileBase64: imageUrl,
                            sourceId
                        })
                    )
                )
                const failed = results.filter(r => r.status === 'rejected')
                if (failed.length) {
                    console.error('photo upload errors : ', failed)
                    toast.error(`${failed.length} photo(s) failed to upload`)
                    return
                }
                toast.success('Photo(s) uploaded successfully')
            }
            close()
        } catch (error) {
            console.error('error : ', error)
            toast.error(error?.message || 'Something went wrong')
        }
    }

    const [changePassword, setChangePassword] = useState(false);
    const handleChangePassword = () => {
        setChangePassword(!changePassword)
        if(form.hasOwnProperty('password')){
            setRecordWithoutPasswordKey();  
        } else {
            setForm({ ...form, password : '' }) 
        }
        console.log('handleChangePassword form : ', form)
    }
    const [visible, setVisible] = useState(false);
    const handleChangePasswordView = () => setVisible(!visible)

    const getPasswordInput = (column) => {
        return (
            <>
            { 
                changePassword || isNew
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
    const [imageUrls, setImageUrls] = useState([]);
    const handleChangeCameraView = () => setShowCamera(!showCamera)

    const handleSetImageUrl = (url) => {
        setImageUrls([...imageUrls, url])
    }

    const handleRemoveImage = (url) => {
        console.log('event;  ', url)
        setImageUrls(imageUrls.filter(imageUrl => ( imageUrl != url )))
    }

    const [fileMode, setFileMode] = useState('Upload');

    const handleChangeFileMode = (event) => {
        console.log('event : ', event)
        setFileMode(event)
    }

    const openFileDialog = () => {
        console.log('openFileDialog : ')
        document.getElementById('fileInput').click();
    }

    // Detects HEIC/HEIF by MIME or file extension (case-insensitive).
    const isHeicOrHeif = (file) => {
        const type = (file.type || '').toLowerCase()
        const name = (file.name || '').toLowerCase()
        return type === 'image/heic' || type === 'image/heif'
            || name.endsWith('.heic') || name.endsWith('.heif')
    }

    // Converts HEIC/HEIF when needed, then always compresses to JPEG for Salesforce upload.
    const normalizeImageFile = async (file) => {
        let normalized = file
        if (isHeicOrHeif(file)) {
            const converted = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            })
            const blob = Array.isArray(converted) ? converted[0] : converted
            const baseName = file.name.replace(/\.(heic|heif)$/i, '') || 'photo'
            normalized = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
        }
        return compressImageToBase64(normalized, 1200, 0.6)
    }

    const handleUploadFile = async (event) => {
        console.log('handleUploadFile : ')
        const input = event.target
        let file = input.files[0]
        if (!file) return

        const mime = (file.type || '').toLowerCase()
        const isImage = mime.startsWith('image/') || isHeicOrHeif(file)
        if (!isImage) {
            toast.error('Please select an image file')
            input.value = ''
            return
        }

        try {
            const compressedBase64 = await normalizeImageFile(file)
            console.log('compressedBase64:', compressedBase64)
            setImageUrls(prev => [...prev, compressedBase64])
        } catch (error) {
            console.error('error normalizeImageFile : ', error)
            toast.error('Failed to process photo. Please try again.')
        } finally {
            input.value = ''
        }
    }

    // Compresses a File to a JPEG data URL (scaled to maxWidth).
    const compressImageToBase64 = async (file, maxWidth = 1280, quality = 0.7) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // keep aspect ratio, downscale if too large
                const scale = Math.min(1, maxWidth / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // get compressed base64 (here we force JPEG)
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);              // "data:image/jpeg;base64,...."
            };
            img.onerror = reject;
            img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file); // read original file
        });
    }

    const getCameraInput = (column) => {
        return (
            <>
                <div className="d-flex">
                    { imageUrls.length ? imageUrls.map(url => ( 
                    
                    <div className="thumbnail m-1" key={url}>
                        <div className="d-flex justify-content-center align-items-center">
                            <InputGroup.Button onClick={ () => handleRemoveImage(url)}>X</InputGroup.Button>
                        </div>
                        <img style={{ width: 100, height: 100 }} src={url} alt="routeImage"/> 
                    </div>
                    
                    )) : <></> } 

                    <div className="d-flex align-items-center m-1">
                        <RadioGroup name="radio-group" defaultValue="Upload" onChange={handleChangeFileMode}>
                            <Radio value="Upload">Upload <FileUploadIcon style={{ width: 20, height: 20 }} /></Radio>
                            <Radio value="Camera">Camera <BsFillCameraFill style={{ width: 20, height: 20 }} /></Radio>
                        </RadioGroup>

                        <div style={{ marginLeft: 20 }}>
                        {
                            fileMode == 'Upload'
                            ?
                            <InputGroup.Button onClick={openFileDialog}>
                                <FileUploadIcon style={{ width: 50, height: 50 }} />
                                <input
                                    type="file"
                                    id="fileInput"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleUploadFile}
                                />
                            </InputGroup.Button>
                            :
                            <InputGroup.Button onClick={handleChangeCameraView}>
                                <BsFillCameraFill style={{ width: 50, height: 50 }} />
                            </InputGroup.Button>
                        }
                        </div>
                        <ModalWindow show={ showCamera } close={ () => handleChangeCameraView() } context={ <Camera setImageUrl={ handleSetImageUrl } closeCamera={ handleChangeCameraView } /> }/>
                    </div>
                </div>
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

                {
                    hasImages 
                    ? 
                        imageLoading
                        ?
                        <div style={{ height: 300 }} className='d-flex w-100 justify-content-center align-items-center'>
                            <ThreeDots color="#00BFFF" height={80} width={80} />
                        </div>
                        :
                        <div class="mb-3">
                            <h6 class="d-flex justify-content-start" style={{ marginBottom: 10 }}>Driver Photos</h6>
                            { images && images.length ?
                            <Carousel className="custom-slider">
                                { images && images.map(url => (
                                    <img src={url}  height="250" />
                                ))}
                            </Carousel>
                            : <></>
                            }
                        </div>
                    : 
                    <></>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" type="submit" onClick={ handleUpsert } size="lg">Save</Button>
            </Modal.Footer>
        </>
    );
}

export default InputForm;
