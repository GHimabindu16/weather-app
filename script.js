
const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const weatherInfo = document.getElementById("weatherInfo");

function getCondition(code) {
  if (code === 0) return ["Clear sky", "☀️"];
  if ([1, 2].includes(code)) return ["Mostly clear", "🌤️"];
  if (code === 3) return ["Cloudy", "☁️"];
  if ([45, 48].includes(code)) return ["Foggy", "🌫️"];
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return ["Rainy", "🌧️"];
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return ["Snowy", "❄️"];
  if ([95, 96, 99].includes(code))
    return ["Thunderstorm", "⛈️"];

  return ["Weather conditions unavailable", "🌡️"];
}

async function getWeather(city) {
  weatherInfo.hidden = true;
  message.textContent = "Loading weather...";

  try {
    const geoUrl = new URL(
      "https://geocoding-api.open-meteo.com/v1/search"
    );

    geoUrl.search = new URLSearchParams({
      name: city,
      count: "1",
      language: "en",
      format: "json"
    });

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) throw new Error("Could not search city.");

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please check the spelling.");
    }

    const place = geoData.results[0];

    const weatherUrl = new URL(
      "https://api.open-meteo.com/v1/forecast"
    );

    weatherUrl.search = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
      timezone: "auto"
    });

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) throw new Error("Weather data unavailable.");

    const data = await weatherResponse.json();
    const current = data.current;
    const [condition, icon] = getCondition(current.weather_code);

    document.getElementById("cityName").textContent =
      `${place.name}${place.country ? ", " + place.country : ""}`;

    document.getElementById("weatherIcon").textContent =
      current.is_day ? icon : "🌙";

    document.getElementById("temperature").textContent =
      `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("condition").textContent = condition;

    document.getElementById("humidity").textContent =
      `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
      `${current.wind_speed_10m} km/h`;

    weatherInfo.hidden = false;
    message.textContent =
      `Feels like ${Math.round(current.apparent_temperature)}°C`;
  } catch (error) {
    message.textContent =
      error.message || "Unable to load weather. Please try again.";
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city) getWeather(city);
});
