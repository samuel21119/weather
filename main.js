const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
require('dotenv').config();
const para = require('./parameters.json');
var menubar = require('menubar');

const path = require('path');
const url = require('url');

const {Menu, Tray, webContents} = require('electron')
let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        icon: 'assets/icongradient.png'
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.on('closed', function () {
        mainWindow = null
    });
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
})
var mb = menubar();

mb.on('ready', function ready () {
    console.log('app is ready');
    mb.setOption('preloadWindow', 'true');

    const request = require('request')
    let apiKey = para.api;
    let city = para.city;
    let url = `http://api.openweathermap.org/data/2.5/weather?id=${city}&units=metric&appid=${apiKey}`;
    console.log(url)
    request(url, function (err, response, body) {
        if (err) throw new Error(err);
        let weather = JSON.parse(body);
        //if (weather.code !== 200) throw new Error(weather.message);
        let temp = `${weather.main.temp}`;
        let temp2 = temp.substring(0, 2);
        mb.tray.setToolTip(temp2 + `° in ${weather.name}`);
    });
    const contextMenu = Menu.buildFromTemplate ([
        {label: 'Restart', click: () => { mb.app.quit();mb.app.relaunch(); }},
        {type: 'separator'},
        {label: 'Quit', click: () => {mb.app.quit ();}}
        ])
    mb.tray.on ('right-click', () => {
        mb.tray.popUpContextMenu (contextMenu);
    })
})

mb.on('after-create-window', function() {});

if (process.platform === 'darwin') {
    const osxPrefs = require('electron-osx-appearance');
    osxPrefs.onDarkModeChanged(() => {
        mb.app.quit();
        mb.app.relaunch();
    });
}
