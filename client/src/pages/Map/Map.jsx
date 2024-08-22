import React, { useRef } from 'react';
import GoogleMapReact from 'google-map-react';

const Map = ({ origin, destination, waypoints }) => {

    const GOOGLE_MAPS_APIKEY = 'AIzaSyBzMCy3yqeHZ_zRvgTMyghoAGAEBYRo-b0'

    const mapRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);

    const handleApiLoaded = (map, maps) => {

        mapRef.current = map;
        directionsServiceRef.current = new maps.DirectionsService();
        directionsRendererRef.current = new maps.DirectionsRenderer();
        directionsRendererRef.current.setMap(map);

        calculateRoute();
    };

    const calculateRoute = () => {
        if (!directionsServiceRef.current || !directionsRendererRef.current) {
            return;
        }

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
