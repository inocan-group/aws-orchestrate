/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "a479e3d0168119320e87230ac0b0599d"
  },
  {
    "url": "archive/lambda-fan-in.html",
    "revision": "10353cc389a794ff48369c41b8c8ae60"
  },
  {
    "url": "archive/lambda-fan-out.html",
    "revision": "bed7fe8740af0685f9bed70d246234f0"
  },
  {
    "url": "archive/sequence.html",
    "revision": "2d78910b909e2b90fb6312c4ba0db3c7"
  },
  {
    "url": "archive/transaction.html",
    "revision": "14bd8a6cd4a6d3c24277df6047a5c42f"
  },
  {
    "url": "assets/css/0.styles.cac0f318.css",
    "revision": "50c192f4af6c1fd399d3c6c4ef9065c6"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.f0674ebe.js",
    "revision": "98d1c692311ada2530903518d7a58bf2"
  },
  {
    "url": "assets/js/11.8feac376.js",
    "revision": "e4b62a15b3a1fe6a4d764e69acb86380"
  },
  {
    "url": "assets/js/12.a47346cb.js",
    "revision": "b47027cdd15da8d136e95e3e3d1fd466"
  },
  {
    "url": "assets/js/13.b3a80dd1.js",
    "revision": "f79d69043f1e0f1a6e871bfcf7b18441"
  },
  {
    "url": "assets/js/14.f8913775.js",
    "revision": "5d68365e5b250fc63d224c78afb8fb99"
  },
  {
    "url": "assets/js/15.e9ce673a.js",
    "revision": "82ac85f89afd41671a0e57f54a48dcc4"
  },
  {
    "url": "assets/js/16.292e2a5a.js",
    "revision": "e8d9ae8793c1fa9a0bbfca038627b416"
  },
  {
    "url": "assets/js/17.553ca4d8.js",
    "revision": "e0957ee5c136cfab869eb5798942f1a5"
  },
  {
    "url": "assets/js/18.ad21fe4d.js",
    "revision": "dc08781d97c4dccc6b8e11c471ced54b"
  },
  {
    "url": "assets/js/19.90d72170.js",
    "revision": "b7078c7cf36f9597af384dd506eb296d"
  },
  {
    "url": "assets/js/2.c89000a8.js",
    "revision": "a2298ecc6a76bf923b14080cf6b647c8"
  },
  {
    "url": "assets/js/3.6bce455b.js",
    "revision": "6b73dcfcd6f406f7953c6829e2f58326"
  },
  {
    "url": "assets/js/4.097130a0.js",
    "revision": "c8799fd2e856fe074cc69a5d86bd5eb7"
  },
  {
    "url": "assets/js/5.091175b3.js",
    "revision": "cd20dbf1c321367cdecd8b153e2c4d0b"
  },
  {
    "url": "assets/js/6.46fa04c6.js",
    "revision": "884eb51cfd2175102816606f9cf25475"
  },
  {
    "url": "assets/js/7.6f1f1caa.js",
    "revision": "01f42cee66b437314b29beb417476a15"
  },
  {
    "url": "assets/js/8.928d13f9.js",
    "revision": "fae6779663168c7bef929e56426aea75"
  },
  {
    "url": "assets/js/9.0c28e3aa.js",
    "revision": "d39fa834df0586d15429791408788606"
  },
  {
    "url": "assets/js/app.dbcc07c8.js",
    "revision": "9cc124ed3fd4b31ffc37175cba88f02e"
  },
  {
    "url": "build-step.html",
    "revision": "965933936505523e2361274b971c9cb6"
  },
  {
    "url": "conductor.png",
    "revision": "a00109ceefa51178d45559713da67063"
  },
  {
    "url": "conductor.svg",
    "revision": "40e602f9a53841e894a1411eca03b374"
  },
  {
    "url": "devops.html",
    "revision": "de8eac781a4bbb0890effded26fe5c60"
  },
  {
    "url": "favicon-256x256.jpg",
    "revision": "b74c64b0f766ed4d73dcd10586233134"
  },
  {
    "url": "favicon-32x32.png",
    "revision": "f723908fccac1ff9f1d4caf81f3aa173"
  },
  {
    "url": "getting-started.html",
    "revision": "87c7c1208148da9f7692732867423fd3"
  },
  {
    "url": "index.html",
    "revision": "047bcf608f10138c33c86695902e566f"
  },
  {
    "url": "inocan-192x192.png",
    "revision": "8f9699e15b87be0b2a1d668e99b3b855"
  },
  {
    "url": "inocan-512x512.png",
    "revision": "4d71893f46692da1bdec1ae2719a9490"
  },
  {
    "url": "step-fns.html",
    "revision": "c3e0c04ef8681c0e05e4fe3357ee42c1"
  },
  {
    "url": "wrapper.html",
    "revision": "03251f9cc72c0b77172336723d6064c1"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
