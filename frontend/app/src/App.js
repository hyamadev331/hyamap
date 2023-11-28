import axios from 'axios';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Grid from '@mui/material/Grid';
import { React, useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '95vh'
};

//初期位置
const center = {
  lat: 31.9076,
  lng: 131.4202
};

const App = () => {
  const [locationData, setLocationData] = useState([]); // 周辺情報
  const [isLoading, setIsLoading] = useState(false);// ローディング中かどうか

  const params = {
    "location": "31.9076 131.4202",
    "radius": 10000,
    "keywords": "restaurant,cafe,food",
  };

  // 位置、半径、キーワードから周辺情報を検索する 
  const getLocationInfo = async (params) => {
    setIsLoading(true);
    axios.post("http://localhost:8000/search_nearby_places", params, {
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

  return (
    <div className="App">
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
        >
          {locationData.map((location, index) => (
            <Marker key={index} position={location[0]} />
          ))}
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