export interface WeatherData {
  temperature: number;
  humidity: number;
  time: string;
}

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m&current_weather=true&timezone=auto`,
      {
        signal: controller.signal,
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Get current hour index
    const now = new Date();
    const currentHourIndex = now.getHours();

    return {
      temperature: data.current_weather.temperature,
      humidity: data.hourly.relative_humidity_2m[currentHourIndex],
      time: now.toLocaleTimeString()
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Weather API request timed out');
    }
    throw error;
  }
} 