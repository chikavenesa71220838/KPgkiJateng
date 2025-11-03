self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/jadwal-rutins": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/jadwal-rutins.js"
    ],
    "/jadwal-rutins/[id]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/jadwal-rutins/[id].js"
    ],
    "/jadwal-rutins/create": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/jadwal-rutins/create.js"
    ],
    "/jams": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/jams.js"
    ],
    "/jams/[id]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/jams/[id].js"
    ],
    "/jams/create": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/jams/create.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];