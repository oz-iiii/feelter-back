import { NextResponse } from "next/server";
import { movieService } from "@/lib/services/movieService";

export async function GET() {
  try {
    console.log("📊 Raw data from Supabase: fetching movies...");
    const movies = await movieService.getAllMovies();
    console.log(`📊 Raw data from Supabase: ${movies.length} rows`);
    
    if (movies.length > 0) {
      console.log("📋 First row columns:", Object.keys(movies[0]));
    }
    
    console.log(`✅ API: Successfully fetched movies from Supabase: ${movies.length}`);
    return NextResponse.json({ 
      success: true, 
      data: movies, 
      count: movies.length 
    });
  } catch (error) {
    console.error("🚨 API: Failed to fetch movies:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch movies",
        count: 0 
      },
      { status: 500 }
    );
  }
}