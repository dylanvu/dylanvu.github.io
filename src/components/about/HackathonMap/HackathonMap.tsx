"use client";

import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { IconOptions, LatLngTuple } from "leaflet";

import ContentBlockTitle from "../../content-block/ContentBlockTitle";
import { HackathonList } from "@/constants/Hackathons";
import HackathonInformation, {
  HackathonRole,
  isHackathonRole,
  HackathonType,
  isHackathonType,
} from "@/interfaces/HackathonInformation";
import HackathonPopup from "./HackathonPopUp";
import { useState } from "react";

import "../../../styles/hackathon-map/hackathon-map.css";

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

interface aggregationOptions {
  roleFilters: Set<HackathonRole>;
  hackathonTypeFilters: Set<HackathonType>;
}

// function to aggregate hackathons by city and state
function aggregateHackathons(
  hackathons: HackathonInformation[],
  aggregationOptions: aggregationOptions
): HackathonInformation[][] {
  const locationsVisited: Record<string, HackathonInformation[]> = {};
  // filter out hackathons that fit the aggregation options
  const filteredHackathons = hackathons.filter((hackathon) => {
    // return true if the options are true
    // first, filter by role
    // see if the current hackathon role is within the aggregationOption roleType
    let roleMatch = aggregationOptions.roleFilters.has(hackathon.role);

    // then filter by hackathon type
    let typeMatch = aggregationOptions.hackathonTypeFilters.has(hackathon.type);
    return roleMatch && typeMatch;
  });

  // now aggregate by location
  filteredHackathons.forEach((hackathon) => {
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

  // checkbox states
  const [roleFilters, setRoleFilters] = useState<Set<HackathonRole>>(
    new Set(["Mentor", "Participant"])
  );
  const [hackathonTypeFilters, setHackathonTypeFilters] = useState<
    Set<HackathonType>
  >(new Set(["In-Person", "Online"]));

  const aggregatedHackathonLocations = aggregateHackathons(HackathonList, {
    roleFilters: roleFilters,
    hackathonTypeFilters: hackathonTypeFilters,
  });

  function handleFilterChange(
    event: React.ChangeEvent<HTMLInputElement>,
    value: HackathonRole | HackathonType
  ) {
    if (isHackathonRole(value)) {
      // if the checkbox is checked, add or remove the role from the set
      if (event.target.checked) {
        setRoleFilters((prev) => {
          const newSet = new Set(prev);
          newSet.add(value);
          return newSet;
        });
      } else {
        setRoleFilters((prev) => {
          const newSet = new Set(prev);
          newSet.delete(value);
          return newSet;
        });
      }
    } else if (isHackathonType(value)) {
      // if the checkbox is checked, add or remove the type from the set
      if (event.target.checked) {
        setHackathonTypeFilters((prev) => {
          const newSet = new Set(prev);
          newSet.add(value);
          return newSet;
        });
      } else {
        setHackathonTypeFilters((prev) => {
          const newSet = new Set(prev);
          newSet.delete(value);
          return newSet;
        });
      }
    }
  }

  return (
    <div>
      <ContentBlockTitle title={"Hackathon Map"} />
      {/* TOOD: Make this into a accordion or something */}
      <div>Show:</div>
      <div className="map-filter-container">
        <span>
          <input
            type="checkbox"
            id="hacker"
            name="hacker"
            checked={roleFilters.has("Participant")}
            onChange={(e) => handleFilterChange(e, "Participant")}
          />
          <label htmlFor="hacker">Hacker</label>
        </span>
        <span>
          <input
            type="checkbox"
            id="mentorship"
            name="mentorship"
            checked={roleFilters.has("Mentor")}
            onChange={(e) => handleFilterChange(e, "Mentor")}
          />
          <label htmlFor="mentorship">Mentor</label>
        </span>
        <span>
          <input
            type="checkbox"
            id="inpersonHackathons"
            name="inpersonHackathons"
            checked={hackathonTypeFilters.has("In-Person")}
            onChange={(e) => handleFilterChange(e, "In-Person")}
          />
          <label htmlFor="inpersonHackathons">In-Person</label>
        </span>
        <span>
          <input
            type="checkbox"
            id="onlineHackathons"
            name="onlineHackathons"
            checked={hackathonTypeFilters.has("Online")}
            onChange={(e) => handleFilterChange(e, "Online")}
          />
          <label htmlFor="onlineHackathons">Online</label>
        </span>
      </div>

      <MapContainer
        center={startingMapPosition.center}
        zoom={startingMapPosition.zoom}
        scrollWheelZoom={true}
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
          const factor = 2.2;
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
                {/* TODO: Could use some sort of swiping interface, or just simply show a pop up that takes over the whole screen? */}
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

// TODO: make the map mobile compatible... ugh.
// TODO: When there are multiple hackathons at the same location, first create a circle of bubbles around the location, and when you click on one, it opens up a full-screen pop up with the information
// TODO: create fancy animations for the pins upon rerender
// TODO: add a slider to fast forward through the hackathons, pins can drop over time as an animation progresses to show my hackathon journey over time
// TODO: make a button to zoom in on California, and then out to the US
