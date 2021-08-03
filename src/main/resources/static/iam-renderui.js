/*
 * (C) Koninklijke Philips Electronics N.V. 2018
 *
 * All rights are reserved. Reproduction or transmission in whole or in part, in
 * any form or by any means, electronic, mechanical or otherwise, is prohibited
 * without the prior written consent of the copyright owner.
 */


/**
 * This is client specific JS file
 * It contains the business logic to render the HTML, based on hints
 * Pre-requisite Library required : JQuery
 */

//Deployment URL for Access Management (CF)
var AM_HOST = document.getElementById("amUrl").value;

//Client details as registered with IAM, for authorization
var CLIENT_ID = "place_holder_for_IAM_OAuth2_Client";
var REDIRECT_URI = "redirect_uri_of_IAM_OAuth2_Client";
var RESPONSE_TYPE = "code";
var SCOPES = "openid";

//Global variables
var AUTH_ID = "";
var QR_SHAREDSECRET = "";
var ERROR_CODE = "";
var INVALID_OTP = "";
var hintToShowPage = "";
var authzData = {};
var FINAL_REDIRECT = "";
var ERROR_DESCRIPTION = "";

/**
 * On page load, the login page is shown based on API response /authenticate
 */
$(document).ready(function() {
    var authnData = {};
    authenticate(authnData);
});


/**
 * authenticate - Invokes the library method doAuthentication, with callback method to handle the data.
 * @param data - Data collected from web elements, request data for authentication
 */
function authenticate (data){
    doAuthentication(AM_HOST, data, handleAuthenticationCallBack);
    showAuthnViewBasedOnHint();
}


/**
 * showAuthnViewBasedOnHint : displays HTML content is displayed based on hints
 * Supported Hints : SHOW_LOGIN,SHOW_DEVICE_REGISTRATION,SHOW_QR,SHOW_OTP,CALL_AUTHORIZE,ERROR
 */
function showAuthnViewBasedOnHint() {
    var pageContent = "";
    switch (hintToShowPage) {
        case "SHOW_LOGIN":
            pageContent = '<form onsubmit="return false;"><div class="form-group"><input class="form-control" name="User Name:" id="username" ,="" placeholder="User Name:" type="text"></div><div class="form-group"><input class="form-control" name="Password:" id="password" ,="" placeholder="Password:" type="password"></div><div><input type="submit" class="btn btn-primary btn-block animated fadeIn" value="Go" style="background-color:#163670; border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;" onclick="continueAuthentication()"></div></form>'
            $("#showLogin").html(pageContent);
            $("#login").collapse("show");
            $("#qr").collapse("hide");
            $("#consent").collapse("hide");
            $("#errorpage").collapse("hide");
            break;
        case "SHOW_DEVICE_REGISTRATION":
            $("#qrCode").html("");
            pageContent = '<form onsubmit="return false;"><center><div><h4 class="title"></h4></div></center><center><div class="wrapper text-center"><div class="btn-group"><button class="btn btn-primary btn-block animated fadeIn" onclick="registerDevice();" style="background-color:#163670; border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;">Register device</button></div></div></center></form>'
            $("#qrCode").html(pageContent);
            $("#qr").collapse("show");
            $("#login").collapse("hide");
            $("#consent").collapse("hide");
            $("#errorpage").collapse("hide");
            break;
        case "SHOW_QR":
            $("#qrCode").html("");
            getQRCode(QR_SHAREDSECRET);
            pageContent = '<form onsubmit="return false;"><center><div><h4 class="title"></h4></div></center><center><div><h4 class="title"></h4></div></center><center><div class="wrapper text-center"><div class="btn-group"><button class="btn btn-primary btn-block animated fadeIn" onclick="verifyQRSharedSecret();" style="background-color:#163670; border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;">Login using verification code</button></div></div></center></form>'
            $("#loginUsingCode").html(pageContent);
            $("#qr").collapse("show");
            $("#login").collapse("hide");
            $("#consent").collapse("hide");
            $("#errorpage").collapse("hide");
            break;
        case "SHOW_OTP":
            $("#qrCode").html("");
            $("#loginUsingCode").html('');
            pageContent = '<form onsubmit="return false;"><div class="form-group"><input class="form-control" name="One Time Password" id="otp" ,="" placeholder="One Time Password" type="text"></div><center><div><h4 class="title"></h4></div></center><center><div class="wrapper text-center"><div class="btn-group"><button class="btn btn-primary" onclick="verifyOTP();" style="background-color:#163670; border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;">Submit</button></div></div></center></form>'
            $("#qrCode").html(pageContent);
            $("#qr").collapse("show");
            $("#login").collapse("hide");
            $("#consent").collapse("hide");
            $("#errorpage").collapse("hide");
        	break;
        case "SHOW_SERVER_OTP":
            $("#qrCode").html("");
            $("#loginUsingCode").html('');
			if(INVALID_OTP === "invalid_otp"){
				pageContent = '<center><p><font color="red">Please enter valid OTP.</font></p><center><form onsubmit="return false;"><div class="form-group"><input class="form-control" name="One Time Password" id="otp" ,="" placeholder="One Time Password" type="text"></div><center><div><h4 class="title"></h4></div></center><center><div class="wrapper text-center"><div class="btn-group"><button class="btn btn-primary" onclick="verifyServerOTP();" style="background-color:#163670; border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;">Submit</button></div><div class="btn-group"><button class="btn btn-primary" onclick="getServerOTP();" style="background-color:#163670; border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;">Resend OTP</button></div></div></center></form>'
			} else {
				pageContent = '<form onsubmit="return false;"><div class="form-group"><input class="form-control" name="One Time Password" id="otp" ,="" placeholder="One Time Password" type="text"></div><center><div><h4 class="title"></h4></div></center><center><div class="wrapper text-center"><div class="btn-group"><button class="btn btn-primary" onclick="verifyServerOTP();" style="background-color:#163670; border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;">Submit</button></div><div class="btn-group"><button class="btn btn-primary" onclick="getServerOTP();" style="background-color:#163670; border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;">Resend OTP</button></div></div></center></form>'
			}
            $("#qrCode").html(pageContent);
            $("#qr").collapse("show");
            $("#login").collapse("hide");
            $("#consent").collapse("hide");
            $("#errorpage").collapse("hide");
        	break;
        case "CALL_AUTHORIZE":
            showConsentForAuthz();
            break;
        case "ERROR":
            if(ERROR_CODE === "UNAUTHORIZED"){
                pageContent = "<center><div><h4>Login/password/OTP is invalid. Refresh the page to retry.</h4></div></center>";
            }else if (ERROR_CODE === "invalid_request"){
                pageContent = "<center><div><h4>Missing or invalid parameters. Refresh the page to re-login.</h4></div></center>";
            }else if(ERROR_CODE === "internal error") {
                if(ERROR_DESCRIPTION != "internal server error") {
                pageContent = "<center><div><h4>"+ERROR_DESCRIPTION+"</h4></div></center>";
                } else {
                pageContent = "<center><div><h4>Something went wrong at server side. Refresh the page to retry.</h4></div></center>";
                }
            }else{
                pageContent = "<center><div><h4>Login failed. Refresh the page to retry.</h4></div></center>";
            }
            $("#showError").html(pageContent);
            $("#errorpage").collapse("show");
            $("#login").collapse("hide");
            $("#qr").collapse("hide");
            $("#login").collapse("hide");
            $("#consent").collapse("hide");
            break;
        default:
            console.log("ERROR: Unsupported hint");
            break;
    }
}


/**
 * handleAuthenticationCallBack : Callback method with business logic to return appropriate hints and data
 * @param authResponse - API response in json format
 */
function handleAuthenticationCallBack(authResponse) {
    var authnDataObj = {};
    var authnData = [];
    if (authResponse && authResponse.status === "success") {
            hintToShowPage = authResponse.content.hint;
			if(authResponse.content.hint == "SHOW_SERVER_OTP"){
				authnData = authResponse.content.data;
				authnData.forEach(function(authnDataObj) {
					if (authnDataObj.type === "authId") {
						AUTH_ID = authnDataObj.value;
					} else if (authnDataObj.type === "error") {
						INVALID_OTP = authnDataObj.value;
					}
				});
			}
            if(authResponse.content.hint !== "CALL_AUTHORIZE"){
				authnData = authResponse.content.data;
				authnData.forEach(function(authnDataObj) {
					if (authnDataObj.type === "authId") {
						AUTH_ID = authnDataObj.value;
					} else if (authnDataObj.type === "qr") {
						QR_SHAREDSECRET = authnDataObj.value;
					}
				});
			} 
    } else {
        hintToShowPage = authResponse.content.hint;
        authnData = authResponse.content.data;
        authnData.forEach(function(authnDataObj) {
            if (authnDataObj.type === "error") {
                ERROR_CODE = authnDataObj.value;
            }
            if(authnDataObj.type === "error_description") {
                ERROR_DESCRIPTION =  authnDataObj.value;
            }
        });
    }
}


/**
 * continueAuthentication : on clicking 'login' button, this method invokes the API to authenticate the credentials
 */
function continueAuthentication() {
    // Collect any user inputs for next authentication stage
    var authnData = {
        "loginId": document.getElementById('username').value,
        "password": document.getElementById('password').value,
        "authId": AUTH_ID,
        "hint": "VAL_CRED" //dont change this value.
    };
    authenticate(authnData);
}


/**
 * registerDevice : on clicking 'register device' button, this method invokes the API to get the OTP shared secret
 */
function registerDevice() {
    var authnData = {
        "authId": AUTH_ID,
        "hint": "GET_QR" //dont change this value.
    };
    authenticate(authnData);
}


/**
 * verifyQRSharedSecret : on clicking 'login using verification code' button, this method invokes the API to get show the OTP screen
 */
function verifyQRSharedSecret(){
    var authnData = {
            "authId": AUTH_ID,
            "qr": QR_SHAREDSECRET,
            "hint": "SAVE_QR" //dont change this value.
        };
    authenticate(authnData);
}


/**
 * verifyOTP : on clicking 'Submit OTP' button, this method invokes the API to validate the OTP and login
 */
function verifyOTP() {
    var authnData = {
        "authId": AUTH_ID,
        "otp": document.getElementById('otp').value,
        "hint": "VALIDATE_OTP" //dont change this value.
    };
    authenticate(authnData);
}

/**
 * verifyServerOTP : on clicking 'Submit OTP' button, this method invokes the API to validate the OTP and login
 */
function verifyServerOTP() {
    var authnData = {
        "authId": AUTH_ID,
        "otp": document.getElementById('otp').value,
        "hint": "VALIDATE_SERVER_OTP" //dont change this value.
    };
    authenticate(authnData);
}

/**
 * getServerOTP : on clicking 'Resend OTP' button, this method invokes the API to get the OTP
 */
function getServerOTP() {
    var authnData = {
        "authId": AUTH_ID,
        "hint": "GET_SERVER_OTP" //dont change this value.
    };
    authenticate(authnData);
}

/**
 * getQRCode : Extracts QR code from  and converts to image and embeds it into div tag(ID : qrCode)
 * @param text - TOTP Shared Secret ( example : otpauth://totp/Philips:<loginId>?secret=<secret>&amp;issuer=Philips&amp;digits=6&amp;period=30)
 */
function getQRCode(text) {
    var pattern = /\'otpauth.*?\'/
    var match = pattern.exec(text);
    text = match[0];
    text = text.substring(1, text.length - 1);
    var qrcode = new QRCode(document.getElementById("qrCode"), {
        width: 300,
        height: 300
    });
    return qrcode.makeCode(text);
}


/**
 * showConsentForAuthz - Invoke GET /authorize/ui/authorize API for authorization
 * Invoke callback method with data returned within response
 */
function showConsentForAuthz(){
    var pageContent = "";
    doAuthorization(AM_HOST,CLIENT_ID, REDIRECT_URI,SCOPES,handleAuthzCallBack);
    showAuthzViewBasedOnHint();
}


/**
 * showAuthzViewBasedOnHint - displays HTML content is displayed based on hints (for authorization consent)
 * Supported Hints : SHOW_CONSENT,SHOW_LOGIN,ERROR or successful redirection
 */
function showAuthzViewBasedOnHint(){
	var authnData = {};
    switch (hintToShowPage) {
    case "SHOW_CONSENT":
        pageContent = generateAuthorizeHTMLBasedOnData();
        $("#showConsent").html(pageContent);
        $("#consent").collapse("show");
        $("#login").collapse("hide");
        $("#qr").collapse("hide");
        $("#errorpage").collapse("hide");
        break;
    case "SHOW_LOGIN":
        authenticate(authnData);
        break;
    case "REDIRECT":
        window.location.href = FINAL_REDIRECT;
        break;
    case "ERROR":
        console.log("ERROR : In Authorization");
        break;
    default:
        console.log("ERROR: Unsupported hint");
        break;
    }
}

/**
 * handleAuthzCallBack : Callback method with business logic to return appropriate hints and data
 * @param authzResponse - API response in json format
 */
function handleAuthzCallBack(authzResponse){
    if (authzResponse && authzResponse.status === "success") {
        hintToShowPage = authzResponse.content.hint;
        if(hintToShowPage === "SHOW_CONSENT"){
            authzData = authzResponse.content.oauth2Data;
        }
        else {  	
            authzData = authzResponse.content.data;
            authzData.forEach(function(authzDataObj) {
            if (authzDataObj.type === "location") {
                FINAL_REDIRECT = authzDataObj.value;
            }
            });
        }    
    }else{
        hintToShowPage = authzResponse.content.hint;
        authzData = authzResponse.content.error;
        //TODO : parse response to get data to show error page : 401, 400, 302 with invalid scope
    }
    showAuthzViewBasedOnHint(hintToShowPage);
}

/**
 * allowConsent - on clicking 'Allow' button in consent page, this method invokes the API to check for authorization.
 */
function allowConsent(){
    var saveConsentCheckbox = document.getElementById("saveConsent");
    var data = {
            "decision": "allow",
            "csrf": document.getElementById("csrf").value
        }
    if (saveConsentCheckbox.checked === true) {
        data.save_consent = "on";
    }
    continueAuthorization(AM_HOST, CLIENT_ID, REDIRECT_URI,SCOPES, data, handleAuthzCallBack);
}

/**
 * denyConsent - on clicking 'Deny' button in consent page, this method invokes the API to deny authorization.
 */
function denyConsent(){
    var saveConsentCheckbox = document.getElementById("saveConsent");
    var data = {
            "decision": "deny",
            "csrf": document.getElementById("csrf").value
        }
    if (saveConsentCheckbox.checked === true) {
        data.save_consent = "on";
    }
    continueAuthorization(AM_HOST, CLIENT_ID, REDIRECT_URI,SCOPES, data, handleAuthzCallBack);
}


/**
 * generateAuthorizeHTMLBasedOnData - Prepares the HTML content to display consent page using data returned by showConsentForAuthz method
 * @returns
 */
function generateAuthorizeHTMLBasedOnData(){
    var pageContent = '<div class="container font-color-white"><div class="page-header wordwrap"><h1 class="text-center">'+authzData.displayName+'</h1></div><div><p>This application is requesting the following private information:</p><p>You are signed in as: <span class="text-primary save-consent font-color">'+authzData.userName+'</span></p><input type="hidden" id="csrf" name="csrf" aria-hidden="true" value="'+authzData.csrf+'"><input type="checkbox" id="saveConsent" />Save Consent&emsp;<input type="button" class="btn btn-primary animated fadeIn" style="border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;" id="allow" value="Allow" onClick="allowConsent()"/>   <input type="button" class="btn btn-primary animated fadeIn" style="border: 2px solid white; border-radius:6px; margin-right:10px; margin-bottom:15px;" id="deny" value="Deny" onClick="denyConsent()"/></div></div>';
    return pageContent;

}