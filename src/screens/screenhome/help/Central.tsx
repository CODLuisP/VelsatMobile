import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { WebView } from 'react-native-webview';

// Tu API Key de Google
const GOOGLE_API_KEY = 'AIzaSyB69HY-OKCtBsbRsKuHns-7HJxjvSqpogg';

const locations = [
  { id: 1, name: 'Plaza de Armas - Lima', lat: -12.0464, lng: -77.0428 },
  { id: 2, name: 'Miraflores - Lima', lat: -12.1196, lng: -77.0283 },
  { id: 3, name: 'Barranco - Lima', lat: -12.1467, lng: -77.0208 },
  { id: 4, name: 'San Isidro - Lima', lat: -12.0947, lng: -77.0364 },
  { id: 5, name: 'Callao Centro', lat: -12.0565, lng: -77.1181 },
  { id: 6, name: 'Plaza de Armas - Cusco', lat: -13.5164, lng: -71.9785 },
  { id: 7, name: 'Plaza de Armas - Arequipa', lat: -16.3989, lng: -71.5350 },
  { id: 8, name: 'Trujillo Centro', lat: -8.1116, lng: -79.0288 },
];

const Central = () => {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [loading, setLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0);

  // Crear HTML con el iframe de Google Street View
  const getStreetViewHTML = (lat:any, lng:any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body, html {
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe
            src="https://www.google.com/maps/embed/v1/streetview?location=${lat},${lng}&heading=0&pitch=0&fov=90&key=${GOOGLE_API_KEY}"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </body>
      </html>
    `;
  };

  const handleLocationChange = (location:any) => {
    setSelectedLocation(location);
    setLoading(true);
    setWebViewKey(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      {/* Lista de ubicaciones */}
      <View style={styles.locationsList}>
        <Text style={styles.title}>Ubicaciones en Perú</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.locationButton,
                selectedLocation.id === location.id &&
                  styles.locationButtonActive,
              ]}
              onPress={() => handleLocationChange(location)}>
              <Text
                style={[
                  styles.locationButtonText,
                  selectedLocation.id === location.id &&
                    styles.locationButtonTextActive,
                ]}
                numberOfLines={2}>
                {location.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vista previa de Street View INTERACTIVO */}
      <View style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>{selectedLocation.name}</Text>
          <Text style={styles.coordinates}>
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </Text>
        </View>

        <View style={styles.webViewContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285F4" />
              <Text style={styles.loadingText}>Cargando Street View...</Text>
            </View>
          )}

          <WebView
            key={webViewKey}
            source={{
              html: getStreetViewHTML(
                selectedLocation.lat,
                selectedLocation.lng
              ),
            }}
            style={styles.webView}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            scrollEnabled={true}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
            mixedContentMode="always"
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🌍 Street View interactivo - Arrastra para moverte y girar
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  locationsList: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
    color: '#333',
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  locationButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    minWidth: 120,
    maxWidth: 150,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationButtonActive: {
    backgroundColor: '#4285F4',
    borderColor: '#1a73e8',
  },
  locationButtonText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  locationButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  previewHeader: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#666',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#A5D6A7',
  },
  infoText: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default Central;