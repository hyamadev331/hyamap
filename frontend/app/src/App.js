import axios from 'axios';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
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
      const locationList = results.map(result => [result.geometry.location, result.name, result.rating, result.user_ratings_total]);
      setLocationData(locationList);
    }).finally(() => {
      setIsLoading(false);
    });
  }

  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="App">
      <Grid container spacing={2} style={{ backgroundColor: '#cfe8fc', color: '#0d47a1', paddingRight: '20px' }}>
        <Grid item xs={9} spacing={2}>
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
        </Grid>
        <Grid item xs={3} spacing={2} style={{ paddingTop: '30px' }}>
          <Grid item spacing={2}>
            <Paper sx={{ height: '40vh', overflow: 'auto' }}>
              {locationData.map((location, index) => (
                <div key={index}>
                  <p onClick={() => setSelectedLocation(location)}>{index + 1}位 {location[1]}</p>
                </div>
              ))}
            </Paper>
          </Grid>
          <Grid item spacing={2}>
            <Paper sx={{ height: '40vh' }}>
              <div>
                <h2>お店の情報</h2>
                {selectedLocation && (
                  <div>
                    <p>店名: {selectedLocation[1]}</p>
                    <p>評価: {selectedLocation[2]}</p>
                    <p>レビュー数: {selectedLocation[3]}</p>
                  </div>
                )}
              </div>
            </Paper>
          </Grid>
        </Grid>
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
      </Grid>
    </div >
  );
}

export default App;