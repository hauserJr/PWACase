if('serviceWorker' in navigator) {  
navigator.serviceWorker  
	   .register('/service-worker.js')  
	   .then(function() { console.log('Service Worker Registered'); });  
}


// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
console.log('statusChangeCallback');
console.log(response);
// The response object is returned with a status field that lets the
// app know the current login status of the person.
// Full docs on the response object can be found in the documentation
// for FB.getLoginStatus().

//
if (response.status === 'connected') {
  // Logged into your app and Facebook.
  testAPI();
} else {
	LogoutFB();
  // The person is not logged into your app or we are unable to tell.
  //document.getElementById('status').innerHTML = '利用此登入' ;
}
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
FB.getLoginStatus(function(response) {
  statusChangeCallback(response);
});
}

window.fbAsyncInit = function() {
FB.init({
appId      : '168641667039741',
cookie     : true,  // enable cookies to allow the server to access 
					// the session
xfbml      : true,  // parse social plugins on this page
version    : 'v2.8' // use graph api version 2.8
});

// Now that we've initialized the JavaScript SDK, we call 
// FB.getLoginStatus().  This function gets the state of the
// person visiting this page and can return one of three states to
// the callback you provide.  They can be:
//
// 1. Logged into your app ('connected')
// 2. Logged into Facebook, but not your app ('not_authorized')
// 3. Not logged into Facebook and can't tell if they are logged into
//    your app or not.
//
// These three cases are handled in the callback function.

FB.getLoginStatus(function(response) {
statusChangeCallback(response);
});


};

function LoginFB() {
	FB.login(function(response) {
	  if (response.status === 'connected') {
		  testAPI();
	  } else {
		// The person is not logged into this app or we are unable to tell. 
	  }
	},{scope: 'email'});
}
function LogoutFB() {
	$('#LoginStatus').text('目前狀態：未登入');
	$('#btn1').attr('onclick', 'LoginFB()'); 
	$('#btn1').text('Login FB');
}
  
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/zh_TW/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
console.log('Welcome!  Fetching your information.... ');
FB.api('/me?fields=id,name,email', function(response) {
  console.log('Successful login for: ' + response.email);
  $('#LoginStatus').text('目前狀態：已登入');
  $('#btn1').attr('onclick', 'FB.logout();LogoutFB();'); 
  $('#btn1').text('Logout FB');
});
}