import { app, BrowserWindow, clipboard, Tray, Menu, globalShortcut, nativeImage, ipcMain } from 'electron';
import path from 'path';
import { exec } from 'child_process';
import https from 'https';

let dashboardWindow: BrowserWindow;
let notificationWindow: BrowserWindow;
let tray: Tray;
let lastClipboardText = '';
let isQuitting = false;
let notificationTimeout: NodeJS.Timeout | null = null;
const SHORTCUT = 'CommandOrControl+Alt+Shift+K';

function getCopyCommand() {
  if (process.platform === 'darwin') {
    return 'osascript -e \'tell application "System Events" to keystroke "c" using command down\'';
  }
  if (process.platform === 'win32') {
    return 'powershell -NoProfile -Command "$wshell = New-Object -ComObject WScript.Shell; Start-Sleep -Milliseconds 50; $wshell.SendKeys(\'^c\')"';
  }
  return 'xdotool key ctrl+c';
}

function runSelectionFactcheck() {
  const beforeCopy = clipboard.readText();
  const copyCommand = getCopyCommand();

  exec(copyCommand, () => {
    let attempts = 0;
    const maxAttempts = 8;
    const interval = setInterval(() => {
      attempts += 1;
      const currentText = clipboard.readText();
      const hasNewClipboardText = !!currentText && currentText !== beforeCopy;

      if (hasNewClipboardText || attempts >= maxAttempts) {
        clearInterval(interval);
        showNotification();
        checkClipboard();
      }
    }, 120);
  });
}

function createDashboardWindow() {
  dashboardWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: true,
    roundedCorners: true,
    vibrancy: 'under-window',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  dashboardWindow.loadFile('index.html');

  dashboardWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      dashboardWindow.hide();
    }
  });
}

function createNotificationWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  notificationWindow = new BrowserWindow({
    width: 300,
    height: 100,
    x: width - 320,
    y: 20,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  notificationWindow.loadFile('notification.html');
}

function showNotification() {
  notificationWindow.webContents.send('truth-label', 'Checking...');
  notificationWindow.show();
  
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '../eye.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.resize({ width: 24, height: 24 }));
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Factcheck', 
      click: () => {
        runSelectionFactcheck();
      }
    },
    { label: 'Open Dashboard', click: () => dashboardWindow.show() },
    { label: 'Settings', click: () => {
      dashboardWindow.show();
      dashboardWindow.focus();
      dashboardWindow.webContents.send('open-settings');
    }},
    { label: 'Quit', click: () => {
      isQuitting = true;
      app.quit();
    }}
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('HeartOverflow');
}

function checkClipboard() {
  const currentText = clipboard.readText();
  if (currentText) {
    lastClipboardText = currentText;
    
    const sanitizedText = currentText.replace(/’/g, "\\'").replace(/—/g, '-');
    
    dashboardWindow.webContents.send('clipboard-update', currentText);
    
    dashboardWindow.webContents.executeJavaScript('localStorage.getItem("affiliation")')
      .then((affiliation) => {
        const payload: any = { text: sanitizedText, affiliation: affiliation || ''};
        const data = JSON.stringify(payload);
        
        const options = {
          hostname: '3cdqdmy43d.execute-api.us-east-1.amazonaws.com',
          path: '/staging/check',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          }
        };
        
        const req = https.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => { responseData += chunk; });
          res.on('end', () => {
            const response = JSON.parse(responseData);
            console.log('API Response:', response);
            dashboardWindow.webContents.send('verification-result', response);
            notificationWindow.webContents.send('truth-label', response.verdict);
            notificationWindow.webContents.send('confidence', response.confidence);
            
            if (notificationTimeout) {
              clearTimeout(notificationTimeout);
            }
            notificationTimeout = setTimeout(() => {
              if (notificationWindow && !notificationWindow.isDestroyed()) {
                notificationWindow.hide();
              }
            }, 30000);
          });
        });
        
        req.on('error', () => {});
        
        req.write(data);
        req.end();
      });
  }
}

app.whenReady().then(() => {
  createDashboardWindow();
  createNotificationWindow();
  createTray();
  
  ipcMain.on('hide-window', () => {
    dashboardWindow.hide();
  });
  
  ipcMain.on('open-dashboard', () => {
    notificationWindow.hide();
    dashboardWindow.show();
    dashboardWindow.focus();
  });
  
  globalShortcut.register(SHORTCUT, () => {
    runSelectionFactcheck();
  });
});

app.on('window-all-closed', () => {
  // Keep app running in background
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
});
