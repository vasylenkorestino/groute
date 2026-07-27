import { useState, useEffect } from 'react'

import axios from 'axios'

export const useData = () => { 

    //const [endpoint, setEndpoint] = useState('')
    const [record, setRecord] = useState({})
    const [records, setRecords] = useState([])
    const [drivers, setDrivers] = useState([])
    const [groutes, setRoutes] = useState([])
    const [googleRouteOptions, setGoogleRouteOptions] = useState([])
    const [isNew, setIsNew] = useState(false)
    const [loading, setIsReady] = useState(false)
    //const [filter, setFilter] = useState({})

    const getUpdatedRecords = (record) => { return records.map(element => { return element._id === record._id ? record : element }) }

    const getRecordsWithoutDeletedElement = (_id) => { return records.filter( element => { return element._id != _id }) }

    const getAllRecords = (endpoint, filter) => { 
        return new Promise( async (resolve, reject) => {
            setIsReady(false)
            console.log('endpoint : ', endpoint)
            console.log('filter : ', filter)
            const response = await fetch( endpoint + '/records?'  + new URLSearchParams(filter));

            const data = await response.json();

            console.log('response getAllRecords : ', data)

            resolve(data)

            setRecords(data.records)
            setIsReady(true)
        })
    }

    const getDrivers = async () => {
        const response = await fetch('api/salesforce/drivers/records');
        const data = await response.json();
        console.log('response getDrivers : ', data)
        setDrivers(data.drivers)
    }

    const getRoutes = (filter) => {
        return new Promise( async (resolve, reject) => {
            console.log('filter : ', filter)
            const response = await fetch('api/salesforce/routes/records?'  + new URLSearchParams(filter));
            const data = await response.json();
            console.log('response getRoutes : ', data)

            setRoutes(data.records)
            setGoogleRouteOptions(data.googleRoutes || [])
            setIsReady(true)
            resolve(data.records)
        })
    }

    const upsertRecord = (endpoint, form) => {
        return new Promise( async (resolve, reject) => {
            setIsReady(false)
            await axios.post( endpoint + '/upsert', { ...form }, { 'Content-Type': 'application/json' })
            .then(response => { 
                isNew ? setRecords([...records, response.data.record]) : setRecords(getUpdatedRecords(response.data.record))
                resolve(response)
                setIsReady(true)
            })
            .catch(error => {
                console.log('errors =>> ', error)
                setIsReady(true)
                reject(error.response.data.message)
            })
        })
    }

    const deleteRecord = (endpoint, _id) => {
        return new Promise( async (resolve, reject) => {
            setIsReady(false)
            console.log('form : ', _id)

            await axios.post( endpoint + '/delete', { _id }, { 'Content-Type': 'application/json' })
            .then(response => {
                if(response.status === 200){ setRecords(getRecordsWithoutDeletedElement(_id)) }
                resolve(response)
                setIsReady(true)
            }).catch(error => {
                console.log('errors =>> ', error)
                reject(error)
            })
        })
    }

    const cloneRecord = (endpoint, _id) => {
        return new Promise( async (resolve, reject) => {
            setIsReady(false)
            console.log('form : ', _id)

            await axios.post( endpoint + '/clone', { _id }, { 'Content-Type': 'application/json' })
            .then(response => {
                if(response.status === 201){ setRecords([...records, response.data.record]) }
                resolve(response)
                setIsReady(true)
            }).catch(error => {
                console.log('errors =>> ', error)
                reject(error)
            })
        })
    }

    // Uploads a photo; rejects on HTTP errors or a 200 body that still contains error.
    const uploadPhoto = (endpoint, data) => {
        return new Promise( async (resolve, reject) => {
            setIsReady(false)
            console.log('form : ', data)

            await axios.post( endpoint + '/uploadFile', data, { 'Content-Type': 'application/json' })
            .then(response => {
                if (response?.data?.error) {
                    reject(response.data.error)
                    setIsReady(true)
                    return
                }
                resolve(response)
                setIsReady(true)
            }).catch(error => {
                console.log('errors =>> ', error)
                reject(error)
            })
        })
    }

    const notifyAdmin = async (endpoint, route) => {
        return new Promise( async (resolve, reject) => {
            await axios.post( endpoint + '/notify', route, { 'Content-Type': 'application/json' })
            .then(response => {
                resolve(response)
                setIsReady(true)
            }).catch(error => {
                console.log('errors =>> ', error)
                reject(error)
            })
        })
    }

    const getFiles = (filter) => {
        return new Promise( async (resolve, reject) => {
            console.log('filter : ', filter)
            const response = await fetch('api/salesforce/account/files?'  + new URLSearchParams(filter));
            const data = await response.json();
            console.log('response getFiles : ', data)
            setIsReady(true)
            resolve(data.files)
        })
    }


    return { record, records, drivers, groutes, googleRouteOptions, isNew, loading, getAllRecords, getDrivers, getRoutes, setRecord, setRecords, setIsNew, setIsReady, upsertRecord, deleteRecord, cloneRecord, uploadPhoto, notifyAdmin, getFiles }

}