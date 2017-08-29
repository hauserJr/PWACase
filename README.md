# PWACase
### 關於Progressive Web App相關資料網站
> 首次建立PWA的準備及範例 [Progressive Web App Example](https://developers.google.com/web/fundamentals/getting-started/codelabs/your-first-pwapp/?hl=zh-tw) 

> 關於Service-Worker [Google：Service Workers: an Introduction](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers?hl=zh-tw)

> 如何在localhost建立推播功能 [Push Notifications](https://developers.google.com/web/fundamentals/getting-started/codelabs/push-notifications/)

> 用於測試推播的網站 [Push Server example](https://web-push-codelab.appspot.com/)

> 自己寫的推播Server [Github PushServer](https://github.com/hauserJr/PuseServer)

> 如何利用Xampp架設SSL說明 [Github README](https://github.com/hauserJr/Xampp_SSL)
### 準備及須知事項
> 1.需要Chrome 52 或以上 

> 2.HTML、CSS和JavaScript基礎認知

> 3.架設Apache Server

> 4.申請SSL(SSL For Free)

> 5.大多數功能並不支援Apple裝置 <font size="1">~~Google表示：Apple?懶得理你~~ [2017/02/06新聞]( https://www.pcmarket.com.hk/2017/02/06/android-chrome%E5%B0%87%E6%B7%B1%E5%8C%96progressive-web-app%E6%94%AF%E6%8F%B4/)</font>

    注意：
    本範例內有使用FB Login但不在此講解說明範圍，請直接於FB For developers申請API Key，
    並修改於範例scripts/app.js內，line:51的appId : 'your-api-key'。

### 目錄
* [Service Worker可以做及解決什麼](#ServiceWork)
* [如何接收推播訊息](#Push)


### <a id="ServiceWork">＊Service Worker可以做及解決什麼？</a>
---
#### 可以做：
* 確保在無網路或網路不穩的情況下能持續使用網站。
* 加速載入速度。
* 提高使用者使用體驗。
* 提高曝光度及使用人數。

#### 能解決：
首先要先知道Service Worker是屬於在後端處理網頁Install、Activate、Push等事件，
主要是要運用Web cache、IndexDB來提高使用者體驗並加速網頁載入，
改善過去部分Apk不良UI體驗及SPA應用所帶來的流量影響。

* 當然要改善不良UI是需要不斷進行的事情，但Apk如不斷更新則會不斷要求使用者下載更新，而PWA只是一個Web所以更新時使用者不需要去執行下載更新等動作，只需要將頁面開啟重新載入即可。

* 上述提到PWA只是一個Web所以也能運用SEO來提高曝光率，加上免下載的優勢可提高使用者的使用意願。

* 而Service Worker使用了Web cache及IneexDB等技術，所以跟SPA載入頁面就須將資源重載不同，在載入時Service Worker就會先檢查是否有Cache所需資源，如有存在則會直接使用而不再Reload，能大幅度減少不必要的資源浪費。

* 因為資源被Cache住，所以離線或網路不穩時也能確保應用程式正常使用，但需要網路服務的功能仍需網路。 

#### 如何做：
在本次範例中啟動頁面時會觸發App.js來檢查裝置是否支援，如果支援則會去註冊Service Worker，
註冊時Service Worker將會觸發我們希望於後端執行的動作，
下方將會以本範例內的程式碼來說明各階段做了哪些事情。
### 在網頁載入時app.js做了哪些事情呢？
---
``` JavaScript
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
    //pushButton.textContent = 'Push messaging is not supported';
}
....
```
依序來看上述的程式碼內做了什麼事情：
* 首先檢查是否支援推播及Service Worker
```if('serviceWorker' in navigator && 'PushManager' in window)..```
當然如果要網頁只支援其中一種功能就可註冊Service-worker也可以修改成。
```if('serviceWorker' in navigator || 'PushManager' in window)..```
* 利用```navigator.serviceWorker.register('/service-worker.js')```註冊service-worker.js。
 
        注意：裝置如不支援推播NoSup為false反之為true,此參數用於決定是否產生推播按鈕。
* 裝置如支援功能則會載入首次登入的圖片。
```$('#Welbcome').attr('src','/images/EnterMes/welcome_svg.svg');```
### 在service-worker.js又處理了什麼呢？
``` JavaScript
var dataCacheName = 'PWACase-v2';
var cacheName = 'PWACase-v2';
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
   '/scripts/jquery-3.1.1.min.js',
    '/scripts/tether.min.js',
	 '/scripts/bootstrap.min.js',
  '/styles//bootstrap.min.css',
  '/images/Logo/ZMH.svg',
  '/images/EnterMes/welcome_svg.svg',
  '/images/EnterMes/welcome_back_svg.svg',
  
];
```
* 定義cache Name，之後要取得cache時需指定Cache Name。
* 定義哪些檔案是要被Cache的。

```javascript
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
	  cache.add('/images/EnterMes/welcome_back_svg.svg')
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

...JavaScript

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  const urlCache = new URL(e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    
  if (e.request.url.indexOf(dataUrl) > -1) {
    ....
  } else if (urlCache == 'https://.../images/EnterMes/welcome_svg.svg'){
		e.respondWith(
		caches.match('https://.../images/EnterMes/welcome_back_svg.svg')
                .then(function(response) {
                    return response || fetch(e.request);
                })
    );
  } else {
    ....
  }
});
```
* 定義完會Install Service Worker，Install時加入另外一張圖片
```cache.add('/images/EnterMes/welcome_back_svg.svg')```
* 進行fetch時如果發現```.../images/EnterMes/welcome_svg.svg```
已存在cache則判斷非第一次登入，並將圖檔換成歡迎回來。
```caches.match('https://pwa-test.asuscomm.com/images/EnterMes/welcome_back_svg.svg')```

    <font size="3" color="red">在fetch會檢查已被Cache的檔案，如果檔案存在則會直接提供使用</font>

#### 透過登入時的圖片切換可以了解Service Worker如何利用Cache處理離線操作及加速載入的原理，當然Service Worker還有activate、Push etc. 可以提供使用於不同情境。

----

### <a id="Push">＊如何接收推播訊息？</a>
---
關於如何推播訊息其實非常的簡單，相較於Android上的操作，
只要做到以下的步驟即可

>1.首先我們已經在App.js內檢查裝置是否有支援推播了，

>2.再來用戶必須在裝置上同意通知訊息的接收，

>3.接著依靠Push Server推送訊息到Client就可以了。

#### 那麼該如何實作訂閱呢？
* 首先我們先到[Push-codelab](https://web-push-codelab.appspot.com/)取得金鑰，成功取得會得到下圖的資訊，並將其金鑰儲存起來。
![](https://i.imgur.com/iqiY583.png)

* 從範例中的App.js找到此處並將Public key貼上，之後將會利用Public Key加密Client的資訊。
`const applicationServerPublicKey = 'your public key';`

```Javascript
/*Subscribe User*/
function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .....
}
```
* 使用者同意訂閱後將會執行上述的程式碼，並搭配所提供的Public Key執行加密Client資訊。

* 以下為利用Public Key加密的原始資料及經過處理後顯示於畫面上的資料。

未處理的原始資料
![](https://i.imgur.com/jNDP9Eu.png)

已處理的加密資料
![](https://i.imgur.com/7p0JdYn.png)

* 當取得上列的資料後App.js的工作內容就告一段落了，接下來我們必須到Service Worker設定，
如果接收到訊息後該怎麼處理，以及點擊通知後的Url導向。

#### Service-Worker.js
```JavaScript
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Hi';
  const options = {
    body: `"${event.data.text()}"`,
    icon: 'images/Notice_Icon.png',
    badge: 'images/Notice_Icon.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://pwa-test.asuscomm.com')
  );
});
```

* 此處要做的事情只有下列幾件：

    1.設定動作監聽：`self.addEventListener('push', function(event) ..`
    
    2.設定通知標題：`const title = 'Hi';`
    
    3.顯示接收內容：`"${event.data.text()}"`
    
    4.最後將訊息顯示至畫面：
    `event.waitUntil(self.registration.showNotification(title, options));`
    
    5.Click後的跳轉URL設定：`clients.openWindow('https://pwa-test.asuscomm.com')`

#### 開始推播

* 將透過訂閱的資料整理成Json格式，並貼到剛剛取得金鑰的網站。
        
        注意：貼上網站時要確認Public、Private Key是否與剛剛產生的一致，如果不一致將會傳送失敗。
```Json
{
   "endpoint":"https://fcm.googleapis.com/fcm/send/dv4KZiNG......."
  ,"expirationTime":null
  ,"keys":
  {
    "p256dh":"BOuEJPzSIFhCSy_ynh...."
    ,"auth":"qDvsvd....."
  }
}
```
* 貼上後發送，網站將會收到訊息。
![](https://i.imgur.com/ULIbKRb.png)


----
### 如果可以成功收到訊息代表此範例已經完成囉。
### 如果無法成功接收訊息，請查看Chrome F12 主控台的訊息輸出Debug哦！

