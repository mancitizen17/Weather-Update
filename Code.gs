function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("Index")
    .setTitle("Daily Weather Alert System")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
