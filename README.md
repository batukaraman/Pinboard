# Pinboard
Simple full stack chrome extension.

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
As the plugin is not fully completed, there are many issues and vulnerabilities. Since you can use it on all the pages you enter, it may cause problems on some pages. In such a case, you can uninstall or deactivate the plugin.
