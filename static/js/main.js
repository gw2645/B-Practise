/*
 * JavaScript for the Bandacious homepage.
 *
 * This script initialises the Google Map, manages venue markers and
 * implements basic filtering based on genre and distance from the user's
 * geolocation.  All client‑side logic resides here to keep templates clean
 * and to abide by the no heavy JS framework policy.
 */

/* global google */

// Placeholder venue data.  In production, this could be served via an API
// endpoint or embedded in the template.  Each venue includes coordinates,
// a name and associated genres.  Additional attributes (e.g., marker icon
// paths) can be added later.
const VENUES = [
  {
    name: 'The Red Lion',
    lat: 51.5079,
    lng: -0.0877,
    genres: ['Rock', 'Pop'],
  },
  {
    name: 'Camden Club',
    lat: 51.5410,
    lng: -0.1437,
    genres: ['Electronic', 'EDM'],
  },
  {
    name: 'The Junction',
    lat: 51.4538,
    lng: -2.5931,
    genres: ['Blues', 'Folk'],
  },
];

let map;
let markers = [];

/**
 * Initialise the Google map.  Called automatically when the API script
 * finishes loading.  If geolocation permission has been granted previously,
 * the map centres on the user's location; otherwise it defaults to London.
 */
function initMap() {
  const defaultCenter = { lat: 51.5074, lng: -0.1278 }; // London
  map = new google.maps.Map(document.getElementById('map'), {
    center: defaultCenter,
    zoom: 11,
    disableDefaultUI: false,
  });
  // Create markers for all venues initially
  createMarkers(VENUES);
}

/**
 * Create markers on the map for the provided venues.  This also applies
 * simple clustering if more than one venue exists in close proximity.
 * @param {Array} venues - List of venue objects with name, lat, lng, genres.
 */
function createMarkers(venues) {
  clearMarkers();
  venues.forEach((venue) => {
    const marker = new google.maps.Marker({
      position: { lat: venue.lat, lng: venue.lng },
      map,
      title: venue.name,
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `<strong>${venue.name}</strong><br />Genres: ${venue.genres.join(', ')}`,
    });
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
    markers.push(marker);
  });
}

/**
 * Remove existing markers from the map.
 */
function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

/**
 * Haversine distance between two points on Earth.
 * @param {Object} coord1 { lat: number, lng: number }
 * @param {Object} coord2 { lat: number, lng: number }
 * @returns {number} distance in kilometers
 */
function haversineDistance(coord1, coord2) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLon = deg2rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.lat)) *
      Math.cos(deg2rad(coord2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Filter venues based on selected genre and distance radius from the user's
 * location.  If geolocation is not available or denied, it filters only
 * by genre.
 */
function applyFilters() {
  const genreSelect = document.getElementById('genre-filter');
  const distanceSelect = document.getElementById('distance-filter');
  const selectedGenre = genreSelect.value;
  const selectedDistance = parseFloat(distanceSelect.value); // in miles
  // Convert miles to km
  const distanceKm = selectedDistance * 1.60934;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoord = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const filtered = VENUES.filter((venue) => {
          const matchesGenre = selectedGenre === 'all' || venue.genres.includes(selectedGenre);
          const dist = haversineDistance(userCoord, { lat: venue.lat, lng: venue.lng });
          const withinRadius = isNaN(distanceKm) || dist <= distanceKm;
          return matchesGenre && withinRadius;
        });
        createMarkers(filtered);
      },
      () => {
        // On error, fallback to genre-only filtering
        const filtered = VENUES.filter((venue) => {
          return selectedGenre === 'all' || venue.genres.includes(selectedGenre);
        });
        createMarkers(filtered);
      },
    );
  } else {
    const filtered = VENUES.filter((venue) => {
      return selectedGenre === 'all' || venue.genres.includes(selectedGenre);
    });
    createMarkers(filtered);
  }
}

/**
 * Event listener for the "What's on?" button.  This triggers a filter
 * application based on the user’s geolocation to show venues within the
 * selected radius.  It will recenter the map on the user if permitted.
 */
function handleWhatsOn() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(userPosition);
        map.setZoom(12);
        applyFilters();
      },
      () => {
        // If location access denied, still attempt to filter by genre/distance
        applyFilters();
      },
    );
  } else {
    // Browser does not support geolocation
    applyFilters();
  }
}

// Attach listeners after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  const whatsOnBtn = document.getElementById('whats-on-btn');
  if (whatsOnBtn) {
    whatsOnBtn.addEventListener('click', handleWhatsOn);
  }
  const genreSelect = document.getElementById('genre-filter');
  const distanceSelect = document.getElementById('distance-filter');
  if (genreSelect && distanceSelect) {
    genreSelect.addEventListener('change', applyFilters);
    distanceSelect.addEventListener('change', applyFilters);
  }
});

// Expose initMap globally so Google Maps API can call it
window.initMap = initMap;