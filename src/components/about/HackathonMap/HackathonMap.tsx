"use client";

import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { IconOptions, LatLngTuple } from "leaflet";

import ContentBlockTitle from "../../content-block/ContentBlockTitle";
import { HackathonList } from "@/constants/Hackathons";
import HackathonInformation from "@/interfaces/HackathonInformation";
import HackathonPopup from "./HackathonPopUp";

const defaultIconLength = 25;
const defaultIconWidth = 41;

const defaultIconOptions: IconOptions = {
  iconUrl: "./leaflet-assets/marker-icon.png",
  iconSize: [defaultIconLength, defaultIconWidth],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
};

interface MapPosition {
  zoom: number;
  center: LatLngTuple;
}

// function to aggregate hackathons by city and state
function aggregateHackathons(
  hackathons: HackathonInformation[]
): HackathonInformation[][] {
  const locationsVisited: Record<string, HackathonInformation[]> = {};
  hackathons.forEach((hackathon) => {
    // if the latitude and longitude combination hasn't been visited yet, create an array for it
    const location = `${hackathon.latitude},${hackathon.longitude}`;
    if (!locationsVisited[location]) {
      locationsVisited[location] = [];
    }
    locationsVisited[location].push(hackathon);
  });
  // convert the object to an array of arrays
  const locations: HackathonInformation[][] = Object.values(locationsVisited);
  return locations;
}

export default function HackathonMap() {
  const usPosition: MapPosition = { zoom: 5, center: [37.0902, -95.8129] };
  const californiaPosition: MapPosition = {
    zoom: 6,
    center: [37.7833, -122.4036],
  };
  const startingMapPosition = californiaPosition;

  const aggregatedHackathonLocations = aggregateHackathons(HackathonList);

  return (
    <div>
      <ContentBlockTitle title={"Hackathon Map"} />
      <MapContainer
        center={startingMapPosition.center}
        zoom={startingMapPosition.zoom}
        scrollWheelZoom={false}
        style={{
          height: "730px",
        }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* for each hackathon location, create a marker */}
        {aggregatedHackathonLocations.map((aggregatedLocation, index) => {
          // figure out how large the marker should be
          // the more hackathons there are, the bigger the marker
          const factor = 2;
          const markerLength =
            defaultIconLength + aggregatedLocation.length * factor;
          const markerWidth =
            defaultIconWidth + aggregatedLocation.length * factor;

          // reverse the hackathon list so that the first hackathon is the most recent one
          aggregatedLocation.reverse();
          // now put all the hackathon information into the same marker
          return (
            <Marker
              key={"marker-" + index}
              position={[
                aggregatedLocation[0].latitude,
                aggregatedLocation[0].longitude,
              ]}
              icon={L.icon({
                ...defaultIconOptions,
                iconSize: [markerLength, markerWidth],
              })}
            >
              <Popup autoPan={false}>
                {/* for every hackathon at this location, add the hackathon information */}
                {aggregatedLocation.map((hackathon, hIndex) => (
                  <HackathonPopup
                    hackathon={hackathon}
                    key={"hackathon-" + hIndex}
                  />
                ))}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// TODO: When there are multiple hackathons at the same location, first create a circle of bubbles around the location, and when you click on one, it opens up a full-screen pop up with the information
// TODO: add a way to toggle between hackathons and mentorship on the map, maybe different colors for each category
// TODO: add a slider to fast forward through the hackathons, pins can drop over time as an animation progresses to show my hackathon journey
// TODO: make a button to zoom in on California, and then out to the US
