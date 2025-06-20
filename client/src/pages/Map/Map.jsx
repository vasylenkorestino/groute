import React, { useEffect, useState, useContext, useRef } from 'react';
import GoogleMapReact from 'google-map-react';

import locationIcon from '../../img/locationIcon.png'
import serviceLocationIcon from '../../img/serviceLocationIcon.png'
import fullPointIcon from '../../img/orangeIcon.png'
import greenPointIcon from '../../img/greenPoint.png'
import { DataContext } from '../../contexts/DataContext';



const Map = ({ origin, destination }) => {

    const GOOGLE_MAPS_APIKEY = 'AIzaSyBzMCy3yqeHZ_zRvgTMyghoAGAEBYRo-b0'

    const mapRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);

    const { groutes } = useContext(DataContext)

    const [waypoints, setWaypoints] = useState([])
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        console.log('WAYPOINTS UPDATED!')
        if(groutes?.length){
            
            let waypoints = []
            groutes.forEach(p => {
                waypoints.push({ point: p, location: { lat: p.Latitude__c, lng: p.Longitude__c } })
            })
            console.log('waypoints: ', waypoints)
            setWaypoints(waypoints)
            
            setIsValid(false)
            setInterval(() => {
                setIsValid(true)
            }, 300)
        } else {
            setIsValid(false)
        }

    }, [ groutes ])

    const handleApiLoaded = (map, maps) => {

        mapRef.current = map;
        directionsServiceRef.current = new maps.DirectionsService();
        directionsRendererRef.current = new maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true
        })
        directionsRendererRef.current.setMap(map);

        if(!Object.prototype.hasOwnProperty.call(Array.prototype, 'chunk_array')) {
            Object.defineProperty(Array.prototype, 'chunk_array', {
                value: function(chunkSize) {
                var array = this;
                return [].concat.apply([],
                    array.map(function(elem, i) {
                    return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
                    })
                );
                }
            });
        }

        calculateRoute(map, maps);
    };

    const calculateRoute = (map, maps) => {

        if (!directionsServiceRef.current || !directionsRendererRef.current) {
            return;
        }

        console.log('waypoints length: ', waypoints.length)

        // Set Origin Marker

        let locationName = origin?.name
        delete origin.name

        let originMarker = new maps.Marker({
            position: origin,
            map,
            icon: {
                url: serviceLocationIcon,
                scaledSize: new maps.Size(45, 45)
            }
        })

        let originMarkerLocationNameInfoWindow = new maps.InfoWindow()

        originMarker.addListener('click', () => {
            console.log("Click");
            originMarkerLocationNameInfoWindow.setContent(
                '<p style="color: black;">Service Location: ' + locationName + '</p>'
            );
            originMarkerLocationNameInfoWindow.open(map, originMarker);
        })

        // Set Destination Marker

        let destinationName = destination?.name

        delete  destination.name

        let destinationMarker = new maps.Marker({
            position: destination,
            map,
            icon: {
                url: serviceLocationIcon,
                scaledSize: new maps.Size(45, 45)
            }
        })

        let destinationMarkerLocationNameInfoWindow = new maps.InfoWindow()

        destinationMarker.addListener('click', () => {
            console.log("Click");
            destinationMarkerLocationNameInfoWindow.setContent(
                '<p style="color: black;">Service Location: ' + destinationName + '</p>'
            );
            destinationMarkerLocationNameInfoWindow.open(map, originMarker);
        })

        // Set Waypoints Markers

        console.log('BEFORE')
        waypoints.forEach(w => {

            let icon

            console.log('w?.point?.isFull__c : ', w?.point)
            console.log('w?.point?.isFull__c : ', w?.point?.Account_Name__c)
            console.log('w?.point?.isFull : ', w?.point?.isFull)
            
            icon = w?.point?.isDone ? greenPointIcon : ( w?.point?.isFull ? fullPointIcon : locationIcon )

            let marker = new maps.Marker({
                position: w.location,
                map,
                icon: {
                    url: icon,
                    scaledSize: new maps.Size(w?.point?.isDone ? 25 : 35, 35)
                }
            });
    
            let infoWindow = new maps.InfoWindow();

            let accountName = w?.point?.Account_Name__c
            let containerAddress = w?.point?.Container_Address__c
            let contactName = w?.point?.Account__r?.Primary_Contact__r?.Name
            let contactPhone = w?.point?.Account__r?.Primary_Contact__r?.Phone
    
            marker.addListener('click', () => {
                console.log("Click");
                infoWindow.setContent(
                    '<p style="color: black;">Account Name: ' + accountName + '</p>' + 
                    '<p style="color: black;">Address: ' + containerAddress +  '</p>' +
                    '<p style="color: black;">Contact Name: ' + contactName +  '</p>' +
                    '<p style="color: black;">Contact Phone: ' + contactPhone +  '</p>'
                );
                infoWindow.open(map, marker);
            })

            delete w.point
        })

        if(waypoints.length > 25){

            let parts = waypoints.chunk_array(25)

            console.log('parts: ',parts)
            let results = []

            let fullPath = [];
            let promises = [];

            let updated_origin = undefined
            parts.forEach(part => {
                console.log('updated_origin: ', updated_origin)

                let currentOrigin = updated_origin ? updated_origin : origin
                let currentDestination = part.length == 25 ? part[part.length - 1].location : destination
                
                const request = {
                    origin: currentOrigin,
                    destination: currentDestination,
                    waypoints: part,
                    travelMode: 'DRIVING', // or 'WALKING', 'BICYCLING', 'TRANSIT'
                };

                updated_origin = part[part.length - 1].location

                const promise = new Promise((resolve, reject) => {
                    directionsServiceRef.current.route(request, (result, status) => {
                        if (status === 'OK') {
                            let segmentPath = result.routes[0].overview_path;
                            fullPath = fullPath.concat(segmentPath);
                            resolve();
                        } else {
                            reject(`error fetching directions ${status}`);
                        }
                    });
                });

                promises.push(promise);
        
                /*directionsServiceRef.current.route(request, (result, status) => {
                if (status === 'OK') {
                    directionsRendererRef.current.setDirections(result);
                    results.push(result)
                } else {
                    console.error(`error fetching directions ${result}`);
                }
                });*/
            })

            Promise.all(promises)
            .then(() => {

                const lineSymbol = {
                    path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 2.5,
                    strokeColor: '#4285F4'
                };
                new maps.Polyline({
                    path: fullPath,
                    geodesic: true,
                    strokeColor: '#4285F4', //'#FF8C00', //'#4285F4',
                    strokeOpacity: 0.9,
                    strokeWeight: 4,
                    icons: [{
                        icon: lineSymbol,
                        offset: '100%',
                        repeat: '50px'
                    }],
                    map: mapRef.current
                });


                const bounds = new maps.LatLngBounds();

                fullPath.forEach(point => bounds.extend(point));

                mapRef.current.fitBounds(bounds, {
                    top: 50, bottom: 0, left: 0, right: 0 // Зміщення вгору
                });

            })
            .catch((error) => {
                console.error(error);
            });

        } else {
            const request = {
                origin,
                destination,
                waypoints,
                travelMode: 'DRIVING', // or 'WALKING', 'BICYCLING', 'TRANSIT'
            };

            let fullPath = []
    
            directionsServiceRef.current.route(request, (result, status) => {
            if (status === 'OK') {
                let segmentPath = result.routes[0].overview_path;
                fullPath = fullPath.concat(segmentPath);
                //directionsRendererRef.current.setDirections(result);

                const lineSymbol = {
                    path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 2.5,
                    strokeColor: '#4285F4'
                };
                new maps.Polyline({
                    path: fullPath,
                    geodesic: true,
                    strokeColor: '#4285F4', //'#FF8C00', //'#4285F4',
                    strokeOpacity: 0.9,
                    strokeWeight: 4,
                    icons: [{
                        icon: lineSymbol,
                        offset: '100%',
                        repeat: '50px'
                    }],
                    map: mapRef.current
                });
                
                const bounds = new maps.LatLngBounds();

                fullPath.forEach(point => bounds.extend(point));

                mapRef.current.fitBounds(bounds, {
                    top: 50, bottom: 0, left: 0, right: 0 // Зміщення вгору
                });

            } else {
                console.error(`error fetching directions ${result}`);
            }
            });
        }
    }

    return (
        <div style={{ height: '75vh', width: '100%' }}>
            {
                isValid
                ?
                <GoogleMapReact
                    bootstrapURLKeys={{ key: GOOGLE_MAPS_APIKEY }}
                    defaultCenter={origin}
                    defaultZoom={13}
                    zoom={20}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                />
                :
                <></>
            }
            
        </div>
    );
}

export default Map;
