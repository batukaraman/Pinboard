# Pinboard

A simple full-stack Chrome extension.

## Description

With this extension, you can leave private or public comments, notes, or complaints on any site you visit. To start using it, sign up or log in and click the "Open Pinboard" button.

## Usage

### Database

1.  Execute all commands in the database management system on your server in the path ./server/database.sql.
2.  Check the configurations in the path ./server/.env.
3.  Run the server.
4.  If you are not using localhost, make the necessary changes to the `domain` variable in .client/content_scripts.js and .client/popup.js.

### Extension

1.  Open Google Chrome.
2.  Click on the extension icon in the top right bar and click on the "Manage Extensions" button.
3.  Activate developer mode.
4.  Click on the "Load unpacked" button and select the `client` path.

### Warning

Since the extension is not fully completed, it has many issues and vulnerabilities. As it can be used on all pages you enter, it may cause problems on some pages. In such a case, you can remove or disable the extension.
