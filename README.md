# CommuteFinder 🚗

A web application that helps college students find optimal rental units based on commute time to their school or workplace.

## Features

- **Location-based Search**: Enter your destination (school, workplace) and find rentals within your preferred radius
- **Real Commute Times**: Get accurate commute estimates using Google Maps API with real traffic data
- **Value Scoring**: Smart algorithm ranks rentals by best value, considering price, space, and commute time
- **Interactive Map**: Browse listings on an interactive map with clickable markers
- **Advanced Filters**: Filter by price, bedrooms, property type, and more
- **Commute Time Optimization**: Set your departure and return times for accurate traffic-based estimates

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with PostGIS (via Supabase)
- **ORM**: Prisma
- **State Management**: Zustand
- **Maps**: Google Maps JavaScript API
- **Rental Data**: RentCast API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for PostgreSQL database)
- Google Cloud account (for Maps API)
- RentCast API key

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database - Supabase PostgreSQL connection string
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# RentCast API
RENTCAST_API_KEY="your_rentcast_api_key_here"

# Google Maps - Client-side key (exposed to browser, restrict by domain)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_client_key_here"

# Google Maps - Server-side key (keep secret, restrict by IP)
GOOGLE_MAPS_SERVER_KEY="your_google_maps_server_key_here"
```

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd alto_1_3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma db push
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Setup

### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Distance Matrix API
   - Geocoding API
   - Places API
4. Create two API keys:
   - **Client-side key**: Restrict to your domains (localhost for dev, your production domain)
   - **Server-side key**: Restrict to your server IPs

### RentCast API

1. Sign up at [RentCast](https://www.rentcast.io/)
2. Subscribe to a plan (~$50/month for production use)
3. Get your API key from the dashboard

### Supabase Database

1. Create a new project at [Supabase](https://supabase.com/)
2. Enable the PostGIS extension:
   ```sql
   create extension if not exists postgis;
   ```
3. Copy your connection string from Project Settings > Database

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── listings/      # Rental listings endpoint
│   │   ├── commute/       # Commute calculation endpoint
│   │   └── geocode/       # Geocoding endpoint
│   ├── results/           # Search results page
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── search/            # Search-related components
│   ├── map/               # Map components
│   └── listings/          # Listing display components
├── lib/                   # Utility functions and API clients
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state management
└── types/                 # TypeScript type definitions
```

## Value Score Algorithm

The value score considers:
1. **Price per square foot** (normalized)
2. **Commute time** (heavily weighted - each minute adds to score)
3. **Bedrooms** (more bedrooms = better value)

Lower score = better value. Ratings:
- **Excellent**: Score < 50
- **Good**: Score 50-75
- **Fair**: Score 75-100
- **Poor**: Score > 100

## API Cost Optimization

- Aggressive caching of commute times in database
- Batch requests to Google Distance Matrix API (25 origins per request)
- 7-day cache expiry for commute data
- Pre-filtering by radius before API calls

## License

MIT
