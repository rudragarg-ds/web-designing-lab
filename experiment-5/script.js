const cityInput = document.getElementById("cityInput");
const weatherForm = document.getElementById("weatherForm");

const locationElement = document.getElementById("location");
const conditionElement = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");

const temperatureElement = document.getElementById("temperature");
const feelsLikeElement = document.getElementById("feelsLike");

const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const precipitationElement = document.getElementById("precipitation");

const forecastElement = document.getElementById("forecast");
const statusMessage = document.getElementById("statusMessage");


// Indian states and their capitals

const states = {
    "andhra pradesh": "Amaravati",
    "arunachal pradesh": "Itanagar",
    "assam": "Dispur",
    "bihar": "Patna",
    "chhattisgarh": "Raipur",
    "goa": "Panaji",
    "gujarat": "Gandhinagar",
    "haryana": "Chandigarh",
    "himachal pradesh": "Shimla",
    "jharkhand": "Ranchi",
    "karnataka": "Bengaluru",
    "kerala": "Thiruvananthapuram",
    "madhya pradesh": "Bhopal",
    "maharashtra": "Mumbai",
    "manipur": "Imphal",
    "meghalaya": "Shillong",
    "mizoram": "Aizawl",
    "nagaland": "Kohima",
    "odisha": "Bhubaneswar",
    "punjab": "Chandigarh",
    "rajasthan": "Jaipur",
    "sikkim": "Gangtok",
    "tamil nadu": "Chennai",
    "telangana": "Hyderabad",
    "tripura": "Agartala",
    "uttar pradesh": "Lucknow",
    "uttarakhand": "Dehradun",
    "west bengal": "Kolkata"
};


// Weather description

function getWeatherDescription(code) {

    if (code === 0) {
        return "Clear sky";
    }

    if (code === 1 || code === 2) {
        return "Partly cloudy";
    }

    if (code === 3) {
        return "Cloudy";
    }

    if (code >= 51 && code <= 67) {
        return "Rain";
    }

    if (code >= 71 && code <= 77) {
        return "Snow";
    }

    if (code >= 80 && code <= 82) {
        return "Rain showers";
    }

    if (code >= 95) {
        return "Thunderstorm";
    }

    return "Unknown";
}


// Weather icon

function getWeatherIcon(code) {

    if (code === 0) {
        return "☀";
    }

    if (code === 1 || code === 2) {
        return "⛅";
    }

    if (code === 3) {
        return "☁";
    }

    if (code >= 51 && code <= 67) {
        return "🌧";
    }

    if (code >= 71 && code <= 77) {
        return "❄";
    }

    if (code >= 80 && code <= 82) {
        return "🌦";
    }

    if (code >= 95) {
        return "⛈";
    }

    return "☁";
}


// Show forecast

function showForecast(data) {

    forecastElement.innerHTML = "";

    for (let i = 0; i < data.time.length; i++) {

        const date = new Date(data.time[i]);

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const forecastDay = document.createElement("div");

        forecastDay.className = "forecast-day";

        forecastDay.innerHTML = `
            <strong>${day}</strong>

            <div class="forecast-icon">
                ${getWeatherIcon(data.weather_code[i])}
            </div>

            <p class="high">
                ${Math.round(data.temperature_2m_max[i])}°
            </p>

            <p class="low">
                ${Math.round(data.temperature_2m_min[i])}°
            </p>
        `;

        forecastElement.appendChild(forecastDay);
    }
}


// Main weather function

weatherForm.addEventListener("submit", function(event) {

    event.preventDefault();

    let city = cityInput.value.trim();

    if (city === "") {
        return;
    }


    // Check whether the user entered a state

    const stateName = city.toLowerCase();

    if (states[stateName]) {
        city = states[stateName];
    }


    statusMessage.textContent = "Loading weather...";


    // First API call: find the city

    const locationUrl =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(city)}` +
        `&count=1` +
        `&language=en` +
        `&format=json` +
        `&countryCode=IN`;


    fetch(locationUrl)

        .then(function(response) {
            return response.json();
        })

        .then(function(data) {

            if (!data.results || data.results.length === 0) {
                throw new Error("Location not found");
            }


            const location = data.results[0];


            // Second API call: get weather

            const weatherUrl =
                `https://api.open-meteo.com/v1/forecast` +
                `?latitude=${location.latitude}` +
                `&longitude=${location.longitude}` +
                `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
                `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
                `&forecast_days=7` +
                `&timezone=auto`;


            return fetch(weatherUrl);
        })

        .then(function(response) {
            return response.json();
        })

        .then(function(data) {

            const weather = data.current;


            locationElement.textContent =
                `${city}, India`;


            conditionElement.textContent =
                getWeatherDescription(weather.weather_code);


            weatherIcon.textContent =
                getWeatherIcon(weather.weather_code);


            temperatureElement.textContent =
                Math.round(weather.temperature_2m);


            feelsLikeElement.textContent =
                `Feels like ${Math.round(weather.apparent_temperature)}°C`;


            humidityElement.textContent =
                `${Math.round(weather.relative_humidity_2m)}%`;


            windElement.textContent =
                `${Math.round(weather.wind_speed_10m)} km/h`;


            precipitationElement.textContent =
                `${weather.precipitation} mm`;


            showForecast(data.daily);


            statusMessage.textContent =
                `Updated for ${data.timezone}`;
        })

        .catch(function(error) {

            locationElement.textContent =
                "Weather unavailable";

            conditionElement.textContent =
                error.message;

            weatherIcon.textContent =
                "⚠";

            temperatureElement.textContent =
                "--";

            feelsLikeElement.textContent =
                "Try another location";

            humidityElement.textContent =
                "--%";

            windElement.textContent =
                "-- km/h";

            precipitationElement.textContent =
                "-- mm";

            forecastElement.innerHTML = "";

            statusMessage.textContent = "";
        });

});