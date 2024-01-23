import axios from 'axios';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Grid from '@mui/material/Grid';
import { React, useState, useRef, useCallback } from 'react';

const containerStyle = {
  width: '100%',
  height: '95vh'
};

const App = () => {
  const [center, setCenter] = useState({ lat: 31.9076, lng: 131.4202 }); // 中心位置 
  const [locationData, setLocationData] = useState([]); // 周辺情報
  const [isLoading, setIsLoading] = useState(false);// ローディング中かどうか
  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const params = {
    "location": `${center.lat} ${center.lng}`,
    "radius": 3000,// 半径3km
    "keywords": "レストラン",
  };

  // 位置、半径、キーワードから周辺情報を検索する 
  const getLocationInfo = async (params) => {
    // 検索前に位置情報を初期化する
    setLocationData([]);
    setIsLoading(true);
    axios.post(`http://${process.env.REACT_APP_BACKEND_IP}:8000/search_nearby_places`, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      const results = Array.from(response.data);
      const locationList = results.map(result => [result.geometry.location, result.name]);
      setLocationData(locationList);
    }).finally(() => {
      setIsLoading(false);
    });
  }

  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="App">
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          onLoad={onMapLoad}
          onDragEnd={() => {
            const newCenter = mapRef.current.getCenter();
            setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
            console.log(center);
          }}
        >
          {locationData.map((location, index) => (
            <Marker key={index} position={location[0]} onClick={() => {
              setSelectedLocation(location);
            }} />
          ))}

          {selectedLocation && (
            <InfoWindow
              position={selectedLocation[0]}
              onCloseClick={() => {
                setSelectedLocation(null);
              }}
            >
              <div>
                <p>{selectedLocation[1]}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Button variant="contained" color="primary" sx={{ mx: 'auto', width: 200 }} onClick={() => getLocationInfo(params)}>
          SEARCH
        </Button>
      </Grid>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default App;