import './CustomMarker.scss';
import L from 'leaflet';

const customGreenMarkerIcon: L.DivIcon = new L.DivIcon({
  className: 'custom-green-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
  html: "<div class='custom-green-marker-inner'></div>",
});

const customOrangeMarkerIcon: L.DivIcon = new L.DivIcon({
  className: 'custom-orange-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
  html: "<div class='custom-orange-marker-inner'></div>",
});

export default {
  customGreenMarkerIcon,
  customOrangeMarkerIcon,
};
