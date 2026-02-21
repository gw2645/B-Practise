"""
Main entry point for the Bandacious web application.

This module defines a FastAPI application configured to serve a server‑rendered
homepage using Jinja2 templates.  The application exposes a single route
(`"/"`) which renders the landing page described in the Bandacious Business
& Technical Design Plan (MVP).  The homepage prioritises accessibility,
performance and clarity, with no client‑side SPA or heavy JavaScript
frameworks.  Interactive functionality (such as map geolocation) is handled
via a small script under ``static/js/main.js`` and HTMX can be layered on
gradually for progressive enhancement.

The application is intentionally simple: it does not include accounts,
profiles or event management modules.  Those modules would live under
separate packages (e.g., ``bandacious_app.accounts``) and expose their own
routers.  Here we focus solely on the landing page for the MVP.

This file is production ready but can be extended as the project grows.
"""

import os
from datetime import date
from pathlib import Path
from typing import List

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Base directory for templates and static assets.  Using ``Path(__file__).parent``
# makes the code resilient when packaged or run from another working directory.
BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="Bandacious", docs_url=None, redoc_url=None)

# Configure Jinja2 templates.  Templates are stored in ``bandacious_app/templates``.
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Mount static assets (CSS, JS, images).  These will be served at ``/static``.
app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "static"), html=False),
    name="static",
)


def _get_placeholder_events() -> List[dict]:
    """Return a list of placeholder events for the homepage.

    Each event is represented as a dictionary with a date (ISO string), venue name,
    artist name and location.  In a real application these would be fetched
    from the database via the events module.  Having explicit defaults keeps
    the homepage functional while the rest of the system is under development.
    """
    return [
        {
            "date": date.today().strftime("%d %b"),
            "venue": "The Red Lion",
            "artist": "The Electric Spiders",
            "location": "London",
        },
        {
            "date": (date.today().replace(day=max(date.today().day, 5))).strftime("%d %b"),
            "venue": "Camden Club",
            "artist": "DJ Nightshade",
            "location": "Camden, London",
        },
        {
            "date": (date.today().replace(day=max(date.today().day, 12))).strftime("%d %b"),
            "venue": "The Junction",
            "artist": "Amy & The Aces",
            "location": "Bristol",
        },
    ]


def _get_placeholder_artists() -> List[dict]:
    """Return a list of placeholder featured BADs for the homepage.

    Each dictionary represents an artist with a name, image path, rating and
    genre tag.  These placeholders are useful during development; replace
    them with real data from the profiles module when available.
    """
    return [
        {
            "name": "Echoes of Avalon",
            "image_url": "/static/img/placeholder_bad.png",
            "rating": 4.8,
            "genre": "Rock",
        },
        {
            "name": "Sonic Bloom",
            "image_url": "/static/img/placeholder_bad.png",
            "rating": 4.5,
            "genre": "Pop",
        },
        {
            "name": "Neon Vibes",
            "image_url": "/static/img/placeholder_bad.png",
            "rating": 4.9,
            "genre": "EDM",
        },
        {
            "name": "Blues Horizon",
            "image_url": "/static/img/placeholder_bad.png",
            "rating": 4.6,
            "genre": "Blues",
        },
    ]


@app.get("/", response_class=HTMLResponse)
async def read_home(request: Request) -> HTMLResponse:
    """Render the Bandacious homepage.

    This view gathers placeholder data for upcoming events and featured BADs,
    retrieves the Google Maps API key from the environment (if present) and
    passes these values into the Jinja2 template.  The `request` object is
    mandatory for Jinja2 templates so that we can use the built‑in url_for
    helper within the template.
    """
    events = _get_placeholder_events()
    artists = _get_placeholder_artists()
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    return templates.TemplateResponse(
        "home.html",
        {
            "request": request,
            "events": events,
            "artists": artists,
            "google_maps_api_key": google_maps_api_key,
        },
    )
