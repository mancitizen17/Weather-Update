function doGet() {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Weather Alert Demo</title>
      </head>
      <body style="
        margin: 0;
        padding: 80px 20px;
        background: #f5f7fb;
        font-family: Arial, sans-serif;
        text-align: center;
      ">
        <div style="
          max-width: 600px;
          margin: auto;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,.08);
        ">
          <div style="font-size: 50px;">🌤️</div>
          <h1>Weather Alert System</h1>
          <p style="color: #667085;">
            Google Apps Script Web App is working!
          </p>
          <p style="color: #12b76a; font-weight: bold;">
            ✓ Deployment successful
          </p>
        </div>
      </body>
    </html>
  `);
}
