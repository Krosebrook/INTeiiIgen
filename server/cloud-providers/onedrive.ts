// OneDrive integration - connection:conn_onedrive_01K59Z90HS95C1XGJ2TN746J6P
import { Client } from '@microsoft/microsoft-graph-client';

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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=onedrive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('OneDrive not connected');
  }
  return accessToken;
}

export async function getOneDriveClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

export async function listOneDriveFiles(folderId?: string) {
  const client = await getOneDriveClient();
  
  let endpoint = '/me/drive/root/children';
  if (folderId) {
    endpoint = `/me/drive/items/${folderId}/children`;
  }
  
  const response = await client.api(endpoint).get();
  
  return (response.value || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    mimeType: item.file?.mimeType || (item.folder ? 'folder' : 'unknown'),
    size: item.size,
    modifiedTime: item.lastModifiedDateTime,
    isFolder: !!item.folder,
  }));
}

export async function downloadOneDriveFile(fileId: string) {
  const client = await getOneDriveClient();
  
  // Get file metadata first
  const fileMeta = await client.api(`/me/drive/items/${fileId}`).get();
  
  // Download the file content
  const response = await client.api(`/me/drive/items/${fileId}/content`).get();
  
  return {
    name: fileMeta.name,
    mimeType: fileMeta.file?.mimeType || 'application/octet-stream',
    content: Buffer.from(response),
  };
}

export async function isOneDriveConnected(): Promise<boolean> {
  try {
    await getAccessToken();
    return true;
  } catch {
    return false;
  }
}
