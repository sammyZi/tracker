/**
 * StaticRouteMap
 * Displays a completed activity route with high-resolution polyline,
 * distance markers, pace heatmap, and route statistics
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE, MapType as RNMapType } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common/Text';
import { RoutePoint, UnitSystem } from '../../types';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatDistance } from '../../utils/formatting';
import { calculateDistance } from '../../utils/calculations';
import { useSettings } from '../../context';

interface StaticRouteMapProps {
  route: RoutePoint[];
  units?: UnitSystem;
  showDistanceMarkers?: boolean;
  showPaceHeatmap?: boolean;
  averagePace?: number;
}

export const StaticRouteMap: React.FC<StaticRouteMapProps> = ({
  route,
  units = 'metric',
  showDistanceMarkers = true,
  showPaceHeatmap = false,
  averagePace = 0,
}) => {
  const { settings } = useSettings();
  const mapRef = React.useRef<MapView>(null);

  // Convert our MapType to React Native Maps MapType
  const getMapType = (): RNMapType => {
    switch (settings.mapType) {
      case 'satellite':
        return 'satellite';
      case 'hybrid':
        return 'hybrid';
      case 'standard':
      default:
        return 'standard';
    }
  };

  // Calculate map region to fit the entire route
  const getMapRegion = () => {
    if (route.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const latitudes = route.map(p => p.latitude);
    const longitudes = route.map(p => p.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.3; // Add 30% padding
    const lngDelta = (maxLng - minLng) * 1.3;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  // Generate distance markers along the route
  const getDistanceMarkers = () => {
    if (!showDistanceMarkers || route.length < 2) return [];

    const markers: Array<{ position: RoutePoint; distance: number }> = [];
    const markerInterval = units === 'metric' ? 1000 : 1609.34; // 1km or 1 mile in meters
    let accumulatedDistance = 0;
    let nextMarkerDistance = markerInterval;

    for (let i = 1; i < route.length; i++) {
      const segmentDistance = calculateDistance(
        route[i - 1].latitude,
        route[i - 1].longitude,
        route[i].latitude,
        route[i].longitude
      );

      accumulatedDistance += segmentDistance;

      if (accumulatedDistance >= nextMarkerDistance) {
        markers.push({
          position: route[i],
          distance: nextMarkerDistance,
        });
        nextMarkerDistance += markerInterval;
      }
    }

    return markers;
  };

  // Calculate pace for each segment for heatmap
  const getPolylineSegments = () => {
    if (!showPaceHeatmap || route.length < 2 || !averagePace) {
      // Return single polyline with primary color
      return [{
        coordinates: route.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
        color: Colors.primary,
      }];
    }

    // Calculate pace for each segment and color accordingly
    const segments: Array<{ coordinates: any[]; color: string }> = [];
    
    for (let i = 1; i < route.length; i++) {
      const point1 = route[i - 1];
      const point2 = route[i];
      
      const distance = calculateDistance(
        point1.latitude,
        point1.longitude,
        point2.latitude,
        point2.longitude
      );
      
      const timeDiff = (point2.timestamp - point1.timestamp) / 1000; // seconds
      const segmentPace = distance > 0 ? (timeDiff / distance) * 1000 : averagePace; // sec/km

      // Color based on pace relative to average
      let color = Colors.primary;
      if (segmentPace < averagePace * 0.9) {
        color = Colors.success; // Fast (green)
      } else if (segmentPace > averagePace * 1.1) {
        color = Colors.warning; // Slow (amber)
      }

      segments.push({
        coordinates: [
          { latitude: point1.latitude, longitude: point1.longitude },
          { latitude: point2.latitude, longitude: point2.longitude },
        ],
        color,
      });
    }

    return segments;
  };

  const fitToRoute = () => {
    if (mapRef.current && route.length > 0) {
      const coordinates = route.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };



  const distanceMarkers = getDistanceMarkers();
  const polylineSegments = getPolylineSegments();

  return (
    <View style={styles.container}>
      <MapView
        key={`static-map-${settings.mapType}`}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getMapRegion()}
        mapType={getMapType()}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
        toolbarEnabled={false}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
      >
        {/* Route polyline(s) */}
        {polylineSegments.map((segment, index) => (
          <Polyline
            key={`segment-${index}`}
            coordinates={segment.coordinates}
            strokeColor={segment.color}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        ))}

        {/* Start marker */}
        {route.length > 0 && (
          <Marker
            coordinate={{
              latitude: route[0].latitude,
              longitude: route[0].longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.startMarker}>
              <Ionicons name="flag" size={16} color="#fff" />
            </View>
          </Marker>
        )}

        {/* End marker */}
        {route.length > 1 && (
          <Marker
            coordinate={{
              latitude: route[route.length - 1].latitude,
              longitude: route[route.length - 1].longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.endMarker}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Distance markers */}
        {distanceMarkers.map((marker, index) => (
          <Marker
            key={`distance-${index}`}
            coordinate={{
              latitude: marker.position.latitude,
              longitude: marker.position.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.distanceMarker}>
              <Text variant="extraSmall" weight="semiBold" color={Colors.surface}>
                {formatDistance(marker.distance, units, 0)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={fitToRoute}>
          <Ionicons name="expand" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Pace heatmap legend */}
      {showPaceHeatmap && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.success }]} />
            <Text variant="extraSmall" color={Colors.textSecondary}>Fast</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.primary }]} />
            <Text variant="extraSmall" color={Colors.textSecondary}>Average</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.warning }]} />
            <Text variant="extraSmall" color={Colors.textSecondary}>Slow</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BorderRadius.large,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  startMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...Shadows.medium,
  },
  endMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...Shadows.medium,
  },
  distanceMarker: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
    borderWidth: 2,
    borderColor: '#fff',
    ...Shadows.small,
  },
  controls: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    gap: Spacing.sm,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  legend: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
    ...Shadows.small,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
