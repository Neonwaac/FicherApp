import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import decompress from 'decompress'
import AdmZip from 'adm-zip'
import fs from 'fs'
import { TCompressDirContent } from './shared/types';
import compressing from 'compressing'
import os from 'os'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  
  return mainWindow;
};

// Window control handlers
ipcMain.handle('window-minimize', (ev) => {
  const window = BrowserWindow.fromWebContents(ev.sender);
  if (window) window.minimize();
});

ipcMain.handle('window-maximize', (ev) => {
  const window = BrowserWindow.fromWebContents(ev.sender);
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.handle('window-close', (ev) => {
  const window = BrowserWindow.fromWebContents(ev.sender);
  if (window) window.close();
});

ipcMain.handle('window-is-maximized', (ev) => {
  const window = BrowserWindow.fromWebContents(ev.sender);
  return window ? window.isMaximized() : false;
});

ipcMain.handle("open-select-archive-dlg", async (ev) => {
  const archive = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(ev.sender), {
    properties: ['openFile'],
    filters: [{
      extensions: ['tar', 'gz', 'zip'],
      name: "Archivos Comprimidos"
    }]
  })

  if (archive) {
    console.log("archive", archive[0])
    if (archive[0].endsWith('tar') || archive[0].endsWith('gz')) {
      const arcv_content = await decompress(archive[0])
      console.log("arcv_content", arcv_content)
      const paths = arcv_content.map(content => content.path)
      // ev.sender.send("archive-data-ev", {
      //   file_path: archive[0],
      //   content: paths
      // })
      return {
        file_path: archive[0],
        content: paths
      }
    }else if (archive[0].endsWith('zip')) {
      const admZp = new AdmZip(archive[0])
      return {
        file_path: archive[0],
        content: admZp.getEntries().map(ent => ent.entryName)
      }
    }

    dialog.showErrorBox("No Soportado", "Este tipo de archivo comprimido aún no está soportado para extracción")
    return false
  }
})

ipcMain.handle("extract-archv", async (ev,  file_path: string, content: string[]) => {
  const dest_dir = dialog.showSaveDialogSync(BrowserWindow.fromWebContents(ev.sender))
  console.log("dest_dir", dest_dir)
  if (!dest_dir) return false
  if (file_path.endsWith('tar') || file_path.endsWith('gz')) {
    const arcv_content = await decompress(file_path, dest_dir, {
      filter(file) {
          return content.includes(file.path)
      },
    })
    shell.showItemInFolder(dest_dir)
  }else if (file_path.endsWith('zip')) {
    const admZp = new AdmZip(file_path)
    admZp.getEntries().forEach(entry => {
      if (content.includes(entry.entryName)) {
        admZp.extractEntryTo(entry, dest_dir)
      }
    })
    shell.showItemInFolder(dest_dir)
  }

  return true

})

ipcMain.handle('open-compress-file-dlg', (ev) => {
  const archive = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(ev.sender), {
    properties: ['openFile', 'openDirectory'],
  })

  if (archive) {
    const stat = fs.statSync(archive[0])
    if (stat.isDirectory()) {
      const files = fs.readdirSync(archive[0], {withFileTypes: true, encoding: 'utf-8', recursive: true})
      const _files = files.map(file => ({
        full_path: path.join(file.parentPath, file.name),
        is_dir: file.isDirectory(),
      }))  
      return {
        base_item_is_dir: true,
        root_dir: archive[0],
        items: _files
      }    
    }

    return {
        base_item_is_dir: false,
        root_dir: archive[0],
        items: []
      }  
  }
  return false
})

ipcMain.handle('compress-dir', async (ev, data: TCompressDirContent) => {
  const dest_dir = dialog.showSaveDialogSync(BrowserWindow.fromWebContents(ev.sender))
  console.log("dest_dir", dest_dir)
  if (!dest_dir) {
    return false
  }
  // 'tar' | 'gzip' | 'tgz' | 'zip'
  const extensions = {
    tar: ".tar",
    tgz: '.tar.gz',
    gzip: '.gz',
    zip: '.zip'
  }
  if (data.base_item_is_dir) {
    if (data.file_type != 'gzip') {
      // await Promise.all()   
      // compressing[data.file_type].compressFile(item.full_path, dest_dir+extensions[data.file_type])
      const archvStream = new compressing[data.file_type as unknown as 'tar' | 'tgz' | 'zip'].Stream();
      
      console.log("data.items", data.items)
      data.items.filter(item => !item.is_dir).map((item) => {
        archvStream.addEntry(item.full_path, {relativePath: item.full_path.replace(data.root_dir+path.sep, '')});
      })
      const destStream = fs.createWriteStream(dest_dir+extensions[data.file_type]);
      const pp = archvStream.pipe(destStream)
      pp.on('close', () => {
        shell.showItemInFolder(dest_dir+extensions[data.file_type])
      })

      return true
    }    
  }else{
    await compressing[data.file_type].compressFile(data.root_dir, dest_dir+extensions[data.file_type]) 
    shell.showItemInFolder(dest_dir+extensions[data.file_type]) 
    return true
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
