import { FileType, AudioFile } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileType = (fileName: string): FileType => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'mp3') return FileType.MP3;
  if (ext === 'm4b') return FileType.M4B;
  return FileType.UNKNOWN;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const processIncomingFiles = (incomingFiles: File[]): AudioFile[] => {
  const validFiles = incomingFiles
    .filter(f => f.name.toLowerCase().endsWith('.mp3') || f.name.toLowerCase().endsWith('.m4b'))
    .map(f => ({
      id: generateId(),
      file: f,
      name: f.name,
      size: f.size,
      type: getFileType(f.name),
      status: 'pending' as const
    }));
  
  validFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  
  return validFiles;
};

// Recursive folder scanning logic
export const scanDroppedItems = async (items: DataTransferItemList): Promise<File[]> => {
  const files: File[] = [];

  // Helper to read entries from a directory reader
  const readEntries = (reader: any): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      reader.readEntries((entries: any[]) => resolve(entries), (err: any) => reject(err));
    });
  };

  // Recursive scanner
  const scanEntry = async (entry: any) => {
    if (!entry) return;

    if (entry.isFile) {
      await new Promise<void>((resolve) => {
        entry.file((file: File) => {
          files.push(file);
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      let entries: any[] = [];
      
      // Read all entries in the directory (loop needed as browsers may return batches)
      try {
        let batch = await readEntries(reader);
        while (batch.length > 0) {
          entries = entries.concat(batch);
          batch = await readEntries(reader);
        }
      } catch (e) {
        console.warn("Error reading directory:", e);
      }
      
      for (const child of entries) {
        await scanEntry(child);
      }
    }
  };

  const promises = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // webkitGetAsEntry is standard in modern browsers/Electron for drag-drop
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
    if (entry) {
      promises.push(scanEntry(entry));
    } else if (item.kind === 'file') {
      const file = item.getAsFile();
      if(file) files.push(file);
    }
  }

  await Promise.all(promises);
  return files;
};
