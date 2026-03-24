import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { env } from 'src/config/env';
import { add401Interceptor } from 'src/services/tokenRefresh';

export const FILE_TYPE_HERO_AVATAR = 'hero-avatar';

interface FileUploadResponse {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  fileType: string;
}

const filesApi = axios.create({
  baseURL: env.filesApiUrl,
  withCredentials: true,
  timeout: 60000,
});

add401Interceptor(filesApi);

export default {
  upload(file: File, fileType: string): Promise<AxiosResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    return filesApi.post('/files', formData);
  },

  buildUrl(fileType: string, key: string): string {
    return `${env.filesApiUrl}/files/${fileType}/${key}`;
  },

  buildHeroAvatarUrl(key: string): string {
    return `${env.filesApiUrl}/files/${FILE_TYPE_HERO_AVATAR}/${key}`;
  },
};
