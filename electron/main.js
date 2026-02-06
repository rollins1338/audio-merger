
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const os = require('os');
const { exec, execFile } = require('child_process');

// Try to load static binaries if available
let ffmpegStaticPath = null;
let ffprobeStaticPath = null;
try {
  ffmpegStaticPath = require('ffmpeg-static');
  ffprobeStaticPath = require('ffprobe-static').path;
} catch (e) {
  console.log('Static binaries not found, falling back to system/manual config');
}

let mainWindow;
let currentCommand = null;

// Track temp files for cleanup on exit
const tempFiles = new Set();

// --- Auto-Configure FFmpeg ---
function configureFFmpeg() {
  if (ffmpegStaticPath && ffprobeStaticPath) {
    let finalFfmpeg = ffmpegStaticPath;
    let finalFfprobe = ffprobeStaticPath;

    // Fix paths for packaged Electron apps (asar)
    if (app.isPackaged) {
      finalFfmpeg = finalFfmpeg.replace('app.asar', 'app.asar.unpacked');
      finalFfprobe = finalFfprobe.replace('app.asar', 'app.asar.unpacked');
    }

    console.log(`[FFmpeg] Auto-configuring path: ${finalFfmpeg}`);
    ffmpeg.setFfmpegPath(finalFfmpeg);
    ffmpeg.setFfprobePath(finalFfprobe);
    return true;
  }
  return false;
}

// Initial configuration attempt
configureFFmpeg();

// Helper: Parse FFmpeg timemark (HH:MM:SS.mm) or seconds to number
function parseTimemarkToSeconds(timemark) {
  if (typeof timemark === 'number') return timemark;
  if (!timemark) return 0;
  
  const clean = timemark.toString().trim();
  
  // Handle "123.45" (raw seconds)
  if (!clean.includes(':')) {
      const s = parseFloat(clean);
      return isNaN(s) ? 0 : s;
  }

  // Handle "HH:MM:SS.mm"
  const parts = clean.split(':');
  let seconds = 0;
  
  try {
    if (parts.length === 3) {
      const p1 = parseFloat(parts[0]) || 0;
      const p2 = parseFloat(parts[1]) || 0;
      const p3 = parseFloat(parts[2]) || 0;
      seconds = (p1 * 3600) + (p2 * 60) + p3;
    } else if (parts.length === 2) {
      const p1 = parseFloat(parts[0]) || 0;
      const p2 = parseFloat(parts[1]) || 0;
      seconds = (p1 * 60) + p2;
    }
  } catch (e) {
    return 0;
  }
  
  return isNaN(seconds) ? 0 : seconds;
}

// Helper: Escape FFmpeg metadata values
function escapeMetadata(str) {
  if (!str) return "Untitled";
  return str.replace(/[=;#\\]/g, '\\$&').replace(/\n/g, '\\n');
}

function createWindow() {
  const iconExt = process.platform === 'win32' ? 'ico' : 'png';
  const iconPath = app.isPackaged 
    ? path.join(__dirname, `../build/icon.${iconExt}`) 
    : path.join(__dirname, `../public/icon.${iconExt}`);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#020617',
    frame: false, // Custom frame for all platforms
    titleBarStyle: 'hidden', 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: iconPath
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../build/index.html')}`;
  mainWindow.loadURL(startUrl);

  // --- External Link Handling (Fixes links opening in app) ---
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Prevent internal windows from opening external links
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Also catch direct navigation (optional but safer)
  mainWindow.webContents.on('will-navigate', (event, url) => {
      if ((url.startsWith('http:') || url.startsWith('https:')) && !url.includes('localhost')) {
          event.preventDefault();
          shell.openExternal(url);
      }
  });

  // Window Control Handlers
  ipcMain.handle('window-minimize', () => mainWindow.minimize());
  ipcMain.handle('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.handle('window-close', () => mainWindow.close());
}

// --- SINGLE INSTANCE LOCK ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Ensure cleanup on quit
app.on('will-quit', () => {
  tempFiles.forEach(f => {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch (e) { console.error('Cleanup failed for:', f); }
  });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --- External Links ---

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (err) {
    console.error('[Main] Failed to open external URL:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('show-item-in-folder', async (event, filePath) => {
    if (filePath) {
        shell.showItemInFolder(filePath);
    }
});

ipcMain.handle('get-system-specs', async () => {
    try {
        const cpus = os.cpus();
        const cpuModel = cpus.length > 0 ? cpus[0].model.trim() : 'Unknown CPU';
        const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024)) + ' GB';
        return { cpu: cpuModel, memory: totalMem, platform: os.platform() };
    } catch (e) {
        return { cpu: 'Unknown', memory: 'Unknown', platform: 'Unknown' };
    }
});

// --- FFmpeg Management ---

ipcMain.handle('get-ffmpeg-version', async () => {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
            resolve(null);
        } else {
            const cmd = (ffmpeg._path || 'ffmpeg') + ' -version';
            exec(cmd, (error, stdout) => {
                if (error) { 
                    resolve('Detected (Bundled/System)'); 
                } else {
                    const line = stdout.split('\n')[0];
                    const match = line.match(/ffmpeg version (\S+)/);
                    resolve(match ? match[1] : 'Detected');
                }
            });
        }
    });
  });
});

ipcMain.handle('select-ffmpeg-custom-path', async () => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Locate FFmpeg Binary',
        properties: ['openFile'],
        filters: [
            { name: 'Executables', extensions: process.platform === 'win32' ? ['exe'] : ['*'] }
        ]
    });

    if (filePaths && filePaths.length > 0) {
        return filePaths[0];
    }
    return null;
});

ipcMain.handle('set-ffmpeg-path', async (event, customPath) => {
  if (!customPath || !fs.existsSync(customPath)) {
      return { success: false, error: 'Invalid path provided' };
  }

  return new Promise((resolve) => {
    execFile(customPath, ['-version'], (error, stdout, stderr) => {
      if (error) {
        return resolve({ success: false, error: 'Not a valid executable.' });
      }
      if (!stdout.includes('ffmpeg version') && !stderr.includes('ffmpeg version')) {
        return resolve({ success: false, error: 'Not FFmpeg.' });
      }
      try {
        ffmpeg.setFfmpegPath(customPath);
        const probeName = process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';
        const probePath = path.join(path.dirname(customPath), probeName);
        if (fs.existsSync(probePath)) {
            ffmpeg.setFfprobePath(probePath);
        }
        resolve({ success: true });
      } catch (err) {
        resolve({ success: false, error: 'Configuration error.' });
      }
    });
  });
});

// --- Logic ---

ipcMain.handle('select-save-location', async (event, { defaultName, extension }) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Merged Audio',
    defaultPath: `${defaultName}.${extension.toLowerCase()}`,
    filters: [
      { name: 'Audio File', extensions: [extension.toLowerCase()] }
    ]
  });
  return filePath;
});

ipcMain.handle('scan-files', async (event, filePaths) => {
    const promises = filePaths.map(filePath => {
        return new Promise((resolve) => {
            let finished = false;
            const timer = setTimeout(() => {
                if (!finished) {
                    finished = true;
                    resolve({ path: filePath, error: true });
                }
            }, 5000); 

            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (finished) return;
                finished = true;
                clearTimeout(timer);

                if (err) {
                    resolve({ path: filePath, error: true });
                    return;
                }
                
                let codec = 'Unknown';
                let sampleRate = 0;
                let bitrate = 'Unknown';
                let channels = 'Unknown';
                let duration = 0;
                let size = 0;

                const audioStream = metadata.streams && metadata.streams.find(s => s.codec_type === 'audio');
                const format = metadata.format;

                if (audioStream) {
                    codec = audioStream.codec_name?.toUpperCase() || 'MP3';
                    sampleRate = parseInt(audioStream.sample_rate || '0');
                    const channelsInt = audioStream.channels || 0;
                    channels = channelsInt === 1 ? 'Mono' : channelsInt === 2 ? 'Stereo' : `${channelsInt} Ch`;
                }

                if (format) {
                    duration = parseFloat(format.duration || '0');
                    if (format.size) {
                        size = parseInt(format.size);
                    }
                    if (format.bit_rate) {
                        bitrate = `${Math.round(parseInt(format.bit_rate) / 1000)}k`;
                    }
                }

                if (!audioStream && duration === 0) {
                     resolve({ path: filePath, error: true });
                     return;
                }

                resolve({ 
                    path: filePath, 
                    metadata: { codec, sampleRate, bitrate, channels, duration, size }
                });
            });
        });
    });

    return Promise.all(promises);
});

ipcMain.on('cancel-merge', () => {
  if (currentCommand) {
    try {
      currentCommand.kill();
    } catch (e) { console.error(e); }
    currentCommand = null;
  }
});

function getMajoritySampleRate(rates) {
    if (!rates || rates.length === 0) return 44100;
    const counts = {};
    let maxCount = 0;
    let majorityRate = rates[0];
    for (const rate of rates) {
        counts[rate] = (counts[rate] || 0) + 1;
        if (counts[rate] > maxCount) {
            maxCount = counts[rate];
            majorityRate = rate;
        }
    }
    return majorityRate;
}

// --- SPECIAL MP3 BINARY MERGE (Stream Copy Logic) ---
async function mergeMp3Binary(files, outputPath, mainWindow, totalDurationSeconds) {
    const tempRaw = path.resolve(os.tmpdir(), `af_raw_${Date.now()}.mp3`);
    tempFiles.add(tempRaw);
    
    try {
        // Step 1: Binary Concatenation
        const outputStream = fs.createWriteStream(tempRaw);
        let processedDuration = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let fileSize = 0;
            try { fileSize = fs.statSync(file.path).size; } catch(e) { }

            let bytesRead = 0;
            let lastUpdate = 0;

            await new Promise((resolve, reject) => {
                const rs = fs.createReadStream(file.path, { autoClose: true });
                
                if (fileSize > 0) {
                    rs.on('data', (chunk) => {
                        bytesRead += chunk.length;
                        const now = Date.now();
                        if (now - lastUpdate < 100) return;
                        lastUpdate = now;

                        const percentPerFile = 90 / files.length;
                        const basePercent = i * percentPerFile;
                        const filePercent = (bytesRead / fileSize) * percentPerFile;
                        const totalPercent = Math.min(90, basePercent + filePercent);
                        
                        const currentFileDuration = file.duration || 0;
                        const processedFileSeconds = (bytesRead / fileSize) * currentFileDuration;
                        const totalSecondsProcessed = processedDuration + processedFileSeconds;

                        if (mainWindow && !mainWindow.isDestroyed()) {
                             mainWindow.webContents.send('merge-progress', { 
                                stage: 'merging', 
                                percent: parseFloat(totalPercent.toFixed(2)), 
                                eta: 0, 
                                speed: 'High', 
                                currentSeconds: totalSecondsProcessed, 
                                totalSeconds: totalDurationSeconds 
                            });
                        }
                    });
                }

                rs.pipe(outputStream, { end: false });
                
                rs.on('end', () => {
                     const percentPerFile = 90 / files.length;
                     const currentEndPercent = (i + 1) * percentPerFile;
                     const currentTotalSeconds = processedDuration + (file.duration || 0);
                     
                     if (mainWindow && !mainWindow.isDestroyed()) {
                         mainWindow.webContents.send('merge-progress', { 
                            stage: 'merging', 
                            percent: parseFloat(currentEndPercent.toFixed(2)), 
                            eta: 0, 
                            speed: 'High', 
                            currentSeconds: currentTotalSeconds, 
                            totalSeconds: totalDurationSeconds 
                        });
                    }
                    resolve();
                });
                
                rs.on('error', reject);
            });
            
            processedDuration += (file.duration || 0);
        }
        outputStream.end();
        
        if (mainWindow && !mainWindow.isDestroyed()) {
             mainWindow.webContents.send('merge-progress', { 
                stage: 'finalizing', 
                percent: 90.0, 
                eta: 0, 
                speed: 'High', 
                currentSeconds: totalDurationSeconds, 
                totalSeconds: totalDurationSeconds 
            });
        }

        // Step 2: Fix Headers with FFmpeg
        await new Promise((resolve, reject) => {
            const cmd = ffmpeg(tempRaw)
                .inputOptions(['-hide_banner', '-loglevel error'])
                .outputOptions(['-c copy', '-id3v2_version 3'])
                .save(outputPath);
            
            // Check if first file exists to copy metadata/cover art from
            if (files.length > 0) {
                 // Add the first file as Input 1 (Input 0 is tempRaw)
                 cmd.input(files[0].path);
                 
                 // Map global metadata from the first file
                 cmd.outputOptions(['-map_metadata 1']);

                 if (files[0].hasCoverArt) {
                     // If cover art exists, map audio from tempRaw (0) and video from file 1 (1)
                     cmd.outputOptions([
                         '-map 0:a', 
                         '-map 1:v', 
                         '-c:v copy', 
                         '-disposition:v:0 attached_pic'
                     ]);
                 } else {
                     // Otherwise just map audio from tempRaw
                     cmd.outputOptions(['-map 0:a']);
                 }
            } else {
                // Fallback (shouldn't happen)
                cmd.outputOptions(['-map 0:a']);
            }

            cmd.on('start', () => {
                currentCommand = cmd;
            });

            cmd.on('progress', (p) => {
                 let step2Percent = 0;
                 if (p.timemark && totalDurationSeconds > 0) {
                     const seconds = parseTimemarkToSeconds(p.timemark);
                     step2Percent = (seconds / totalDurationSeconds) * 100;
                 } else if (p.percent) {
                     step2Percent = p.percent;
                 }
                 
                 const totalPercent = 90 + (step2Percent * 0.1);

                 if (mainWindow && !mainWindow.isDestroyed()) {
                     mainWindow.webContents.send('merge-progress', { 
                        stage: 'finalizing', 
                        percent: parseFloat(Math.min(99.9, totalPercent).toFixed(2)),
                        eta: 0, 
                        speed: 'High', 
                        currentSeconds: totalDurationSeconds, 
                        totalSeconds: totalDurationSeconds 
                    });
                }
            });

            cmd.on('end', () => {
                currentCommand = null;
                resolve();
            });
            
            cmd.on('error', (err) => {
                currentCommand = null;
                reject(err);
            });
        });

        if (fs.existsSync(tempRaw)) fs.unlinkSync(tempRaw);
        return true;

    } catch (e) {
        if (fs.existsSync(tempRaw)) fs.unlinkSync(tempRaw);
        throw e;
    }
}

// --- M4B LOGIC (Smart Chapter Detection) ---
function detectSpecialChapter(fileObj, allFiles, index) {
    const filename = path.basename(fileObj.path);
    const name = path.basename(filename, path.extname(filename)).toLowerCase();
    
    let cleanName = name.replace(/^[\d\s.\-_]+/, '').trim();
    if (!cleanName) cleanName = name; 

    const totalFiles = allFiles.length;

    const isExactMatch = (pattern) => {
        if (cleanName === pattern) return true;
        if (cleanName.startsWith(pattern)) {
             const remainder = cleanName.slice(pattern.length);
             if (!/[a-z0-9]/i.test(remainder)) {
                 return true;
             }
        }
        return false;
    };

    if (index < 3) {
        const openingPatterns = {
            'opening credits': 'Opening Credits',
            'opening credit': 'Opening Credits',
            'opening': 'Opening Credits',
            'prologue': 'Prologue',
            'introduction': 'Introduction',
            'intro': 'Introduction',
            'preface': 'Preface',
            'foreword': 'Foreword'
        };

        for (const [pattern, displayName] of Object.entries(openingPatterns)) {
            if (isExactMatch(pattern)) return displayName;
        }
    }

    if (index >= totalFiles - 3) {
        const endingPatterns = {
            'end credits': 'End Credits',
            'ending credits': 'End Credits',
            'credits': 'End Credits',
            'epilogue': 'Epilogue',
            'afterword': 'Afterword',
            'outro': 'Outro',
            'the end': 'The End',
            'conclusion': 'Conclusion'
        };

        for (const [pattern, displayName] of Object.entries(endingPatterns)) {
             if (isExactMatch(pattern)) return displayName;
        }
    }

    return null;
}

// --- MAIN MERGE HANDLER ---
ipcMain.on('start-merge', async (event, { files, outputPath, options }) => {
  if (!files || files.length === 0 || !outputPath) return;

  const bitrate = options.bitrate || '64k';
  const format = options.outputFormat || 'MP3';
  const autoFix = options.autoFix || false;
  const useCustomBitrate = options.useCustomBitrate || false;
  
  let totalDurationSeconds = 0;
  const validFiles = []; 
  const skippedFiles = [];
  const conflicts = [];
  let targetSampleRate = 44100;

  // 1. Validation Phase
  try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('merge-progress', { stage: 'analyzing', percent: 0, eta: 0, speed: '0.0x', currentSeconds: 0, totalSeconds: 0 });
      }

      const validationPromises = files.map(file => {
          return new Promise((resolve) => {
              let finished = false;
              const timer = setTimeout(() => {
                 if (!finished) { finished = true; resolve({ isValid: false, file, error: 'Timeout' }); }
              }, 5000);

              ffmpeg.ffprobe(file, (err, metadata) => {
                  if (finished) return;
                  finished = true;
                  clearTimeout(timer);

                  if (err) {
                      resolve({ isValid: false, file, error: 'Corrupt' });
                  } else {
                      let duration = 0;
                      let sampleRate = 0;
                      let codec = '';
                      let hasCoverArt = false;
                      
                      if (metadata.format && metadata.format.duration) {
                          duration = parseFloat(metadata.format.duration);
                      } 
                      
                      if (metadata.streams && metadata.streams.length > 0) {
                          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                          if (audioStream?.sample_rate) sampleRate = parseInt(audioStream.sample_rate);
                          if (audioStream?.codec_name) codec = audioStream.codec_name;
                          if (!duration && audioStream?.duration) duration = parseFloat(audioStream.duration);
                          
                          // Check for video stream (cover art)
                          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                          if (videoStream) hasCoverArt = true;
                      }

                      const title = path.basename(file, path.extname(file));
                      resolve({ isValid: true, file, duration, sampleRate, title, codec, hasCoverArt });
                  }
              });
          });
      });
      
      const results = await Promise.all(validationPromises);
      
      const validResults = [];
      results.forEach(res => {
          if (!res.isValid) conflicts.push({ fileName: path.basename(res.file), reason: 'CORRUPT', details: res.error });
          else if (res.duration <= 0) conflicts.push({ fileName: path.basename(res.file), reason: 'EMPTY', details: 'Zero duration' });
          else validResults.push(res);
      });

      const rates = validResults.map(r => r.sampleRate).filter(r => r > 0);
      targetSampleRate = getMajoritySampleRate(rates) || 44100;
      
      validResults.forEach(res => {
          if (res.sampleRate !== targetSampleRate) {
              conflicts.push({ fileName: path.basename(res.file), reason: 'SAMPLE_RATE_MISMATCH', details: `Rate: ${res.sampleRate}Hz` });
          }
      });

      if (conflicts.length > 0) {
          if (!autoFix) {
              if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('merge-conflicts-detected', { conflicts, targetSampleRate });
              return; 
          } else {
              results.forEach(res => {
                  if (res.isValid && res.duration > 0) {
                      validFiles.push({ path: res.file, duration: res.duration, title: res.title, codec: res.codec, hasCoverArt: res.hasCoverArt });
                      totalDurationSeconds += res.duration;
                  } else {
                      skippedFiles.push(path.basename(res.file));
                  }
              });
          }
      } else {
           validResults.forEach(res => {
              validFiles.push({ path: res.file, duration: res.duration, title: res.title, codec: res.codec, hasCoverArt: res.hasCoverArt });
              totalDurationSeconds += res.duration;
           });
      }

  } catch (err) {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('merge-error', "Validation failed.");
      return;
  }

  if (validFiles.length === 0) {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('merge-error', "No valid files.");
      return;
  }

  // --- MP3 STREAM COPY OPTIMIZATION ---
  if (format === 'MP3' && !useCustomBitrate && validFiles.every(f => f.path.toLowerCase().endsWith('.mp3'))) {
      try {
          await mergeMp3Binary(validFiles, outputPath, mainWindow, totalDurationSeconds);
          if (mainWindow && !mainWindow.isDestroyed()) {
              if (skippedFiles.length > 0) {
                  mainWindow.webContents.send('merge-complete-warning', { path: outputPath, skipped: skippedFiles });
              } else {
                  mainWindow.webContents.send('merge-complete', outputPath);
              }
          }
          return;
      } catch (err) {
          console.error("Binary merge failed, falling back to standard...", err);
      }
  }

  // --- METADATA GENERATION ---
  const timestamp = Date.now();
  const metadataPath = path.resolve(os.tmpdir(), `af_meta_${timestamp}.txt`);
  const concatListPath = path.resolve(os.tmpdir(), `af_concat_${timestamp}.txt`);
  
  tempFiles.add(metadataPath);
  tempFiles.add(concatListPath);

  try {
    let metadataContent = ';FFMETADATA1\n';
    let currentStart = 0;
    let chapterNum = 1;

    validFiles.forEach((f, idx) => {
      const specialName = detectSpecialChapter(f, validFiles, idx);
      
      let title;
      if (specialName) {
          title = specialName;
      } else {
          title = `Chapter ${chapterNum}`;
          chapterNum++;
      }
      
      title = escapeMetadata(title);
      
      const end = currentStart + (f.duration * 1000); 
      metadataContent += `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(currentStart)}\nEND=${Math.round(end)}\ntitle=${title}\n\n`;
      currentStart = end;
    });
    fs.writeFileSync(metadataPath, metadataContent);
  } catch (err) {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('merge-error', "Metadata error: " + err.message);
    return;
  }

  try {
      const concatContent = validFiles.map(f => {
          const normalizedPath = f.path.split(path.sep).join('/'); 
          const safePath = normalizedPath.replace(/'/g, "'\\''");
          return `file '${safePath}'`;
      }).join('\n');
      
      fs.writeFileSync(concatListPath, concatContent);
  } catch (err) {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('merge-error', "Concat list error: " + err.message);
      return;
  }

  // --- STANDARD FFMPEG COMMAND ---
  const command = ffmpeg();
  currentCommand = command;
  let startTime = Date.now();

  command
    .input(concatListPath)
    .inputOptions(['-f concat', '-safe 0'])
    .input(metadataPath)
    .inputOptions(['-f ffmetadata']);

  // Input 0: Concat List
  // Input 1: Metadata File (Chapters)
  // Input 2: First Audio File (for global tags and cover art) -> Always add this
  if (validFiles.length > 0) {
    command.input(validFiles[0].path);
  }

  const outputOpts = [
      '-map 0:a', 
      '-map_metadata 2', // Copy global tags (Artist, Album) from Input 2 (First file)
      '-map_chapters 1'  // Copy chapters from Input 1 (Generated metadata)
  ];

  // Logic to preserve cover art from the first file
  if (validFiles.length > 0 && validFiles[0].hasCoverArt) {
      // Map video stream from Input 2
      outputOpts.push('-map 2:v');
      outputOpts.push('-c:v copy');
      outputOpts.push('-disposition:v:0 attached_pic');
  }

  command.outputOptions(outputOpts);

  if (format === 'M4B') {
      command.format('mp4'); 
      command.outputOptions(['-movflags +faststart']);
      
      if (useCustomBitrate) {
          command.audioCodec('aac');
          command.audioBitrate(bitrate);
      } else {
          command.audioCodec('copy');
      }
  } else {
      if (!useCustomBitrate) {
          command.audioCodec('copy');
      } else {
          command.audioCodec('libmp3lame');
          command.audioBitrate(bitrate);
      }
      command.format('mp3');
      command.outputOptions(['-id3v2_version 3']);
  }

  command.save(outputPath);

  command
    .on('start', () => {
      startTime = Date.now();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('merge-progress', { 
            stage: 'transcoding', 
            percent: 0, 
            eta: totalDurationSeconds, 
            speed: '0.0x',
            currentSeconds: 0,
            totalSeconds: totalDurationSeconds
        });
      }
    })
    .on('progress', (progress) => {
      let percent = 0;
      let processedSeconds = 0;

      // Robust time parsing to avoid broken progress bars
      if (progress.timemark) {
          processedSeconds = parseTimemarkToSeconds(progress.timemark);
      }

      if (totalDurationSeconds > 0) {
          percent = (processedSeconds / totalDurationSeconds) * 100;
      } else if (progress.percent && !isNaN(progress.percent)) {
          percent = progress.percent;
      }
      
      // Sanity clamp
      if (isNaN(percent)) percent = 0;
      percent = Math.min(Math.max(0, percent), 99);

      const elapsedWallTime = (Date.now() - startTime) / 1000;
      let speedFactor = 0;
      let eta = 0;

      if (elapsedWallTime > 1 && processedSeconds > 0) {
          speedFactor = processedSeconds / elapsedWallTime;
          if (speedFactor > 0 && totalDurationSeconds > 0) {
            const remainingSeconds = totalDurationSeconds - processedSeconds;
            eta = Math.max(0, remainingSeconds / speedFactor);
          }
      }

      let stage = percent > 98 ? 'finalizing' : 'transcoding';
      if (!useCustomBitrate && speedFactor > 50) {
          stage = 'merging';
      }

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('merge-progress', { 
          stage, 
          percent: parseFloat(percent.toFixed(2)), 
          eta: Math.ceil(eta), 
          speed: speedFactor.toFixed(1) + 'x',
          currentSeconds: processedSeconds,
          totalSeconds: totalDurationSeconds
        });
      }
    })
    .on('error', (err) => {
      console.error(err);
      if (!err.message.includes('SIGKILL') && mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('merge-error', err.message);
      }
      currentCommand = null;
    })
    .on('end', () => {
      currentCommand = null;
      try {
        if (fs.existsSync(metadataPath)) fs.unlinkSync(metadataPath);
        if (fs.existsSync(concatListPath)) fs.unlinkSync(concatListPath);
        tempFiles.delete(metadataPath);
        tempFiles.delete(concatListPath);
      } catch (e) { /* ignore */ }

      if (mainWindow && !mainWindow.isDestroyed()) {
        if (skippedFiles.length > 0) {
            mainWindow.webContents.send('merge-complete-warning', { path: outputPath, skipped: skippedFiles });
        } else {
            mainWindow.webContents.send('merge-complete', outputPath);
        }
      }
    });
});
