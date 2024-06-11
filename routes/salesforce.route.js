const { Router } = require('express')
const router = Router()

const { getRecords, getRoutes, updateRoute, getDrivers, uploadContentVersion, notifySalesforceAdmin, getFiles } = require('../utils/salesforce.utils') 

router.get('/routes/records', (req, res) => {

    console.log('req.query : ', req.query)

    let { dateOfService, driverName } = req.query

    console.log('dateOfService1 : ', dateOfService)
    console.log('driverName : ', driverName)

    if(dateOfService){
        dateOfService = new Date(dateOfService).toISOString().split("T")[0] 
    }

    console.log('dateOfService2 : ', dateOfService)

    getRoutes(driverName, dateOfService).then(routes => {
        //console.log('routes : ', routes)

        let googleRoutes = [];
        routes.forEach(route => {
            route['link'] = 'http://maps.apple.com/?daddr=' + route.Latitude__c + ',' + route.Longitude__c + '&dirflg=d&t=s';
            
            let style = route.Status__c == 'New' ? 'bg-empty' : ( route.Inactive__c ? 'bg-unserviced' : 'bg-serviced')

            route['style'] = style;
            googleRoutes.push(route);

        })

        res.json({ records : googleRoutes })
    })
})

router.post('/routes/upsert', (req, res) => {
    console.log('req.body upsert routes: ', req.body)
    updateRoute(req.body)
    .then(response => res.status(201).json({ record: response, message: 'The record has been created successfully!' }))
    .catch(error => res.json({ error: error }))
})

router.get('/drivers/records', (req, res) => {
    getDrivers()
    .then(drivers => res.json({ drivers: drivers }))
    .catch(error => res.json({ error: error }))
})

router.post('/routes/uploadFile', (req, res) => {
    console.log('req.body upsert routes: ', req.body)
    uploadContentVersion(req.body)
    .then(response => res.status(201).json({ record: response, message: 'The record has been created successfully!' }))
    .catch(error => res.json({ error: error }))
})

router.post('/routes/notify', (req, res) => {
    console.log('req.body notify routes: ', req.body)
    notifySalesforceAdmin(req.body)
    .then(response => res.status(201).json({ message: 'Notification has been sent!' }))
    .catch(error => res.json({ error: error }))
})

router.get('/account/files', (req, res) => {

    let { accountId } = req.query
    console.log('accountId : ', accountId)

    getFiles(accountId).then(files => {
        res.json({ files : files })
    }).catch(error => {
        console.log('error : ', error)
    })
})

module.exports = router