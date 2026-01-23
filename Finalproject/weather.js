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

/* ffetch */
function fetchWeather(city) {

  let unitGroup = "metric";   // Celsius
  if (currentUnit === "F") {
    unitGroup = "us";         // Fahrenheit
  }

  // API URL
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=${unitGroup}&key=${API_KEY}&contentType=json`;

  // Fetching data from API
  fetch(url)
    .then((res) => res.json())
    .then((data) => {

      weatherData = data;

      updateLeft(data);

      // update hourly forecast
      renderHourly(data.days[0].hours);

      // updating highlights
      updateHighlights(data);

    
      // If user is in Week tab, update Week forecast also
      const isWeekTabOpen = !weekView.classList.contains("d-none");
      if (isWeekTabOpen) {
        renderWeek(data.days);
      }
    })
    .catch(() => alert("Invalid city"));
}

/* left panelL */
function updateLeft(data) {

  const current = data.currentConditions;

  const weatherAsset = assets[current.icon] || assets.default;

  app.style.backgroundImage = "url(" + weatherAsset.bg + ")";
  weatherIcon.src = weatherAsset.icon;

  let unitSymbol = "°C";
  if (currentUnit === "F") {
    unitSymbol = "°F";
  }
  temp.textContent = Math.round(current.temp) + unitSymbol;

  condition.textContent = current.conditions;
  city.textContent = data.resolvedAddress;

  const todayDate = new Date();
  dateTime.textContent = todayDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* highlight */
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

/* hourly */
function renderHourly(hours) {

  hourlyForecast.innerHTML = "";

  const first12Hours = hours.slice(0, 12);

  first12Hours.forEach(function (hourData) {

    const iconData = assets[hourData.icon] || assets.default;

    const hourPart = hourData.datetime.split(":")[0];  // "13"
    const hour24 = Number(hourPart);                   // 13

    let period = "AM";
    if (hour24 >= 12) {
      period = "PM";
    }

    let hour12 = hour24 % 12;
    if (hour12 === 0) {
      hour12 = 12;
    }

    let hourText = hour12.toString().padStart(2, "0");

    const timeLabel = hourText + ":00 " + period;

    let unitSymbol = "°C";
    if (currentUnit === "F") {
      unitSymbol = "°F";
    }

    const oneCard = `
      <div class="col-6 col-md-2">
        <div class="card">
          <strong>${timeLabel}</strong><br>
          <img src="${iconData.icon}" width="40"><br>
          ${Math.round(hourData.temp)}${unitSymbol}
        </div>
      </div>
    `;

    hourlyForecast.innerHTML += oneCard;
  });
}

/* render week*/
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

/* tabs */
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

/* unit btns */
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
