const jsforce = require('jsforce');

const fetch = require('fetch-base64');

const conn = new jsforce.Connection({
    loginUrl : process.env.SF_URL
})

const creds = {
    login : process.env.SF_USERNAME,
    password : process.env.SF_PASSWORD
}

const getDrivers = () => {
    return getRecords('SELECT Id, Name FROM Driver__c')
}

const getRoutes = (driverName, dateOfService) => {
    return new Promise((resolve, reject) => {

        let driverNamePart = driverName ? `AND Driver_Name__c = '${driverName}' ` : '';
        let dateOfServicePart = dateOfService ? `AND DateOfService__c = ${dateOfService} ` : ''

        //console.log('dateOfServicePart : ', dateOfServicePart)

        let query = "SELECT Id, RecordType.Name, ServiceType__c, ServiceSubType__c, Account__c, Account__r.Notes__c, AccountId__c, Account_Name__c, Container_Address__c, DateOfService__c, Distance_From_Start__c, Driver_Name__c, " +  
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
            //console.log('googleRouteId : ', googleRouteId)
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
                SerialNumber__c: data.SerialNumber__c,
                SecondSerialNumber__c: data.SecondSerialNumber__c,
                LastActivityDate__c: new Date().toISOString(),
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


const notifySalesforceAdmin = (route) => {

    let message = route?.Driver_Name__c + ' completed ' + route?.Name
    let googleRouteId = route?.Google_Route_Id__c 

    let request = {
        url: process.env.SF_NOTIFICATION_URL,
        method: 'POST',
        body: JSON.stringify( {
            "props": {
                "routeId": googleRouteId,
                "message": message
            }
        }),
        headers : {
                "Accept":"application/json",
                "Content-Type" : "application/json"
            }
      };

      console.log('request : ', request)

    return new Promise((resolve,reject) => {
        conn.request(request, function(err, resp) {
            if(err){ 
                console.log(err)
                reject(err)
            }
            console.log(resp);
            resolve(resp)
        });
    })
}


const getFiles = (accountId) => {
    return new Promise( (resolve, reject) => {

        let versionIds = []

        conn.login(creds.login, creds.password, async (error, response) => {
            console.log('response : ', response)

            let accounts = await getRecords("SELECT Id, Name FROM Account WHERE Id = '" + accountId + "'")
            console.log('accounts : ', accounts)
            let account = accounts?.length ? accounts[0] : undefined

            console.log('account : ', account)

            let accountName = account?.Name

            if(accountName.includes("'")){
                accountName = accountName.replace(/'/g, "\\'")
            }
            console.log('after accountName : ', accountName)

            let links = await getRecords("SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE ContentDocument.Title = '" + accountName + "' AND LinkedEntityId = '" + accountId + "'")
            
            let documentIds = ''
            let count = 0
            links && links.forEach(l => {
                count++;
                if(links.length == count){
                    documentIds += "'" + l.ContentDocumentId + "'";
                } else {
                    documentIds += "'" + l.ContentDocumentId + "',";
                }
                console.log('l', l)
            })
            console.log('documentIds : ', documentIds)
            if(documentIds == ''){ 
                resolve([])
                return; 
            }

            let versions = await getRecords("SELECT Id, ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN (" + documentIds + ") ORDER BY CreatedDate DESC")
            
            console.log('versions : ', versions)
            versions && versions.forEach(v => {
                versionIds.push(v.Id)
                console.log('a', v)
            })

            let instanceUrl = 'https://gstarbio.my.salesforce.com/'
            
            let promises = []
            versionIds.forEach(async (versionId) => {
                console.log('versionId : ', versionId)

                promises.push(fetch.remote({ 
                    url: instanceUrl + '/services/data/v42.0/sobjects/ContentVersion/' + versionId + '/VersionData', 
                    headers: { 
                    'Authorization': 'Bearer ' + conn.accessToken 
                    } 
                }))
            })

            Promise.all(promises).then((values) => {
                results = values
                console.log(results)
                resolve(results)
            });
            
        })
    })
}

module.exports = { getRecords, getRoutes, updateRoute, getDrivers, uploadContentVersion, notifySalesforceAdmin, getFiles }