// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  databaseName: 'test',
  pageSize: 10,
  featureFlags: {
    verseFilter: false,
    downloadBibles: false,
    exportDatabase: true
  },
  firebase: {
    apiKey: "AIzaSyDC7H8v4GBCifIxvQP_RwX3svsjmge_Fu4",
    authDomain: "bible-tools-efb12.firebaseapp.com",
    projectId: "bible-tools-efb12",
    storageBucket: "bible-tools-efb12.appspot.com",
    messagingSenderId: "1060338076200",
    appId: "1:1060338076200:web:2465f6ae264a780fa5831d",
    measurementId: "G-KTL87XPBV7"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
