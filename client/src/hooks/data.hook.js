import { useState, useEffect } from 'react'

import axios from 'axios'

export const useData = () => { 

    //const [endpoint, setEndpoint] = useState('')
    const [record, setRecord] = useState({})
    const [records, setRecords] = useState([])
    const [drivers, setDrivers] = useState([])
    const [groutes, setRoutes] = useState([])
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

    return { record, records, drivers, groutes, isNew, loading, getAllRecords, getDrivers, getRoutes, setRecord, setRecords, setIsNew, setIsReady, upsertRecord, deleteRecord, cloneRecord }

}