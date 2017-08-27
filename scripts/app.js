/*https://web-push-codelab.appspot.com/*/
let NoSup = false;
if('serviceWorker' in navigator && 'PushManager' in window) {  

	navigator.serviceWorker.register('/service-worker.js')
	.then(function(swReg) { 
		console.log('Service Worker Registered' ,swReg); 
		swRegistration = swReg;
		$('#Welbcome').attr('src','/images/EnterMes/welcome_svg.svg');
	}).catch(function(error) {
		console.error('Service Worker Error', error);
	});
	} else {
		console.warn('Push messaging is not supported');
		NoSup = true;
		$('#SubscribeStatus').text('不支援推播');
		//pushButton.textContent = 'Push messaging is not supported';
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
	  FBLogoutStatus_Btn();
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
	  //切換按鈕
	  FBLoginStatus_Btn();
	  //
	  alert(response.name + '(' + response.email + ')' + '歡迎登入');
	  initialiseUI();

	});
}



/**Push Notifications codelab**/
'use strict';

const applicationServerPublicKey = 'BEnZT1m8TXAgde4uZfcwrs6rorswSBQOFCYdsBrMD8jJ5HhWp0GBeO0RggGtl9uj6WCimEdaxPKw56vY1lpJ7WU';
const pushButton = document.querySelector('.js-push-btn');
let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/*Add 20170824 follow sample 
https://developers.google.com/web/fundamentals/getting-started/codelabs/push-notifications/
*/

function initialiseUI() {	
	try {	
		if (isSubscribed) {
			unsubscribe();
		} else {	
			subscribe();			
		}
		// pushButton.addEventListener('click', function() {
			// pushButton.disabled = true;
			// if (isSubscribed) {
				 // unsubscribeUser();
			// // TODO: Unsubscribe user
			// } else {			
				// subscribeUser();
			// }
		// });
		// Set the initial subscription value
		swRegistration.pushManager.getSubscription()
		.then(function(subscription) {
			isSubscribed = !(subscription === null);
			if (isSubscribed) {
			  console.log('User IS subscribed.');
			} else {
			  console.log('User is NOT subscribed.');
			}
			updateBtn();
		});
	} catch(ex) {
		
		//pushButton.textContent = 'Disable Push Messaging';
	}
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    //pushButton.textContent = 'Push Messaging Blocked.';
	$('#btn2').text('伺服器錯誤...');
    //pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }
	console.log(isSubscribed);

  if (NoSup){
	  $('#SubStatus').text('網站訂閱狀態：不支援推播');
  } else {
	  if (isSubscribed && !NoSup) {
		unsubscribe();
		$('#SubStatus').text('網站訂閱狀態：已訂閱');
    //pushButton.textContent = 'Disable Push Messaging';
	  } else {
		subscribe();
		$('#SubStatus').text('網站訂閱狀態：未訂閱');
		//pushButton.textContent = 'Enable Push Messaging';
	  }
  }
  //pushButton.disabled = false;
}

/*Subscribe User*/
function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;
	
    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server
  
  //const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails =
    document.querySelector('.js-subscription-details');

  if (subscription) {
	var SubcribeJson = JSON.parse(JSON.stringify(subscription));
	PushUserInfo(SubcribeJson);
    //subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}


/***UI status change***/
function unsubscribe(){
	$('#btn2').text('取消訂閱');
	$('#btn2').removeClass('disabled');
	$('#btn2').attr('onclick','unsubscribeUser();');
}
function subscribe(){
	$('#btn2').text('訂閱');
	$('#btn2').removeClass('disabled');
	$('#btn2').attr('onclick','subscribeUser();');
	disablePushUserInfo();
}

function FBLoginStatus_Btn(){
  $('#LoginStatus').text('目前登入狀態：已登入');
  $('#btn1').attr('onclick', 'FB.logout();FBLogoutStatus_Btn();'); 
  $('#connectionStr').remove();
  $('#btn1').attr('src','/images/FB/FB_logout_svg.svg');
}
function FBLogoutStatus_Btn(){
	$('#LoginStatus').text('目前登入狀態：未登入');
	$('#btn1').attr('onclick', 'LoginFB()'); 
	$('#connectionStr').remove();
    $('#btn1').attr('src','/images/FB/FB_login_svg.svg');
	
	//disabled subscribe
	$('#btn2').text('如欲使用推播功能,請登入FB後進行訂閱.');
	$('#btn2').attr('onclick', ''); 
	$('#btn2').addClass('disabled'); 
}
function PushUserInfo (SubcribeInfo){
	$('#Tip').text('訂閱將取得訂閱資訊,如需要請將此記錄下了,當畫面重整將不再重新顯示.');
	$('#endpoint').text('endpoint：'+SubcribeInfo.endpoint);
	$('#expirationTime').text('expirationTime：'+SubcribeInfo.expirationTime);
	$('#p256dh').text('p256dh：'+SubcribeInfo.keys.p256dh);
	$('#auth').text('auth：'+SubcribeInfo.keys.auth);
}

function disablePushUserInfo (){
	$('#Tip').text('');
	$('#endpoint').text('');
	$('#expirationTime').text('');
	$('#p256dh').text('');
	$('#auth').text('');
}