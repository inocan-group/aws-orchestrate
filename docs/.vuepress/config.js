// const appleTouch = require("../.vuepress/apple-touch.json");
const title = "aws-orchestrate";
const favicon = "/favicon-32x32.png";

let head = [
  ["link", { rel: "icon", href: favicon }],
  ["link", { rel: "manifest", href: "/manifest.json" }],
  ["meta", { name: "application-name", content: title }],
  [
    "meta",
    {
      name: "apple-mobile-web-app-capable",
      content: true
    }
  ]
];
const appleIcons = [
  // {
  //   sizes: "2048x2732",
  //   rel: "apple-touch-startup-image",
  //   href: "icons/apple_splash_2048.png"
  // },
  // {
  //   sizes: "1668x2224",
  //   rel: "apple-touch-startup-image",
  //   href: "icons/apple_splash_1668.png"
  // },
  // {
  //   sizes: "1536x2048",
  //   rel: "apple-touch-startup-image",
  //   href: "icons/apple_splash_1536.png"
  // },
  // {
  //   sizes: "1125x2436",
  //   rel: "apple-touch-startup-image",
  //   href: "icons/apple_splash_1125.png"
  // },
  // {
  //   sizes: "1242x2208",
  //   rel: "apple-touch-startup-image",
  //   href: "icons/apple_splash_1242.png"
  // },
  // {
  //   sizes: "750x1334",
  //   rel: "apple-touch-startup-image",
  //   href: "icons/apple_splash_750.png"
  // },
  // {
  //   sizes: "640x1136",
  //   rel: "apple-touch-startup-image",
  //   href: "icons/apple_splash_640.png"
  // }
];
appleIcons.map(img => {
  head.push(["link", img]);
});

module.exports = {
  title,
  description: "aws-orchestrate",
  plugins: {
    "@vuepress/pwa": {
      serviceWorker: true,
      updatePopup: {
        message: "New content is available",
        buttonText: "Refresh"
      }
    },
    mermaid: true,
    "@vuepress/back-to-top": true,
    "@vuepress/last-updated": true,
    "@vuepress/medium-zoom": true
  },
  footer: "â’¸ 2018 Inocan Group, All Rights Reserved",
  head,
  markdown: {
    config: md => {
      // md.set({ breaks: false });
      md.use(require("./plugins/mermaid"));
    }
  },
  themeConfig: {
    logo: "",
    footer: "â’¸ 2018 Inocan Group, All Rights Reserved",
    serviceWorker: {
      updatePopup: true
    },
    nav: [
      {
        text: "Handler Wrapper",
        link: "/wrapper"
      },
      {
        text: "Sequences",
        link: "/sequence"
      },
      {
        text: "HTTP Transactions",
        link: "/transaction"
      }
    ],
    sidebar: [
      '/wrapper',
      '/sequence'
    ]
  }
};
