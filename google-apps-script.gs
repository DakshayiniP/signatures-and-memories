/*
Google Apps Script backend for Dakshayini's Memory Wall.

1. Create a Google Sheet.
2. Extensions -> Apps Script.
3. Paste this code.
4. Change DRIVE_FOLDER_ID to a Drive folder ID.
5. Deploy -> New deployment -> Web app
   Execute as: Me
   Who has access: Anyone
6. Copy the Web App URL into script.js as API_URL.

The sheet receives: Timestamp, Name, Team, Vibe, Message, Photo URL.
Photos are saved to the chosen Drive folder.
*/

const DRIVE_FOLDER_ID = "PASTE_YOUR_GOOGLE_DRIVE_FOLDER_ID";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    let photoUrl = "";

    if (data.photo && data.photo.startsWith("data:image/")) {
      const match = data.photo.match(/^data:(image\/(?:jpeg|png));base64,(.*)$/);
      if (match) {
        const mime = match[1];
        const bytes = Utilities.base64Decode(match[2]);
        const ext = mime === "image/png" ? "png" : "jpg";
        const blob = Utilities.newBlob(bytes, mime, `${Date.now()}_${safe(data.name)}.${ext}`);
        const file = DriveApp.getFolderById(DRIVE_FOLDER_ID).createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        photoUrl = file.getUrl();
      }
    }

    sheet.appendRow([
      new Date(),
      safe(data.name),
      safe(data.team),
      safe(data.vibe),
      safe(data.message),
      photoUrl
    ]);

    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function safe(v){ return String(v || "").slice(0,2000); }
