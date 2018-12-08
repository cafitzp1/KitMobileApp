# Team Project #

<!-- This file uses Markdown and is best viewed in a Markdown file viewer. An alternative is to simply view the file online at https://github.com/cafitzp1/KitMobileApp (scroll down a bit once on the page) -->

## Alozzam - Team Members ##

- Jackson Roy
- Connor Fitzpatrick
- Colten Nelson
- Mack Mackey

## Quick View ##

A serverless version of our app can be viewed at any time from a browser by visiting https://s3-us-west-2.amazonaws.com/asu-cis430-teamproject/index.html. The app is made for mobile so it looks best when setting the page sizing to a mobile format in dev tools (where it says "iPhone 6/7/8" in our image).

![Team Project Homepage](./www/assets/kit-s3.png)

## Solution File Structure ##

    .
    ├── bin
    │   └── www
    ├── db
    │   ├── migrations
    │   └── procedures
    ├── lambda
    │   ├── node_modules
    │   ├── config.js
    │   ├── dbHelp.js
    │   ├── index.js
    │   ├── index.zip
    │   ├── package-lock.json
    │   └── package.json
    ├── node_modules
    ├── routes
    │   ├── index.js
    │   └── users.js
    ├── www
    │   ├── assets
    │   ├── css
    │   ├── js
    │   ├── config.xml
    │   ├── error.html
    │   └── index.html
    ├── .gitignore
    ├── app.js
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── www.zip

### Explanation ###

Directory/File      | Association     | Explanation
---                 | ---             | ---
`bin/`              | *server*        | contains the app entry point file  (`www`) for when launching a server (run `npm start` in CLI)
`db/`               | *database*      | contains our app db scripts; `migrations` = db initialization, `procedures` = stored procedures
`lambda/`           | *app backend*   | serverless back end deployed on AWS lambda, accessible through an AWS API Gateway
`node_modules/`     | *server*        | contains node modules required for server functionalities
`routes/`           | *server*        | a place for defining route definitions used in `app.js`
`www/`              | *app frontend*  | our app package deployed to apache phonegap build / contains all files served when accessing from local server or the S3 URL
`.gitignore`        | *misc*          | listing of files to ignore from git repository
`app.js`            | *server*        | initializes the app and glues everything together when launching a server
`package-lock.json` | *server*        | describes the exact tree that was generated for `node_modules/` modifications (for subsequent installs)
`package.json`      | *server*        | lists all the packages our solution depends on
`www.zip`           | *app frontend*  | zip file of `www/` directory for apache phonegap build

The files/directories listed as *server* are for launching an the app frontend via an Express server. More can be read about the file structure in a typical Express app at https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/skeleton_website