import React, { useState, useMemo, useEffect, useRef } from 'react';

/*
 * Bandacious Homepage
 *
 * This file defines a small single–page prototype for the Bandacious public
 * homepage. The design follows the provided specification: it showcases a
 * discovery oriented layout with a header, search+filter panel, map area,
 * upcoming events grid, popular venues/artists strips and footer. Data is
 * mocked locally; no backend is required. The map implementation is stubbed
 * but illustrates how one might conditionally load Google Maps or a MapLibre
 * alternative behind an environment flag. All styling relies on Tailwind
 * classes for rapid prototyping.
 */

/* -------------------------------------------------------------------------
 * Mock Data
 *
 * 30 sample venues across greater London with approximate latitude/longitude
 * coordinates and unique names. Each venue includes an upcomingCount field
 * computed below based on the events array.
 */
const venues = [
  { id: 1, name: 'Camden House', lat: 51.52134267984579, lon: -0.17529892447773332 },
  { id: 2, name: 'Stratford Pub', lat: 51.484902931836906, lon: -0.15547892618511772 },
  { id: 3, name: 'Chelsea Bar', lat: 51.5310471214164, lon: -0.11013005125770886 },
  { id: 4, name: 'Battersea Lounge', lat: 51.54661795677048, lon: -0.1691061167370584 },
  { id: 5, name: 'Wimbledon Venue', lat: 51.499592181968524, lon: -0.17482027805619296 },
  { id: 6, name: 'Bethnal Green Hall', lat: 51.47926379748036, lon: -0.12726447118966377 },
  { id: 7, name: 'Ealing Club', lat: 51.460053596968386, lon: -0.15791623493133516 },
  { id: 8, name: 'Deptford Stage', lat: 51.52238844377795, lon: -0.12330585193967833 },
  { id: 9, name: 'Soho Spot', lat: 51.47944406220407, lon: -0.11887343161240913 },
  { id: 10, name: 'Paddington Cafe', lat: 51.53834304566778, lon: -0.1771501240321939 },
  { id: 11, name: 'Peckham House', lat: 51.537981925183274, lon: -0.10798606050117732 },
  { id: 12, name: 'Kensington Pub', lat: 51.491425051651795, lon: -0.16225205001882184 },
  { id: 13, name: 'Notting Hill Bar', lat: 51.55312130722068, lon: -0.14414054548873734 },
  { id: 14, name: 'Covent Garden Lounge', lat: 51.46667458433801, lon: -0.1681283623166536 },
  { id: 15, name: 'Waterloo Venue', lat: 51.542149436634745, lon: -0.11742739686331088 },
  { id: 16, name: 'Shoreditch Hall', lat: 51.53811282732744, lon: -0.10482682133061821 },
  { id: 17, name: 'Lewisham Club', lat: 51.511022809145466, lon: -0.08048842360206293 },
  { id: 18, name: 'Dalston Stage', lat: 51.495253437720834, lon: -0.1225959368726773 },
  { id: 19, name: 'Fulham Spot', lat: 51.5403404664253, lon: -0.1159480247635754 },
  { id: 20, name: 'Finsbury Cafe', lat: 51.543570690031075, lon: -0.1200647854743238 },
  { id: 21, name: 'Clapham House', lat: 51.52785718362149, lon: -0.17321756163443378 },
  { id: 22, name: 'Westminster Pub', lat: 51.48018982756515, lon: -0.14886120363978927 },
  { id: 23, name: 'Brixton Bar', lat: 51.46537919769236, lon: -0.15452091136389698 },
  { id: 24, name: 'Whitechapel Lounge', lat: 51.46750014294097, lon: -0.1500026396889908 },
  { id: 25, name: 'Islington Venue', lat: 51.52096844442644, lon: -0.1413167821029916 },
  { id: 26, name: 'Hackney Hall', lat: 51.494418096711684, lon: -0.15684929692285124 },
  { id: 27, name: 'Southbank Club', lat: 51.484097782204906, lon: -0.0841345412287506 },
  { id: 28, name: 'Greenwich Stage', lat: 51.52220353852466, lon: -0.11688689943330118 },
  { id: 29, name: 'Hampstead Spot', lat: 51.474513864819805, lon: -0.10488732020496508 },
  { id: 30, name: 'Hammersmith Cafe', lat: 51.47374024937619, lon: -0.13985445582423522 }
];

// 15 sample artists / bands
const artists = [
  { id: 1, name: 'Electric Beats' },
  { id: 2, name: 'Moonlight Riders' },
  { id: 3, name: 'Midnight Jams' },
  { id: 4, name: 'Neon Strings' },
  { id: 5, name: 'Vintage Vibes' },
  { id: 6, name: 'Dynamic Sounds' },
  { id: 7, name: 'Groovy Dreams' },
  { id: 8, name: 'Sunny Movers' },
  { id: 9, name: 'Cosmic Notes' },
  { id: 10, name: 'Wandering Soul' },
  { id: 11, name: 'Velvet Echoes' },
  { id: 12, name: 'Golden Grooves' },
  { id: 13, name: 'Rustic Sparks' },
  { id: 14, name: 'Bluesy Harmony' },
  { id: 15, name: 'Retro Rhythm' }
];

// 20 sample events linking artists and venues. Dates are ISO strings representing
// mid‑2025 performances. Price values of zero denote free shows.
const events = [
  { id: 1, title: 'Live Gig 1', datetime: '2025-11-09', venueId: 3, artistId: 2, price: 0, genre: 'Hip Hop' },
  { id: 2, title: 'Live Gig 2', datetime: '2025-09-25', venueId: 9, artistId: 10, price: 0, genre: 'Folk' },
  { id: 3, title: 'Live Gig 3', datetime: '2025-09-17', venueId: 22, artistId: 3, price: 10, genre: 'Electronic' },
  { id: 4, title: 'Live Gig 4', datetime: '2025-10-10', venueId: 12, artistId: 9, price: 10, genre: 'Folk' },
  { id: 5, title: 'Live Gig 5', datetime: '2025-10-02', venueId: 28, artistId: 1, price: 0, genre: 'Blues' },
  { id: 6, title: 'Live Gig 6', datetime: '2025-11-13', venueId: 30, artistId: 7, price: 10, genre: 'Folk' },
  { id: 7, title: 'Live Gig 7', datetime: '2025-09-25', venueId: 6, artistId: 4, price: 0, genre: 'Rock' },
  { id: 8, title: 'Live Gig 8', datetime: '2025-09-26', venueId: 6, artistId: 3, price: 15, genre: 'Folk' },
  { id: 9, title: 'Live Gig 9', datetime: '2025-10-08', venueId: 22, artistId: 9, price: 0, genre: 'Blues' },
  { id: 10, title: 'Live Gig 10', datetime: '2025-11-04', venueId: 24, artistId: 9, price: 0, genre: 'Hip Hop' },
  { id: 11, title: 'Live Gig 11', datetime: '2025-10-22', venueId: 12, artistId: 14, price: 10, genre: 'Jazz' },
  { id: 12, title: 'Live Gig 12', datetime: '2025-11-02', venueId: 23, artistId: 12, price: 10, genre: 'Electronic' },
  { id: 13, title: 'Live Gig 13', datetime: '2025-10-18', venueId: 16, artistId: 5, price: 10, genre: 'Folk' },
  { id: 14, title: 'Live Gig 14', datetime: '2025-10-17', venueId: 22, artistId: 15, price: 10, genre: 'Blues' },
  { id: 15, title: 'Live Gig 15', datetime: '2025-10-07', venueId: 24, artistId: 15, price: 15, genre: 'Electronic' },
  { id: 16, title: 'Live Gig 16', datetime: '2025-10-14', venueId: 22, artistId: 4, price: 0, genre: 'Hip Hop' },
  { id: 17, title: 'Live Gig 17', datetime: '2025-10-29', venueId: 29, artistId: 15, price: 15, genre: 'Pop' },
  { id: 18, title: 'Live Gig 18', datetime: '2025-11-03', venueId: 10, artistId: 5, price: 20, genre: 'Hip Hop' },
  { id: 19, title: 'Live Gig 19', datetime: '2025-10-17', venueId: 17, artistId: 9, price: 20, genre: 'Folk' },
  { id: 20, title: 'Live Gig 20', datetime: '2025-10-22', venueId: 10, artistId: 12, price: 0, genre: 'Blues' }
];

// Compute upcoming count for each venue based on events. Attach to the venue
// objects so popular venues can be derived easily. This runs once on module
// load.
venues.forEach(v => {
  v.upcomingCount = events.filter(ev => ev.venueId === v.id).length;
});

/* -------------------------------------------------------------------------
 * Helper functions
 */

/**
 * Convert degrees to radians
 * @param {number} deg
 */
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Compute the haversine distance (in kilometres) between two geographic
 * coordinates. Used for the distance slider filter. Approximate radius of
 * Earth is 6,371km.
 *
 * @param {{lat:number, lon:number}} a
 * @param {{lat:number, lon:number}} b
 */
function haversineDistance(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

/**
 * Format a date/time for display to the user. Uses UK locale (en-GB) to
 * reflect the London market. Returns strings like "10 Oct 2025" and
 * "19:00".
 * @param {string} isoString
 */
function formatDateTime(isoString) {
  const dt = new Date(isoString);
  const dateStr = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return { dateStr, timeStr };
}

/**
 * Generate a Google Calendar link for an event. Assumes a default duration
 * of two hours. All text values are URI encoded.
 *
 * @param {object} event Event object
 * @param {object} venue Venue object
 */
function buildGoogleCalendarUrl(event, venue) {
  const start = new Date(event.datetime);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  function toCalFormat(date) {
    // Format like 20251109T190000Z
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} at ${venue.name}`,
    dates: `${toCalFormat(start)}/${toCalFormat(end)}`,
    location: `${venue.name}, London`,
    details: `Join us for ${event.title} at ${venue.name}!`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Build a simple .ics calendar file contents for download. We only encode
 * essential fields; line breaks are delimited by \r\n as per spec. See
 * https://www.rfc-editor.org/rfc/rfc5545 for more.
 * @param {object} event
 * @param {object} venue
 */
function buildIcsFile(event, venue) {
  const start = new Date(event.datetime);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  function icsFormat(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  const lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Bandacious//EN');
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${event.id}@bandacious.com`);
  lines.push(`DTSTAMP:${icsFormat(new Date())}`);
  lines.push(`DTSTART:${icsFormat(start)}`);
  lines.push(`DTEND:${icsFormat(end)}`);
  lines.push(`SUMMARY:${event.title} at ${venue.name}`);
  lines.push(`LOCATION:${venue.name}, London`);
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/* -------------------------------------------------------------------------
 * Components
 */

/**
 * Header component containing the Bandacious wordmark and sign‑up buttons.
 */
function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between py-4 px-6 border-b border-gray-200">
      <div className="flex items-baseline space-x-2">
        {/* Wordmark uses the Bangers font via inline style */}
        <h1 className="text-3xl md:text-4xl text-[#e61a23]" style={{ fontFamily: 'Bangers, cursive' }}>Bandacious</h1>
        <span className="hidden sm:inline-block text-sm md:text-base text-gray-600 mt-2">Find Live Music Near You</span>
      </div>
      <div className="flex space-x-3 mt-3 sm:mt-0">
        <a href="#" className="px-4 py-2 bg-[#e61a23] text-white rounded-md text-sm font-medium hover:bg-[#c5171d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e61a23]" aria-label="Sign up as an artist">Sign up — Artists</a>
        <a href="#" className="px-4 py-2 border border-[#e61a23] text-[#e61a23] rounded-md text-sm font-medium hover:bg-[#e61a23] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e61a23]" aria-label="Sign up as a venue">Sign up — Venues</a>
      </div>
    </header>
  );
}

/**
 * SearchBar component encapsulating the search field, tab selector and
 * additional filters. It receives controlled values and setter functions
 * from the parent component.
 */
function SearchBar({ searchQuery, setSearchQuery, selectedTab, setSelectedTab, filters, setFilters }) {
  // Handler for generic filter updates
  const updateFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };
  return (
    <div className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-4 mt-4">
      {/* Tabs for selecting search scope */}
      <div className="mb-4">
        <nav className="flex space-x-4">
          {['events', 'artists', 'venues'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1 rounded-md text-sm capitalize ${selectedTab === tab ? 'bg-[#e61a23] text-white' : 'bg-gray-100 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-[#e61a23]`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      {/* Search input */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Search</label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e61a23]"
            placeholder={`Search ${selectedTab}`}
          />
        </div>
        {/* Genre filter */}
        <div className="mt-3 md:mt-0">
          <label htmlFor="genre" className="sr-only">Genre</label>
          <select
            id="genre"
            value={filters.genre}
            onChange={e => updateFilter('genre', e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e61a23]"
            aria-label="Filter by genre"
          >
            <option value="">All genres</option>
            {/* unique genres from events */}
            {[...new Set(events.map(ev => ev.genre))].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        {/* Date range filter */}
        <div className="flex space-x-2 items-center">
          <label htmlFor="startDate" className="text-sm text-gray-700">From</label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={e => updateFilter('startDate', e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#e61a23]"
            aria-label="Start date"
          />
          <label htmlFor="endDate" className="ml-2 text-sm text-gray-700">To</label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={e => updateFilter('endDate', e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#e61a23]"
            aria-label="End date"
          />
        </div>
        {/* Distance slider */}
        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          <label htmlFor="distance" className="text-sm text-gray-700">Distance</label>
          <input
            id="distance"
            type="range"
            min="1"
            max="50"
            value={filters.distance}
            onChange={e => updateFilter('distance', Number(e.target.value))}
            className="w-32"
            aria-label="Distance in kilometres"
          />
          <span className="text-sm text-gray-700">{filters.distance}km</span>
        </div>
        {/* Free only toggle */}
        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          <input
            id="freeOnly"
            type="checkbox"
            checked={filters.freeOnly}
            onChange={e => updateFilter('freeOnly', e.target.checked)}
            className="h-4 w-4 text-[#e61a23] focus:ring-[#e61a23] border-gray-300 rounded"
            aria-label="Free shows only"
          />
          <label htmlFor="freeOnly" className="text-sm text-gray-700 select-none">Free only</label>
        </div>
      </div>
    </div>
  );
}

/**
 * MapPanel displays a map of London with venue pins. If the environment flag
 * VITE_USE_GOOGLE_MAPS is true, it attempts to load the Google Maps JS API;
 * otherwise a placeholder panel is shown. Pin clustering would be handled by
 * the underlying map library when enabled. For this prototype the map is
 * non‑interactive.
 */
function MapPanel({ venues, selectedVenueId, onSelectVenue }) {
  const mapRef = useRef(null);
  // Load Google Maps if the flag is set
  useEffect(() => {
    if (window.ENV && window.ENV.VITE_USE_GOOGLE_MAPS) {
      // Dynamically import the Google Maps script once
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
        script.async = true;
        script.onload = () => initMap();
        document.body.appendChild(script);
      } else {
        initMap();
      }
    }
    function initMap() {
      if (!mapRef.current) return;
      // Create the map centred on London
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 51.5074, lng: -0.1278 },
        zoom: 11,
      });
      // Marker clustering optional; we only add simple markers here
      venues.forEach(v => {
        const marker = new window.google.maps.Marker({
          position: { lat: v.lat, lng: v.lon },
          map,
          title: v.name,
        });
        marker.addListener('click', () => onSelectVenue(v.id));
      });
    }
  }, [venues, onSelectVenue]);
  return (
    <div className="w-full h-80 mt-6 relative rounded-lg overflow-hidden border border-gray-200">
      {window.ENV && window.ENV.VITE_USE_GOOGLE_MAPS ? (
        <div ref={mapRef} className="absolute inset-0" aria-label="Map of venues" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50" aria-label="Map placeholder">
          <span className="text-sm text-gray-500">Interactive map unavailable</span>
          <span className="text-xs text-gray-400">Toggle the googleMaps flag to enable the map</span>
        </div>
      )}
    </div>
  );
}

/**
 * EventGrid renders a responsive grid of event cards. Each card displays
 * basic event information and two calendar export actions: one for Google
 * Calendar and another generating a local .ics download.
 */
function EventGrid({ events, venuesById, artistsById }) {
  if (!events.length) {
    return <p className="mt-6 text-sm text-gray-600">No events match your filters. Try adjusting your search.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {events.map(ev => {
        const venue = venuesById[ev.venueId];
        const artist = artistsById[ev.artistId];
        const { dateStr, timeStr } = formatDateTime(ev.datetime);
        const priceStr = ev.price === 0 ? 'Free' : `£${ev.price.toFixed(2)}`;
        const googleCalLink = buildGoogleCalendarUrl(ev, venue);
        const icsContent = buildIcsFile(ev, venue);
        const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
        return (
          <div key={ev.id} className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Bangers, cursive' }}>{ev.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{artist.name} @ {venue.name}</p>
              <p className="text-sm text-gray-600">{dateStr} · {timeStr}</p>
              <p className="text-sm text-gray-600">{priceStr}</p>
              <p className="text-sm text-gray-600">Genre: {ev.genre}</p>
            </div>
            <div className="mt-3 flex space-x-2">
              <a href={googleCalLink} target="_blank" rel="noopener noreferrer" className="flex-1 inline-block text-center px-3 py-1 text-xs rounded-md bg-[#e61a23] text-white hover:bg-[#c5171d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e61a23]">Add to Google</a>
              <a href={icsHref} download={`${ev.title.replace(/\s+/g, '_')}.ics`} className="flex-1 inline-block text-center px-3 py-1 text-xs rounded-md border border-[#e61a23] text-[#e61a23] hover:bg-[#e61a23] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e61a23]">Download .ics</a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * EntityStrip displays a horizontal list of artists or venues. It can be reused
 * for both categories. Items include a simple card with the name and an
 * optional count (e.g. upcoming events). If the list is empty no strip is
 * rendered.
 */
function EntityStrip({ title, items }) {
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-2xl mb-3" style={{ fontFamily: 'Bangers, cursive' }}>{title}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-2">
        {items.map(item => (
          <div key={item.id} className="min-w-[160px] border border-gray-200 rounded-lg p-4 flex-shrink-0 bg-white shadow-sm">
            <h3 className="font-semibold" style={{ fontFamily: 'Bangers, cursive' }}>{item.name}</h3>
            {item.upcomingCount != null && (
              <p className="text-sm text-gray-600">{item.upcomingCount} upcoming</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Footer provides site navigation links and contact info. It sits at the
 * bottom of the page. In a real site these would link to appropriate
 * content; here they are placeholders.
 */
function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <h3 className="font-semibold mb-2" style={{ fontFamily: 'Bangers, cursive' }}>Bandacious</h3>
            <p>Discover live music in London.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Company</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">About</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
              <li><a href="#" className="hover:underline">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Legal</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Terms</a></li>
              <li><a href="#" className="hover:underline">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Stay in touch</h4>
            <p>Subscribe for the latest shows.</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400">© {new Date().getFullYear()} Bandacious. All rights reserved.</p>
      </div>
    </footer>
  );
}

/**
 * Main application component. Orchestrates layout and state management.
 */
export default function App() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('events');
  const [filters, setFilters] = useState({
    genre: '',
    startDate: '',
    endDate: '',
    distance: 50,
    freeOnly: false
  });
  // Track selected venue for map interactions (not used heavily in this prototype)
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  // Precompute lookup maps for venues and artists by id
  const venuesById = useMemo(() => {
    const m = {};
    venues.forEach(v => { m[v.id] = v; });
    return m;
  }, []);
  const artistsById = useMemo(() => {
    const m = {};
    artists.forEach(a => { m[a.id] = a; });
    return m;
  }, []);
  // Compute filtered events based on search, filters and selected venue (if any)
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const v = venuesById[ev.venueId];
      const a = artistsById[ev.artistId];
      const q = searchQuery.trim().toLowerCase();
      // Apply search query across title, artist and venue names
      if (q) {
        const matches = ev.title.toLowerCase().includes(q) ||
                        a.name.toLowerCase().includes(q) ||
                        v.name.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // If a specific venue is selected, only show events at that venue
      if (selectedVenueId && ev.venueId !== selectedVenueId) return false;
      // Genre filter
      if (filters.genre && ev.genre !== filters.genre) return false;
      // Date range filters
      const eventDate = new Date(ev.datetime);
      if (filters.startDate && eventDate < new Date(filters.startDate)) return false;
      if (filters.endDate && eventDate > new Date(filters.endDate)) return false;
      // Free filter
      if (filters.freeOnly && ev.price > 0) return false;
      // Distance filter: measure distance from central London to the venue
      const dist = haversineDistance({ lat: 51.5074, lon: -0.1278 }, { lat: v.lat, lon: v.lon });
      if (dist > filters.distance) return false;
      return true;
    });
  }, [searchQuery, filters, selectedVenueId, venuesById, artistsById]);
  // Filter artists based on search
  const filteredArtists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return artists.filter(a => {
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [searchQuery]);
  // Filter venues based on search and distance
  const filteredVenues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return venues.filter(v => {
      if (q && !v.name.toLowerCase().includes(q)) return false;
      const dist = haversineDistance({ lat: 51.5074, lon: -0.1278 }, { lat: v.lat, lon: v.lon });
      if (dist > filters.distance) return false;
      return true;
    });
  }, [searchQuery, filters]);
  // Derive popular lists: top 6 venues and artists by upcoming events count
  const popularVenues = useMemo(() => {
    return [...venues].sort((a, b) => b.upcomingCount - a.upcomingCount).slice(0, 6);
  }, []);
  const popularArtists = useMemo(() => {
    // For artists we can count how many events they are associated with
    const counts = {};
    events.forEach(ev => {
      counts[ev.artistId] = (counts[ev.artistId] || 0) + 1;
    });
    return [...artists]
      .map(a => ({ ...a, upcomingCount: counts[a.id] || 0 }))
      .sort((a, b) => b.upcomingCount - a.upcomingCount)
      .slice(0, 6);
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          filters={filters}
          setFilters={setFilters}
        />
        {/* Map and results section */}
        <MapPanel
          venues={filteredVenues}
          selectedVenueId={selectedVenueId}
          onSelectVenue={setSelectedVenueId}
        />
        {selectedTab === 'events' && (
          <EventGrid events={filteredEvents} venuesById={venuesById} artistsById={artistsById} />
        )}
        {selectedTab === 'artists' && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArtists.length ? filteredArtists.map(a => (
              <div key={a.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Bangers, cursive' }}>{a.name}</h3>
                <p className="text-sm text-gray-600">{(events.filter(ev => ev.artistId === a.id)).length} upcoming shows</p>
              </div>
            )) : <p className="text-sm text-gray-600">No artists match your search.</p>}
          </div>
        )}
        {selectedTab === 'venues' && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVenues.length ? filteredVenues.map(v => (
              <div key={v.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Bangers, cursive' }}>{v.name}</h3>
                <p className="text-sm text-gray-600">{v.upcomingCount} upcoming shows</p>
              </div>
            )) : <p className="text-sm text-gray-600">No venues match your search.</p>}
          </div>
        )}
        {/* Only display popular strips on the homepage (events tab) */}
        {selectedTab === 'events' && (
          <>
            <EntityStrip title="Popular Venues" items={popularVenues} />
            <EntityStrip title="Popular Artists" items={popularArtists} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}