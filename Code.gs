/**
 * DAILY WEATHER ALERT SYSTEM
 * Google Apps Script backend
 *
 * Files required:
 *   - Code.gs
 *   - Index.html
 *
 * IMPORTANT:
 * Store API credentials in:
 * Apps Script → Project Settings → Script Properties
 *
 * Required properties:
 *   OPENWEATHER_API_KEY
 *   YOUR_EMAIL
 *   PHONE_NUMBER
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER
 *
 * Optional:
 *   LAT
 *   LON
 */


// ============================================================
// WEB APP
// ============================================================

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("Index")
    .setTitle("Daily Weather Alert System")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


// ============================================================
// CONFIGURATION
// ============================================================

function getConfig_() {
  const properties = PropertiesService.getScriptProperties();

  return {
    apiKey: properties.getProperty("OPENWEATHER_API_KEY"),

    lat: properties.getProperty("LAT") || "23.128853",
    lon: properties.getProperty("LON") || "72.544756",

    email: properties.getProperty("YOUR_EMAIL"),

    phoneNumber: properties.getProperty("PHONE_NUMBER"),

    twilioAccountSid:
      properties.getProperty("TWILIO_ACCOUNT_SID"),

    twilioAuthToken:
      properties.getProperty("TWILIO_AUTH_TOKEN"),

    twilioPhoneNumber:
      properties.getProperty("TWILIO_PHONE_NUMBER")
  };
}


// ============================================================
// WEATHER DATA FOR LIVE WEB DASHBOARD
// ============================================================

function getWeatherData() {

  const config = getConfig_();

  if (!config.apiKey) {
    throw new Error(
      "OpenWeather API key is not configured. " +
      "Add OPENWEATHER_API_KEY in Script Properties."
    );
  }

  const weatherUrl =
    "https://api.openweathermap.org/data/2.5/forecast" +
    "?lat=" + encodeURIComponent(config.lat) +
    "&lon=" + encodeURIComponent(config.lon) +
    "&appid=" + encodeURIComponent(config.apiKey) +
    "&units=metric";

  const response = UrlFetchApp.fetch(weatherUrl, {
    method: "get",
    muteHttpExceptions: true
  });

  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode !== 200) {
    throw new Error(
      "OpenWeather API error (" +
      responseCode +
      "): " +
      responseText
    );
  }

  const weatherData = JSON.parse(responseText);

  if (!weatherData.list || weatherData.list.length === 0) {
    throw new Error("No weather forecast data was returned.");
  }

  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowDateStr =
    Utilities.formatDate(
      tomorrow,
      Session.getScriptTimeZone() || "Asia/Kolkata",
      "yyyy-MM-dd"
    );


  // ----------------------------------------------------------
  // Find tomorrow's 12 PM and 6 PM forecasts
  // ----------------------------------------------------------

  let forecasts = [];

  let tempMin = Infinity;
  let tempMax = -Infinity;

  let humidityTotal = 0;
  let windTotal = 0;

  let rainTotal = 0;

  let forecastCount = 0;


  weatherData.list.forEach(function(forecast) {

    const forecastParts = forecast.dt_txt.split(" ");

    const forecastDate = forecastParts[0];

    const forecastHour =
      parseInt(
        forecastParts[1].substring(0, 2),
        10
      );


    if (
      forecastDate === tomorrowDateStr &&
      (forecastHour === 12 || forecastHour === 18)
    ) {

      const currentTemp = forecast.main.temp;

      tempMin =
        Math.min(tempMin, currentTemp);

      tempMax =
        Math.max(tempMax, currentTemp);


      humidityTotal +=
        forecast.main.humidity;


      windTotal +=
        forecast.wind.speed;


      if (
        forecast.rain &&
        forecast.rain["3h"]
      ) {
        rainTotal +=
          forecast.rain["3h"];
      }


      forecastCount++;


      forecasts.push({

        time:
          forecastParts[1].substring(0, 5),

        hour:
          forecastHour,

        temp:
          Math.round(currentTemp),

        feels_like:
          Math.round(
            forecast.main.feels_like
          ),

        weather:
          forecast.weather[0].main,

        description:
          forecast.weather[0].description,

        humidity:
          forecast.main.humidity,

        wind:
          Math.round(
            forecast.wind.speed * 3.6
          ),

        pop:
          forecast.pop
            ? Math.round(
                forecast.pop * 100
              )
            : 0
      });
    }
  });


  // ----------------------------------------------------------
  // Fallback if 12 PM / 6 PM data isn't available
  // ----------------------------------------------------------

  if (forecastCount === 0) {

    throw new Error(
      "Tomorrow's 12 PM / 6 PM forecast data " +
      "is currently unavailable."
    );
  }


  // ----------------------------------------------------------
  // Calculate averages
  // ----------------------------------------------------------

  const avgHumidity =
    Math.round(
      humidityTotal / forecastCount
    );


  const avgWind =
    Math.round(
      (windTotal / forecastCount) * 3.6
    );


  const tempAvg =
    Math.round(
      (tempMin + tempMax) / 2
    );


  // ----------------------------------------------------------
  // Weather alert
  // ----------------------------------------------------------

  let alert = null;

  if (tempMax > 40) {

    alert = {
      level: "danger",

      title: "Extreme Heat Warning",

      message:
        "Extreme heat expected tomorrow. " +
        "Avoid prolonged outdoor activity."
    };

  } else if (tempMax > 35) {

    alert = {
      level: "warning",

      title: "High Temperature",

      message:
        "High temperatures are expected tomorrow. " +
        "Stay hydrated and avoid excessive outdoor exposure."
    };

  }


  // ----------------------------------------------------------
  // Clothing recommendation
  // ----------------------------------------------------------

  let clothing =
    "Light breathable clothing";


  if (tempMax < 20) {

    clothing =
      "Jacket or sweater";

  }


  if (tempMax < 10) {

    clothing =
      "Heavy jacket, gloves and hat";

  }


  // ----------------------------------------------------------
  // General recommendation
  // ----------------------------------------------------------

  let recommendation =
    "Normal outdoor activities should be comfortable.";


  if (tempMax > 35) {

    recommendation =
      "Avoid outdoor activities between 11 AM and 4 PM.";

  }


  // ----------------------------------------------------------
  // Return data to Index.html
  // ----------------------------------------------------------

  return {

    success: true,

    location: {
      city: "Ahmedabad",
      country: "India"
    },

    date:
      Utilities.formatDate(
        tomorrow,
        Session.getScriptTimeZone() || "Asia/Kolkata",
        "EEEE, MMMM d, yyyy"
      ),

    temperature: {
      min: Math.round(tempMin),
      max: Math.round(tempMax),
      average: tempAvg
    },

    humidity:
      avgHumidity,

    wind:
      avgWind,

    rain:
      Math.round(rainTotal * 10) / 10,

    clothing:
      clothing,

    recommendation:
      recommendation,

    alert:
      alert,

    forecasts:
      forecasts,

    updatedAt:
      new Date().toISOString()
  };
}


// ============================================================
// AUTOMATED DAILY EMAIL + SMS
// ============================================================

function checkWeatherAndSendAlert() {

  try {

    const config = getConfig_();

    if (!config.apiKey) {
      throw new Error(
        "OPENWEATHER_API_KEY is not configured."
      );
    }


    if (!config.email) {
      throw new Error(
        "YOUR_EMAIL is not configured."
      );
    }


    // --------------------------------------------------------
    // Fetch weather
    // --------------------------------------------------------

    const weatherUrl =
      "https://api.openweathermap.org/data/2.5/forecast" +
      "?lat=" + encodeURIComponent(config.lat) +
      "&lon=" + encodeURIComponent(config.lon) +
      "&appid=" + encodeURIComponent(config.apiKey) +
      "&units=metric";


    const weatherResponse =
      UrlFetchApp.fetch(weatherUrl, {
        method: "get",
        muteHttpExceptions: true
      });


    const responseCode =
      weatherResponse.getResponseCode();


    const responseText =
      weatherResponse.getContentText();


    if (responseCode !== 200) {

      throw new Error(
        "OpenWeather API error (" +
        responseCode +
        "): " +
        responseText
      );

    }


    const weatherData =
      JSON.parse(responseText);


    // --------------------------------------------------------
    // Tomorrow
    // --------------------------------------------------------

    const tomorrow = new Date();

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );


    const timezone =
      Session.getScriptTimeZone() ||
      "Asia/Kolkata";


    const tomorrowDateStr =
      Utilities.formatDate(
        tomorrow,
        timezone,
        "yyyy-MM-dd"
      );


    // --------------------------------------------------------
    // Process forecast
    // --------------------------------------------------------

    let forecasts = [];

    let tempMin = Infinity;
    let tempMax = -Infinity;

    let humidityTotal = 0;
    let windTotal = 0;

    let rainTotal = 0;

    let forecastCount = 0;


    weatherData.list.forEach(
      function(forecast) {

        const parts =
          forecast.dt_txt.split(" ");

        const forecastDate =
          parts[0];

        const forecastHour =
          parseInt(
            parts[1].substring(0, 2),
            10
          );


        if (
          forecastDate === tomorrowDateStr &&
          (
            forecastHour === 12 ||
            forecastHour === 18
          )
        ) {

          const currentTemp =
            forecast.main.temp;


          tempMin =
            Math.min(
              tempMin,
              currentTemp
            );


          tempMax =
            Math.max(
              tempMax,
              currentTemp
            );


          humidityTotal +=
            forecast.main.humidity;


          windTotal +=
            forecast.wind.speed;


          if (
            forecast.rain &&
            forecast.rain["3h"]
          ) {

            rainTotal +=
              forecast.rain["3h"];

          }


          forecastCount++;


          forecasts.push({

            time:
              parts[1].substring(0, 5),

            temp:
              Math.round(currentTemp),

            feels_like:
              Math.round(
                forecast.main.feels_like
              ),

            description:
              forecast.weather[0].description,

            wind:
              Math.round(
                forecast.wind.speed * 3.6
              ),

            pop:
              forecast.pop
                ? Math.round(
                    forecast.pop * 100
                  )
                : 0

          });

        }

      }
    );


    if (forecastCount === 0) {

      throw new Error(
        "No forecast data found for tomorrow."
      );

    }


    // --------------------------------------------------------
    // Calculations
    // --------------------------------------------------------

    const avgHumidity =
      Math.round(
        humidityTotal / forecastCount
      );


    const avgWind =
      Math.round(
        (windTotal / forecastCount) * 3.6
      );


    const tempAvg =
      Math.round(
        (tempMin + tempMax) / 2
      );


    // --------------------------------------------------------
    // Alerts
    // --------------------------------------------------------

    let specialMessage = "";

    let smsSpecialMessage =
      "Normal weather expected";


    if (tempMax > 40) {

      specialMessage =
        "IMPORTANT: Extreme heat expected tomorrow " +
        "(maximum " +
        Math.round(tempMax) +
        "°C). Avoid outdoor activities!";


      smsSpecialMessage =
        "EXTREME HEAT: Stay indoors!";

    } else if (tempMax > 35) {

      specialMessage =
        "High temperatures expected tomorrow. " +
        "Stay hydrated and limit outdoor activity.";

      smsSpecialMessage =
        "HIGH HEAT: Stay hydrated!";

    }


    // --------------------------------------------------------
    // Clothing
    // --------------------------------------------------------

    let clothing =
      "Light breathable clothing";


    if (tempMax < 20) {

      clothing =
        "Jacket or sweater";

    }


    if (tempMax < 10) {

      clothing =
        "Heavy jacket, gloves, hat";

    }


    // --------------------------------------------------------
    // Temperature chart
    // --------------------------------------------------------

    const chartConfig = {

      type: "line",

      data: {

        labels:
          forecasts.map(
            function(f) {
              return f.time;
            }
          ),

        datasets: [

          {

            label:
              "Temperature (°C)",

            data:
              forecasts.map(
                function(f) {
                  return f.temp;
                }
              ),

            borderColor:
              "#FF7F00",

            backgroundColor:
              "rgba(255, 127, 0, 0.1)",

            tension: 0.4,

            fill: true

          },

          {

            label:
              "Feels Like (°C)",

            data:
              forecasts.map(
                function(f) {
                  return f.feels_like;
                }
              ),

            borderColor:
              "#800080",

            backgroundColor:
              "rgba(128, 0, 128, 0.1)",

            tension: 0.4,

            fill: false

          }

        ]

      },

      options: {

        responsive: true,

        plugins: {

          legend: {
            position: "top"
          },

          title: {

            display: true,

            text:
              "Temperature Trend"

          }

        }

      }

    };


    const chartUrl =
      "https://quickchart.io/chart?c=" +
      encodeURIComponent(
        JSON.stringify(chartConfig)
      ) +
      "&width=600&height=300&backgroundColor=white";


    // --------------------------------------------------------
    // HTML email
    // --------------------------------------------------------

    let htmlBody = `

      <html>

      <body style="
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f7fb;
        padding: 20px;
      ">

        <div style="
          max-width: 650px;
          margin: auto;
          background: white;
          padding: 30px;
          border-radius: 16px;
        ">

          <h1 style="
            color: #1a73e8;
            border-bottom: 2px solid #1a73e8;
            padding-bottom: 10px;
          ">
            Tomorrow's Weather Forecast
          </h1>


          <p style="
            color: #667085;
          ">
            ${tomorrow.toDateString()}
          </p>


          <div style="
            background: #f8f9fa;
            padding: 18px;
            border-radius: 10px;
          ">

            <p>
              <strong>Location:</strong>
              Ahmedabad, India
            </p>

            <p>
              <strong>Temperature:</strong>
              ${Math.round(tempMin)}°C -
              ${Math.round(tempMax)}°C
            </p>

            <p>
              <strong>Average:</strong>
              ${tempAvg}°C
            </p>

            <p>
              <strong>Humidity:</strong>
              ${avgHumidity}%
            </p>

            <p>
              <strong>Wind:</strong>
              ${avgWind} km/h
            </p>

          </div>


          <div style="
            margin: 25px 0;
            text-align: center;
          ">

            <img
              src="${chartUrl}"
              alt="Temperature Chart"
              style="
                max-width: 100%;
                border-radius: 10px;
              "
            />

          </div>


          <h2 style="
            color: #1a73e8;
          ">
            Forecast
          </h2>


          <table style="
            width: 100%;
            border-collapse: collapse;
          ">

            <thead>

              <tr style="
                background: #f1f3f4;
              ">

                <th style="padding: 10px;">
                  Time
                </th>

                <th style="padding: 10px;">
                  Temp
                </th>

                <th style="padding: 10px;">
                  Feels Like
                </th>

                <th style="padding: 10px;">
                  Conditions
                </th>

                <th style="padding: 10px;">
                  Rain
                </th>

              </tr>

            </thead>


            <tbody>

              ${forecasts.map(function(f) {

                return `

                  <tr>

                    <td style="padding: 10px;">
                      ${f.time}
                    </td>

                    <td style="padding: 10px;">
                      ${f.temp}°C
                    </td>

                    <td style="padding: 10px;">
                      ${f.feels_like}°C
                    </td>

                    <td style="padding: 10px;">
                      ${f.description}
                    </td>

                    <td style="padding: 10px;">
                      ${f.pop}%
                    </td>

                  </tr>

                `;

              }).join("")}

            </tbody>

          </table>


          <h2 style="
            color: #1a73e8;
          ">
            Recommendations
          </h2>


          <ul>

            <li>
              Suggested clothing:
              ${clothing}
            </li>

            ${
              tempMax > 35
                ? `
                  <li>
                    Avoid outdoor activities
                    between 11 AM and 4 PM.
                  </li>

                  <li>
                    Stay hydrated.
                  </li>
                `
                : ""
            }

          </ul>


          ${
            specialMessage
              ? `

                <div style="
                  background: #fce8e6;
                  color: #d93025;
                  padding: 15px;
                  border-radius: 10px;
                  margin-top: 20px;
                  font-weight: bold;
                ">

                  ${specialMessage}

                </div>

              `
              : ""
          }


          <p style="
            text-align: center;
            color: #667085;
            margin-top: 30px;
          ">

            Stay prepared and have a great day!

          </p>

        </div>

      </body>

      </html>

    `;


    // --------------------------------------------------------
    // Plain text email
    // --------------------------------------------------------

    let plainBody =
      "Tomorrow's Weather Forecast\n\n";


    plainBody +=
      "Location: Ahmedabad, India\n";


    plainBody +=
      "Temperature: " +
      Math.round(tempMin) +
      "°C - " +
      Math.round(tempMax) +
      "°C\n";


    plainBody +=
      "Average: " +
      tempAvg +
      "°C\n";


    plainBody +=
      "Humidity: " +
      avgHumidity +
      "%\n";


    plainBody +=
      "Wind: " +
      avgWind +
      " km/h\n";


    plainBody +=
      "\nForecast:\n";


    forecasts.forEach(
      function(f) {

        plainBody +=
          f.time +
          " | " +
          f.temp +
          "°C | " +
          f.feels_like +
          "°C | " +
          f.description +
          " | Rain " +
          f.pop +
          "%\n";

      }
    );


    plainBody +=
      "\nSuggested clothing: " +
      clothing +
      "\n";


    if (specialMessage) {

      plainBody +=
        "\n" +
        specialMessage +
        "\n";

    }


    // --------------------------------------------------------
    // Send email
    // --------------------------------------------------------

    GmailApp.sendEmail(

      config.email,

      "Tomorrow's Weather Forecast: " +
      tomorrow.toDateString(),

      plainBody,

      {
        htmlBody: htmlBody
      }

    );


    // --------------------------------------------------------
    // Send SMS through Twilio
    // --------------------------------------------------------

    if (
      config.twilioAccountSid &&
      config.twilioAuthToken &&
      config.twilioPhoneNumber &&
      config.phoneNumber
    ) {

      const twilioUrl =
        "https://api.twilio.com/2010-04-01/Accounts/" +
        config.twilioAccountSid +
        "/Messages.json";


      const options = {

        method: "post",

        headers: {

          Authorization:
            "Basic " +
            Utilities.base64Encode(
              config.twilioAccountSid +
              ":" +
              config.twilioAuthToken
            )

        },

        payload: {

          From:
            config.twilioPhoneNumber,

          To:
            config.phoneNumber,

          Body:
            "Weather Alert (" +
            tomorrow.toDateString() +
            ")\n" +

            "Ahmedabad: " +
            Math.round(tempMin) +
            "°C-" +
            Math.round(tempMax) +
            "°C\n" +

            "Wind: " +
            avgWind +
            "km/h\n" +

            "Humidity: " +
            avgHumidity +
            "%\n" +

            smsSpecialMessage

        },

        muteHttpExceptions: true

      };


      const smsResponse =
        UrlFetchApp.fetch(
          twilioUrl,
          options
        );


      if (
        smsResponse.getResponseCode() >= 400
      ) {

        console.error(
          "Twilio error: " +
          smsResponse.getContentText()
        );

      }

    }


    console.log(
      "Weather forecast and alerts sent successfully."
    );


    return {
      success: true,
      message:
        "Weather forecast and alerts sent successfully."
    };


  } catch (error) {

    console.error(
      "Weather alert error: " +
      error.toString()
    );


    // Try to send an error email
    // without causing another failure.

    try {

      const config = getConfig_();

      if (config.email) {

        GmailApp.sendEmail(

          config.email,

          "Weather Forecast Error",

          "The weather alert system failed.\n\n" +
          error.toString()

        );

      }

    } catch (emailError) {

      console.error(
        "Could not send error email: " +
        emailError.toString()
      );

    }


    throw error;
  }
}


// ============================================================
// DAILY TRIGGER
// ============================================================

function createDailyTrigger() {

  // Delete existing triggers for this function.

  const triggers =
    ScriptApp.getProjectTriggers();


  triggers.forEach(
    function(trigger) {

      if (
        trigger.getHandlerFunction() ===
        "checkWeatherAndSendAlert"
      ) {

        ScriptApp.deleteTrigger(
          trigger
        );

      }

    }
  );


  // Create a new daily trigger.

  ScriptApp
    .newTrigger(
      "checkWeatherAndSendAlert"
    )
    .timeBased()
    .atHour(5)
    .nearMinute(0)
    .everyDays(1)
    .create();


  console.log(
    "Daily weather trigger created for approximately 5 AM."
  );


  return {
    success: true,
    message:
      "Daily trigger created successfully."
  };
}


// ============================================================
// OPTIONAL: CHECK CONFIGURATION
// ============================================================

function checkConfiguration() {

  const config = getConfig_();

  return {

    openWeatherConfigured:
      !!config.apiKey,

    emailConfigured:
      !!config.email,

    phoneConfigured:
      !!config.phoneNumber,

    twilioConfigured:
      !!(
        config.twilioAccountSid &&
        config.twilioAuthToken &&
        config.twilioPhoneNumber
      ),

    locationConfigured:
      !!(
        config.lat &&
        config.lon
      )

  };
}
