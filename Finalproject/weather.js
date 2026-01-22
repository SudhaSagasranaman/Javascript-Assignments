const API_KEY = "EJ6UBL2JEQGYB3AA4ENASN62J";
let weatherData = null;

let currentUnit = "C"; // default Celsius

const assets = {
  "partly-cloudy-day": { icon: "https://i.ibb.co/PZQXH8V/27.png", bg: "https://i.ibb.co/qNv7NxZ/pc.webp" },
  "partly-cloudy-night": { icon: "https://i.ibb.co/Kzkk59k/15.png", bg: "https://i.ibb.co/RDfPqXz/pcn.jpg" },
  "rain": { icon: "https://i.ibb.co/kBd2NTS/39.png", bg: "https://i.ibb.co/h2p6Yhd/rain.webp" },
  "clear-day": { icon: "https://i.ibb.co/rb4rrJL/26.png", bg: "https://i.ibb.co/WGry01m/cd.jpg" },
  "clear-night": { icon: "https://i.ibb.co/1nxNGHL/10.png", bg: "https://i.ibb.co/kqtZ1Gx/cn.jpg" },
  "default": { icon: "https://i.ibb.co/rb4rrJL/26.png", bg: "https://i.ibb.co/qNv7NxZ/pc.webp" }
};

/* FETCH */
function fetchWeather(city) {
  const unitGroup = currentUnit === "C" ? "metric" : "us";

  fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=${unitGroup}&key=${API_KEY}&contentType=json`)
    .then(res => res.json())
    .then(data => {
      weatherData = data;
      updateLeft(data);
      renderHourly(data.days[0].hours);
      updateHighlights(data);
    })
    .catch(() => alert("Invalid city"));
}

/* LEFT PANEL */
function updateLeft(data) {
  const c = data.currentConditions;
  const a = assets[c.icon] || assets.default;

  app.style.backgroundImage = `url(${a.bg})`;
  weatherIcon.src = a.icon;

  temp.textContent = Math.round(c.temp) + (currentUnit === "C" ? "°C" : "°F");
  condition.textContent = c.conditions;
  city.textContent = data.resolvedAddress;

  dateTime.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* HIGHLIGHTS */
function updateHighlights(data) {
  const c = data.currentConditions;

  // Today view
  uv.textContent = c.uvindex ?? "--";
  wind.textContent = c.windspeed ?? "--";
  humidity.textContent = c.humidity ?? "--";
  visibility.textContent = c.visibility ?? "--";
  air.textContent = c.aqi ?? "Good";

  sunrise.textContent = c.sunrise ?? "--";
  sunset.textContent = c.sunset ?? "--";

  // Week view (same values)
  uv2.textContent = c.uvindex ?? "--";
  wind2.textContent = c.windspeed ?? "--";
  humidity2.textContent = c.humidity ?? "--";
  visibility2.textContent = c.visibility ?? "--";
  air2.textContent = c.aqi ?? "Good";

  sunrise2.textContent = c.sunrise ?? "--";
  sunset2.textContent = c.sunset ?? "--";
}

/* HOURLY */
function renderHourly(hours) {
  hourlyForecast.innerHTML = "";

  // show only 12 cards for clean UI
  hours.slice(0, 12).forEach(h => {
    const a = assets[h.icon] || assets.default;

    const hour24 = parseInt(h.datetime.split(":")[0]);
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    const timeLabel = `${hour12.toString().padStart(2, "0")}:00 ${period}`;

    hourlyForecast.innerHTML += `
      <div class="col-6 col-md-2">
        <div class="card">
          <strong>${timeLabel}</strong><br>
          <img src="${a.icon}" width="40"><br>
          ${Math.round(h.temp)}${currentUnit === "C" ? "°C" : "°F"}
        </div>
      </div>
    `;
  });
}

/* WEEK */
function renderWeek(days) {
  weeklyForecast.innerHTML = "";

  days.slice(0, 7).forEach(day => {
    const asset = assets[day.icon] || assets.default;

    const dateObj = new Date(day.datetime);
    const weekDay = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    weeklyForecast.innerHTML += `
      <div class="weekly-card">
        <strong>${weekDay}</strong><br>
        <img src="${asset.icon}" width="40"><br>
        ${Math.round(day.temp)}${currentUnit === "C" ? "°C" : "°F"}
      </div>
    `;
  });
}

/* TABS */
todayTab.onclick = () => {
  todayView.classList.remove("d-none");
  weekView.classList.add("d-none");
  todayTab.classList.add("active");
  weekTab.classList.remove("active");
};

weekTab.onclick = () => {
  todayView.classList.add("d-none");
  weekView.classList.remove("d-none");
  weekTab.classList.add("active");
  todayTab.classList.remove("active");

  if (weatherData) renderWeek(weatherData.days);
};

/* serach */
searchBtn.onclick = () => {
  if (cityInput.value.trim()) fetchWeather(cityInput.value.trim());
};

cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") searchBtn.click();
});

/* UNIT BUTTONS */
cBtn.onclick = () => {
  currentUnit = "C";
  cBtn.classList.add("active");
  fBtn.classList.remove("active");

  if (cityInput.value.trim()) fetchWeather(cityInput.value.trim());
  else fetchWeather("Bangalore");
};

fBtn.onclick = () => {
  currentUnit = "F";
  fBtn.classList.add("active");
  cBtn.classList.remove("active");

  if (cityInput.value.trim()) fetchWeather(cityInput.value.trim());
  else fetchWeather("Bangalore");
};

/* D */
fetchWeather("Bangalore");
