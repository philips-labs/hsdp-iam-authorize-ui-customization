Customizing the UI in authorization code flow
=============================================

Description
-----------
Sample application which shows customized pages to the end-users during the authorization flow.

Application includes a JavaScript library which is available in all IAM environments in the following location:`<AM_HOST>/resources/iam_authorization-2.0.0.js`.
Clients can also develop custom application and call the JS library to implement the flow.

Steps to deploy
---------------
1. Create an OAuth2.0 Client with IAM and provide the ID in `client_id` attribute of src/main/resources/static/iam-renderui-2.0.0.js.
2. `REDIRECT_URI` of the OAuth2.0 Client created should also be mentioned in src/main/resources/static/iam-renderui-2.0.0.js.
3. Set `AM_HOST` variable pointing to IAM Authorize deployment url while deploying the application.
4. Launch the application using {{ applicationURL }}/customerapplicationv2.
