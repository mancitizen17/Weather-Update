# Daily Weather Alert System using Google Apps Script

This Google Apps Script project automatically fetches the weather forecast for tomorrow and sends a detailed email report and an SMS alert if special conditions are met. It's a useful utility for staying ahead of the weather without needing to check an app every day.

The script is designed to run automatically as a scheduled job, making it a "set it and forget it" solution for your daily weather needs.

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
2.  Click **"New project"** and paste the entire code into the editor.
3.  **Configure your settings:** Replace the placeholder variables at the top of the `checkWeatherAndSendAlert` function with your specific information:
    * `API_KEY`: Your OpenWeatherMap API key.
    * `LAT` & `LON`: Latitude and longitude of your location.
    * `YOUR_EMAIL`: The email address where you want to receive the forecast.
    * `PHONE_NUMBER`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: Your Twilio credentials for SMS alerts.
4.  **Save the project.**
5.  Run the `createDailyTrigger` function once. This will set up the daily automation.
6.  You will be prompted to authorize the script to access external services (like sending emails and fetching URLs). Grant the necessary permissions.

Once configured, the script will run every morning at the designated time, and you'll receive your daily weather forecast directly in your inbox and a quick text on your phone!
 


