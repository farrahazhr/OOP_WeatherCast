const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const apiKey = "32804b24a847407391c53709241010";

// Compare location
const cityA = document.querySelector(".cityA");
const cityB = document.querySelector(".cityB");
const compareBtn = document.querySelector(".compareBtn");
const compareResult = document.querySelector(".compareResult");

weatherForm.addEventListener("submit", async event => {

  event.preventDefault();

  const city = cityInput.value;
  // if city is entered, fetch weather data
  if(city){
    try{
      const weatherData = await getweatherData(city);
      displayWeatherInfo(weatherData);
    }
    catch(error){
      console.error(error);
      displayError(error.message);
    }
  }
  else{
    displayError("Please enter location")
  }

});

// function compare button click (cityA vs cityB)
compareBtn.addEventListener("click", async () => {
  const a = cityA.value.trim();
  const b = cityB.value.trim(); // trim is to removes extra spaces

  // ensure both has input
  if (!a || !b) {
    compareResult.innerHTML = `<p>Please enter both City A and City B.</p>`;
    return;
  }

  try { // fetch weather for both cities
    const dataA = await getData(a);
    const dataB = await getData(b);

    // check outdoor suitability
    const checkA = outdoorCheck(dataA);
    const checkB = outdoorCheck(dataB);

    let win = "";

    // decide which city is better
    if (checkA.ok && !checkB.ok) win = dataA.location.name;
    else if (!checkA.ok && checkB.ok) win = dataB.location.name;
    else win = checkA.rain < checkB.rain ? dataA.location.name : dataB.location.name;

    // display result
    compareResult.innerHTML = `
      <p><b>${dataA.location.name}</b>: ${checkA.msg}</p>
      <p><b>${dataB.location.name}</b>: ${checkB.msg}</p>
      <hr>
      <p><b>Better for outdoor today:</b> ${win}</p>
    `;
  } catch (err) {
    compareResult.innerHTML = `<p>Error: ${err.message}</p>`;
  }
});

// fetch data for get weather form
async function getweatherData(city) {
  
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1`;

  const response = await fetch(apiUrl);

  if (!response.ok) { // error if city not found
    throw new Error("City not found");
  }

  const data = await response.json();
  console.log(data);
  return data;
}

function displayWeatherInfo(data){ // display data

    card.textContent = "";
    card.style.display = "flex";

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");

    // set weather values
    cityDisplay.textContent = `${data.location.name}, ${data.location.country}`;
    tempDisplay.textContent = `${data.current.temp_c}°C`;
    humidityDisplay.textContent = `Humidity: ${data.current.humidity}%`;
    descDisplay.textContent = data.current.condition.text;

    // change background image based on weather condition
    const condition = data.current.condition.text.toLowerCase();

    if(condition.includes("rain")){
        card.style.backgroundImage = "url('./Images/rain.jpg')";
    }
    else if(condition.includes("cloud")){
        card.style.backgroundImage = "url('./Images/cloudy.jpg')";
    }
    else if(condition.includes("fog") || condition.includes("mist")){
        card.style.backgroundImage = "url('./Images/foggysky.jpg')";
    }
    else if(condition.includes("snow")){
        card.style.backgroundImage = "url('./Images/snow.jpg')";
    }
    else if(condition.includes("storm") || condition.includes("thunder")){
        card.style.backgroundImage = "url('./Images/storm.jpg')";
    }
    else{
        card.style.backgroundImage = "url('./Images/sunny.jpg')";
    }

    // styling
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";
    card.style.backgroundRepeat = "no-repeat";

    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");

    card.appendChild(cityDisplay);
    card.appendChild(tempDisplay);
    card.appendChild(humidityDisplay);
    card.appendChild(descDisplay);

    if(!data.forecast) return;
    const hours = data.forecast.forecastday[0].hour;

    // calculate Average temp
    let total = 0;
    hours.forEach(h => total += h.temp_c);
    const avgTemp = (total / hours.length).toFixed(1);

    // Rain risk
    const rainy = hours.filter(h => h.chance_of_rain >= 60).length;

    // determine rain risk level
    let risk = "Low";
    if(rainy >= 8) risk = "High";
    else if(rainy >= 3) risk = "Medium";

    // suggest activity
    let suggestion = "Outdoor";

    if(risk === "High" || avgTemp >= 32){
        suggestion = "Indoor";
    }

    // display summary
    document.getElementById("avgTemp").textContent =
    `Average Temp: ${avgTemp}°C`;

    document.getElementById("rainRisk").textContent =
    `Rain Risk: ${risk}`;

    document.getElementById("activitySuggest").textContent =
    `Recommended: ${suggestion}`;

    document.getElementById("summaryBox").style.display = "block";
    
    localStorage.setItem("weatherCondition", data.current.condition.text);
    localStorage.setItem("avgTemp", avgTemp);
    localStorage.setItem("rainRisk", risk);
    localStorage.setItem("suggestionType", suggestion); // "Indoor" / "Outdoor"

    renderRecommendedActivities(suggestion);
}

function renderRecommendedActivities(suggestionType){
  const listEl = document.getElementById("recommendedList");
  if(!listEl) return;

  const activities = JSON.parse(localStorage.getItem("activities")) || [];

  const filtered = activities.filter(a => a.type === suggestionType);

  listEl.innerHTML = "";

  if(filtered.length === 0){
    listEl.innerHTML = `<li>No saved ${suggestionType} activities yet. Add some in Activity Manager.</li>`;
    return;
  }

  // pick 3 suggested activity only
  // use math random function to suggested activities randomly
  const shuffled = filtered.sort(() => 0.5 - Math.random()); 
    shuffled.slice(0,3).forEach(a => {
      const li = document.createElement("li");
        li.textContent = a.name;
        listEl.appendChild(li);
  });
}

// to display error message
function displayError(message){
  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.classList.add("errorDisplay");

  card.textContent = ""; // clear content inside box
  card.style.display = "flex";
  card.appendChild(errorDisplay); // append error message into card

  document.getElementById("avgTemp").textContent = "";
  document.getElementById("rainRisk").textContent = "";
  document.getElementById("activitySuggest").textContent = "";

  const listEl = document.getElementById("recommendedList");
  if(listEl) listEl.innerHTML = "";
    document.getElementById("summaryBox").style.display = "none";

  card.style.backgroundImage = "none";
  card.style.backgroundColor = "";      
  card.style.backgroundBlendMode = "";  

  localStorage.removeItem("weatherCondition");
}

// fetch weather for comparison features
async function getData(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`City not found: ${city}`);
  return await res.json();
}

// check outdoor suitability
function outdoorCheck(data) {
  const day = data.forecast.forecastday[0].day;

  const temp = day.avgtemp_c;
  const rain = day.daily_chance_of_rain ?? 0;

  let ok = true;
  let reason = "Suitable";

  if (rain >= 60) {
    ok = false;
    reason = "Not suitable - high chance of rain";
  } else if (temp > 33) {
    ok = false;
    reason = "Not suitable - hot weather";
  }

  // display temp + rain data
  const msg = `${reason}. Temp ${temp}°C, Rain ${rain}%`;

  return { ok, rain, temp, msg };
}