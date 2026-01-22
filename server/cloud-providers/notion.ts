// Notion integration - connection:conn_notion_01K59ZAA1KK7Q76YG1F17CT4JC
import { Client } from '@notionhq/client';

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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Notion not connected');
  }
  return accessToken;
}

export async function getNotionClient() {
  const accessToken = await getAccessToken();
  return new Client({ auth: accessToken });
}

export async function listNotionPages() {
  const notion = await getNotionClient();
  
  const response = await notion.search({
    filter: {
      property: 'object',
      value: 'page',
    },
    page_size: 100,
  });
  
  return response.results.map((page: any) => ({
    id: page.id,
    name: getNotionTitle(page),
    type: 'page',
    modifiedTime: page.last_edited_time,
    url: page.url,
  }));
}

export async function listNotionDatabases() {
  const notion = await getNotionClient();
  
  const response = await notion.search({
    filter: {
      property: 'object',
      value: 'database',
    },
    page_size: 100,
  });
  
  return response.results.map((db: any) => ({
    id: db.id,
    name: getNotionTitle(db),
    type: 'database',
    modifiedTime: db.last_edited_time,
    url: db.url,
  }));
}

export async function getNotionDatabaseRows(databaseId: string) {
  const notion = await getNotionClient();
  
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  });
  
  // Extract property values into a flat structure
  const rows = response.results.map((page: any) => {
    const row: Record<string, any> = { id: page.id };
    
    for (const [key, prop] of Object.entries(page.properties || {})) {
      row[key] = extractNotionPropertyValue(prop);
    }
    
    return row;
  });
  
  return rows;
}

export async function getNotionPageContent(pageId: string) {
  const notion = await getNotionClient();
  
  // Get page metadata
  const page = await notion.pages.retrieve({ page_id: pageId });
  
  // Get page blocks (content)
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100,
  });
  
  // Extract text from blocks
  const content = blocks.results.map((block: any) => extractBlockText(block)).filter(Boolean).join('\n');
  
  return {
    id: pageId,
    title: getNotionTitle(page),
    content,
    lastEdited: (page as any).last_edited_time,
  };
}

function getNotionTitle(obj: any): string {
  if (obj.properties?.title?.title?.[0]?.plain_text) {
    return obj.properties.title.title[0].plain_text;
  }
  if (obj.properties?.Name?.title?.[0]?.plain_text) {
    return obj.properties.Name.title[0].plain_text;
  }
  if (obj.title?.[0]?.plain_text) {
    return obj.title[0].plain_text;
  }
  return 'Untitled';
}

function extractNotionPropertyValue(prop: any): any {
  if (!prop) return null;
  
  switch (prop.type) {
    case 'title':
    case 'rich_text':
      return prop[prop.type]?.map((t: any) => t.plain_text).join('') || '';
    case 'number':
      return prop.number;
    case 'select':
      return prop.select?.name || null;
    case 'multi_select':
      return prop.multi_select?.map((s: any) => s.name) || [];
    case 'date':
      return prop.date?.start || null;
    case 'checkbox':
      return prop.checkbox;
    case 'url':
      return prop.url;
    case 'email':
      return prop.email;
    case 'phone_number':
      return prop.phone_number;
    case 'formula':
      return extractNotionPropertyValue(prop.formula);
    case 'relation':
      return prop.relation?.map((r: any) => r.id) || [];
    case 'rollup':
      return prop.rollup?.array?.map((a: any) => extractNotionPropertyValue(a)) || [];
    case 'people':
      return prop.people?.map((p: any) => p.name || p.id) || [];
    case 'files':
      return prop.files?.map((f: any) => f.name || f.file?.url || f.external?.url) || [];
    case 'created_time':
      return prop.created_time;
    case 'last_edited_time':
      return prop.last_edited_time;
    case 'created_by':
    case 'last_edited_by':
      return prop[prop.type]?.name || prop[prop.type]?.id;
    case 'status':
      return prop.status?.name || null;
    default:
      return null;
  }
}

function extractBlockText(block: any): string {
  if (!block) return '';
  
  const type = block.type;
  const content = block[type];
  
  if (content?.rich_text) {
    return content.rich_text.map((t: any) => t.plain_text).join('');
  }
  
  return '';
}

export async function isNotionConnected(): Promise<boolean> {
  try {
    await getAccessToken();
    return true;
  } catch {
    return false;
  }
}
