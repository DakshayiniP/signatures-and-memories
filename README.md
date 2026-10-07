# Dakshayini's Walmart Memory Wall

A colorful interactive farewell autograph wall.

## What you get
- Animated-feeling, responsive landing page
- Autograph form with name, team, message, vibe and optional photo
- Memory cards with filters
- Mobile friendly
- Google Sheets + Google Drive backend via Apps Script
- GitHub Pages compatible

## Setup

### 1. Create the Google backend
Create a Google Sheet, then open **Extensions → Apps Script** and paste `google-apps-script.gs`.

Create a Google Drive folder for uploaded photos and copy its folder ID into:
`DRIVE_FOLDER_ID`

Deploy the Apps Script as a **Web app**:
- Execute as: Me
- Who has access: Anyone

Copy the Web App URL.

### 2. Connect the website
Open `script.js` and replace:
`PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
with your Apps Script Web App URL.

### 3. Publish on GitHub Pages
Create a GitHub repository, upload:
- index.html
- style.css
- script.js

Go to **Settings → Pages**, select the main branch/root and publish.

## Important privacy note
Because this is a farewell page, only ask people to upload photos they are comfortable sharing with everyone who has the link. The Apps Script currently makes uploaded Drive photos accessible by link.
