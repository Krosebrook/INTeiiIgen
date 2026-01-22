// Google Drive integration - connection:conn_google-drive_01K6KBTJDC1F8FX3ZWQ14F2MRA
import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

export async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function listGoogleDriveFiles(folderId?: string) {
  const drive = await getGoogleDriveClient();
  
  let query = "trashed = false";
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  }
  
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, mimeType, size, modifiedTime, parents)',
    pageSize: 100,
  });
  
  return response.data.files || [];
}

export async function downloadGoogleDriveFile(fileId: string) {
  const drive = await getGoogleDriveClient();
  
  // Get file metadata first
  const fileMeta = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size',
  });
  
  // Check if it's a Google Doc/Sheet - need to export
  const mimeType = fileMeta.data.mimeType;
  
  if (mimeType?.startsWith('application/vnd.google-apps')) {
    // Export Google Docs
    let exportMimeType = 'text/plain';
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      exportMimeType = 'text/csv';
    } else if (mimeType === 'application/vnd.google-apps.document') {
      exportMimeType = 'text/plain';
    }
    
    const response = await drive.files.export({
      fileId,
      mimeType: exportMimeType,
    }, { responseType: 'arraybuffer' });
    
    return {
      name: fileMeta.data.name || 'file',
      mimeType: exportMimeType,
      content: Buffer.from(response.data as ArrayBuffer),
    };
  }
  
  // Download regular files
  const response = await drive.files.get({
    fileId,
    alt: 'media',
  }, { responseType: 'arraybuffer' });
  
  return {
    name: fileMeta.data.name || 'file',
    mimeType: fileMeta.data.mimeType || 'application/octet-stream',
    content: Buffer.from(response.data as ArrayBuffer),
  };
}

export async function isGoogleDriveConnected(): Promise<boolean> {
  try {
    await getAccessToken();
    return true;
  } catch {
    return false;
  }
}
