# CivicSense

San Francisco has thousands of open 311 cases at any given moment — potholes, graffiti, illegal dumping, broken streetlights — but the city's own tools make it hard to see what's actually happening in your neighborhood.

CivicSense is a community platform that makes urban issues in SF visible and actionable. It pulls live data from the official SF 311 system and layers it on an interactive map, so anyone can see what problems are open nearby, how long they've been sitting, and whether anything is actually getting resolved.

Beyond browsing, residents can report problems themselves by snapping a photo. AI analyzes the image, identifies the issue type, and drafts a report — making it faster to flag something than filling out a 311 form by hand.

## What you can do

**Explore the map** — see every open 311 case and community report near you, color-coded by category. Switch to heatmap mode to see where problems cluster over time.

**Browse the feed** — scroll through nearby issues sorted by how close they are, how long they've been open, or how recently they were updated. A case open for 200+ days hits differently when you can see it on a map.

**Get a neighborhood summary** — select any SF neighborhood and get an AI-generated overview: which issues dominate, which streets keep showing up, and how long the oldest cases have been waiting.

**Report an issue** — take a photo, drop a pin, and let AI do the rest. It reads the image, categorizes the problem, assesses severity, and generates a draft report ready to submit.

**Track your reports** — see everything you've submitted and the AI analysis behind each one.

## Built with

Next.js · FastAPI · PostgreSQL + PostGIS · Google Maps · Gemini 3.1 Flash · Firebase Auth · Redis · Docker

## Running locally

```bash
docker compose up --build
```

The app expects a few environment files:
- `backend/.env` — database, Redis, GCP project, Google Maps API key, Firebase credentials path
- `frontend/.env.local` — Firebase web config, Google Maps browser key, API base URL

See the respective `.env.example` files for the full list of required variables.
