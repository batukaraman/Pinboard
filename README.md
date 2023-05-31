# Pinboard
Simple full stack chrome extension.

## Description
With this extension, you can leave private or public comments, notes or complaints on any site you visit.
You can start using it by signing up or logging in and clicking the "Open Pinboard" button.

## Usage

### Database
1. Run all commands in the database management system on your server in the path ./server/database.sql.
2. Check the configurations in the path ./server/.env.
3. Run server.
4. If you are not using localhost, apply the necessary changes to the `domain` variable in .client/content_scripts.js and .client/popup.js

### Extension
1. Open Google Chrome.
2. Click on the extension icon in the top right bar and click on the "Manage Extensions" button. 
3. Activate developer mode.
4. Click on the "Install unpacked item" button and select the `client` path.

### Warning
Since the extension is not fully completed, it has many problems and vulnerabilities. Since you can use it on all pages you enter, it may cause problems on some pages. In such a case, you can remove or deactivate the extension.
