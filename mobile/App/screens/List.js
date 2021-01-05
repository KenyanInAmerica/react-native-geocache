import React from "react";
import { ActivityIndicator } from "react-native";

import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

import { List, ListItem } from "../components/List";
import { geoFetch } from '../util/api'

class ListScreen extends React.Component {
  state = {
    loading: true,
    list: []
  };

  componentDidMount() {
    let caches;
    geoFetch('/geocache/list')
      .then(response => {
        caches = response;
        return this.getLocation();
      })
      .then((coords) => {
        this.setState({
          loading: false,
          list: this.sortList(coords, caches.result)
        });
      })
      .catch(error => {
        console.log('list error', error);
      });
  }

  getLocation() {
    return Permissions.askAsync(Permissions.LOCATION)
      .then(({ status }) => {
        if (status !== "granted") {
          throw new Error("Permission to access location was denied");
        }
        return Location.getCurrentPositionAsync();
      })
      .then((position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        return coords;
      });
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  distance(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;
  
    const dLat = this.degreesToRadians(lat2-lat1);
    const dLon = this.degreesToRadians(lon2-lon1);
  
    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);
  
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

    return earthRadiusKm * c;
  }

  sortList(coords, list) {
    list.forEach((cache) => {
      cache.distanceFromUser = this.distance(coords.latitude, coords.longitude, cache.latitude, cache.longitude);
    });
    list.sort((a, b) => (a.distanceFromUser >= b.distanceFromUser) ? 1 : -1)
    return list;
  }

  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" />;
    }

    return (
      <List
        data={this.state.list}
        renderItem={({ item, index }) => (
          <ListItem
            title={item.title}
            isOdd={index % 2}
            onPress={() => this.props.navigation.navigate("Details", { item })}
          />
        )}
      />
    );
  }
}

export default ListScreen;
