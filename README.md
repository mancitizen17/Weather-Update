# Daily Weather Alert System using Google Apps Script

This Google Apps Script project automatically fetches the weather forecast for tomorrow and sends a detailed email report and an SMS alert if special conditions are met. It's a useful utility for staying ahead of the weather without needing to check an app every day.

The script is designed to run automatically as a scheduled job, making it a "set it and forget it" solution for your daily weather needs.

---

### 🚀 Live Demo

**[View the live dashboard](https://script.google.com/macros/s/AKfycbyGuTeblHfxiNmz2bcO-1_-x9PLXBcauxO709X1TgdelPMQbLU2qAbP4wUjilpyeGdm/exec)**

Status: ✅ Deployed and working — click "Refresh Weather" on the page to pull tomorrow's live forecast. The same backend also sends a daily email (and optional SMS) automatically at ~5 AM.

---

### Features

* **Daily Email Forecast**: Provides a detailed HTML-formatted email with tomorrow's weather data, including:
    * Minimum and maximum temperatures
    * Humidity and wind speed averages
    * An hourly breakdown of conditions
    * Suggested clothing recommendations
* **Visual Chart**: The email includes a dynamically generated line graph of the temperature and "feels like" temperature.
* **SMS Alerts**: Sends a concise SMS message via the **Twilio API** for a quick heads-up on key weather metrics.
* **Special Condition Alerts**: Automatically sends a "⚠️ **EXTREME HEAT**" alert via both email and SMS if the maximum temperature is projected to exceed a set threshold.
* **Automated Scheduling**: The `createDailyTrigger` function sets up a daily trigger to run the script automatically at a specified time (e.g., 5 AM).
* **Robust Error Handling**: If the script fails to fetch data, it sends an error email to notify you of the issue.

---

###  Technologies Used

* **Google Apps Script**: The core platform for running the script.
* **OpenWeatherMap API**: Used to fetch accurate weather forecast data.
* **QuickChart.io API**: Generates a visual temperature chart for the email.
* **Twilio API**: Enables sending SMS messages.

---

###  Getting Started

#### Prerequisites

* A **Google Account** to run the Google Apps Script.
* An **OpenWeatherMap API Key** (available from their website).
* A **Twilio Account** (optional, for SMS alerts). You'll need your Account SID, Auth Token, and a Twilio phone number.

#### Setup Instructions

1.  Go to **Google Apps Script** (script.google.com).
2.  Click **"New project"** and add `Code.gs` and `Index.html` with the contents from this repo.
3.  **Configure your settings** in **Project Settings → Script Properties** (not hardcoded in the code):
    * `OPENWEATHER_API_KEY`: Your OpenWeatherMap API key.
    * `LAT` & `LON`: Latitude and longitude of your location (optional — defaults to Ahmedabad, India).
    * `YOUR_EMAIL`: The email address where you want to receive the forecast.
    * `PHONE_NUMBER`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: Your Twilio credentials for SMS alerts (optional).
4.  **Save the project.**
5.  Run the `checkConfiguration` function once to confirm all properties were picked up correctly (check the execution log).
6.  Run the `createDailyTrigger` function once. This will set up the daily automation.
7.  You will be prompted to authorize the script to access external services (like sending emails and fetching URLs). Grant the necessary permissions.
8.  **Deploy as a web app:** Deploy → New deployment → Web app → set "Who has access" → Deploy. Use the resulting `/exec` URL for the live dashboard.

Once configured, the script will run every morning at the designated time, and you'll receive your daily weather forecast directly in your inbox and a quick text on your phone! Whenever you update `Code.gs` or `Index.html`, remember to create a **new deployment version** (Deploy → Manage deployments → Edit → New version) — just saving the code does not update the live URL.


