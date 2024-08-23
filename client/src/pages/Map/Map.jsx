import React, { useRef } from 'react';
import GoogleMapReact from 'google-map-react';

import locationIcon from '../../img/locationIcon.png'

const Map = ({ origin, destination, waypoints }) => {

    const GOOGLE_MAPS_APIKEY = 'AIzaSyBzMCy3yqeHZ_zRvgTMyghoAGAEBYRo-b0'

    const mapRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);

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

        console.log('BEFORE')
        waypoints.forEach(w => {
            let marker = new maps.Marker({
                position: w.location,
                map,
                icon: {
                    url: locationIcon,
                    scaledSize: new maps.Size(35, 35)
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
        
                directionsServiceRef.current.route(request, (result, status) => {
                if (status === 'OK') {
                    directionsRendererRef.current.setDirections(result);
                    results.push(result)
                } else {
                    console.error(`error fetching directions ${result}`);
                }
                });
            })

        } else {
            const request = {
                origin,
                destination,
                waypoints,
                travelMode: 'DRIVING', // or 'WALKING', 'BICYCLING', 'TRANSIT'
            };
    
            directionsServiceRef.current.route(request, (result, status) => {
            if (status === 'OK') {
                directionsRendererRef.current.setDirections(result);
            } else {
                console.error(`error fetching directions ${result}`);
            }
            });
        }
    };


    return (
        <div style={{ height: '75vh', width: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: GOOGLE_MAPS_APIKEY }}
                defaultCenter={origin}
                defaultZoom={13}
                zoom={20}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
            />
        </div>
    );
}

export default Map;
