export class DriveService {
  private static instance: DriveService;

  private constructor() {}

  public static getInstance(): DriveService {
    if (!DriveService.instance) {
      DriveService.instance = new DriveService();
    }
    return DriveService.instance;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('Usuário não autenticado ou sem permissão para o Google Drive.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken}`);

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google Drive API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }
    return response.json();
  }

  private async getAccessToken(): Promise<string | null> {
    // This will be provided by the AuthContext or stored in a way accessible here
    // For now, we assume it's stored in a global/window variable after sign-in
    return (window as any).googleAccessToken || null;
  }

  public async getOrCreateFolder(folderName: string, parentId?: string): Promise<string> {
    const q = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${parentId ? ` and '${parentId}' in parents` : ''}`);
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id, name)`;
    
    const listResult = await this.fetchWithAuth(listUrl);

    if (listResult.files && listResult.files.length > 0) {
      return listResult.files[0].id;
    }

    // Create folder
    const createUrl = 'https://www.googleapis.com/drive/v3/files?fields=id';
    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : [],
    };

    const createResult = await this.fetchWithAuth(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });

    return createResult.id;
  }

  public async uploadFile(file: File | Blob, fileName: string, folderId: string): Promise<string> {
    const metadata = {
      name: fileName,
      mimeType: file.type,
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
    const accessToken = await this.getAccessToken();
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Upload Error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  }

  public async backupData(data: any, fileName: string, folderId: string): Promise<string> {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    return this.uploadFile(blob, fileName, folderId);
  }

  public async listFiles(folderId: string): Promise<any[]> {
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id, name, mimeType, size, webViewLink, iconLink, createdTime)&orderBy=name`;
    const result = await this.fetchWithAuth(url);
    return result.files || [];
  }

  public async deleteFile(fileId: string): Promise<void> {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
    await this.fetchWithAuth(url, {
      method: 'DELETE',
    });
  }

  public async searchFolders(name: string): Promise<any[]> {
    const q = encodeURIComponent(`name contains '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id, name)`;
    const result = await this.fetchWithAuth(url);
    return result.files || [];
  }
}

export const driveService = DriveService.getInstance();
