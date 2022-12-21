const jsforce = require('jsforce');
const conn = new jsforce.Connection({
    loginUrl : 'https://test.salesforce.com'
})

const creds = {
    login : '3rd.orest@gmail.com.partia1',
    password : 'Myrooom2020!'
}

const getDrivers = () => {
    return getRecords('SELECT Id, Name FROM Driver__c')
}

const getRoutes = (driverName, dateOfService) => {
    return new Promise((resolve, reject) => {

        let driverNamePart = driverName ? `AND Driver_Name__c = '${driverName}' ` : '';
        let dateOfServicePart = dateOfService ? `AND DateOfService__c = ${dateOfService} ` : ''

        console.log('dateOfServicePart : ', dateOfServicePart)

        let query = "SELECT Id, RecordType.Name, AccountId__c, Account_Name__c, Container_Address__c, DateOfService__c, Distance_From_Start__c, Driver_Name__c, " +  
                    "Inactive__c, Gallons_Collected__c, Notes__c, Notes2__c, Driver_Notes__c, Service_Completed__c, Map_source__c, LastModifiedDate, Latitude__c, Longitude__c, " + 
                    "Google_Route_Id__c, Name, Status__c, Priority__c, Container_Size__c, Rebate__c " +
                    "FROM Route__c " + 
                    "WHERE Google_Route_Id__c!= null " +
                    "AND AccountId__c != null " +
                    driverNamePart + 
                    dateOfServicePart +
                "ORDER BY Google_Route_Id__c, Priority__c " +
                "LIMIT 50000"

        getRecords(query).then(routes => {
            let googleRouteId = routes[0]?.Google_Route_Id__c;
            console.log('googleRouteId : ', googleRouteId)
            if(googleRouteId){
                let query = `SELECT Accounts__c FROM Google_Route__c WHERE Id = '${ googleRouteId }'`
                getRecords(query).then(accounts => {
                    let sortedRoutes = sortRoutes(accounts, routes)
                    resolve(sortedRoutes)
                })
            } else {
                resolve(routes)
            }
            
        })
    })
}

const sortRoutes = (accounts, routes) => {
    let counter = 1;

    accounts.forEach(account => {
        routes.forEach(route => {
            if(account == route.AccountId__c){ route['priority'] = counter }
        })
        counter = counter + 1;
    });

    routes.sort((a, b) => {
        if (a.priority > b.priority) { return 1 }
        if (a.priority < b.priority) { return -1 }
        return 0;
    });

    return routes;
}

const updateRoute = (data) => {
    console.log('data: ', data);
    return new Promise((resolve,reject) => {
        conn.login(creds.login, creds.password, function(err, res) {
            if (err) { 
                console.error(err); 
                reject(err);
            }

            conn.sobject("Route__c").update({ 
                Id : data.Id,
                Notes2__c : data.Notes2__c,
                Driver_Notes__c : data.Driver_Notes__c,
                Gallons_Collected__c : data.Gallons_Collected__c,
                Status__c : '',
                Inactive__c : data.Inactive__c
              }, (err, response) => {
                if (err || !response.success) { 
                    console.error(err, response); 
                    reject(err);
                }

                resolve(response);
              });
        });
    })
}

const getRecords = (query) => {
    return new Promise((resolve, reject) => {
        conn.login(creds.login, creds.password, function(error, response) {
            let records = []
            console.log('response : getRecords : ', response)
    
            if (error) { return console.error(error); }
            conn.query(query)
            .on("record", record => records.push(record))
            .on("end", () => resolve(records))
            .on("error", error => reject(error))
            .run({ autoFetch : true, maxFetch : 4000 });
        });
    })
}

const uploadContentVersion = ({ fileName, fileBase64, sourceId }) => {
    console.log('fileName: ', fileName);
    console.log('sourceId : ', sourceId)
    //console.log('file: ', fileBase64);
    //console.log('file2 : ', fileBase64.toString('base64'))
    console.log('work : ')
    return new Promise((resolve,reject) => {
        conn.login(creds.login, creds.password, function(err, res) {
            if (err) { 
                console.error(err); 
                reject(err);
            }
            console.log('work 1: ')
            let data = fileBase64.toString('base64');
            data = data.split(',')[1]
            conn.sobject('ContentVersion').create({
                PathOnClient : fileName,
                VersionData : data
              }, (err, response) => {
                if (err || !response.success) { 
                    console.error(err, response); 
                    reject(err);
                }
                console.log('work 2: ')
                conn.sobject("ContentVersion").retrieve(response.id, function(err, cv) {
                    if (err) { 
                      reject(err)
                      return console.error('err ->> ', err); 
                    }
          
                    conn.sobject('ContentDocumentLink').create({
                      ContentDocumentId: cv.ContentDocumentId,
                      LinkedEntityId: sourceId,
                      Visibility: "AllUsers"
                    }, function(err2, cdl){
                      if (err2) { 
                        reject(err2)
                        return console.error('err222 => ', JSON.stringify(err2) + 'test');
                       }
                      resolve(cdl);
                    })
                  })
              });
        });
    })
}

module.exports = { getRecords, getRoutes, updateRoute, getDrivers, uploadContentVersion }