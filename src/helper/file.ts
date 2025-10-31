import type { File } from '../entities/file.entity.js';
export const uploadStorage = {
  local: {
    getUrl(file: File) {
      return `/api/admin/file/get/${file.id}/${file.name}`;
    },
  },
};
