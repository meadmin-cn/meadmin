import request from '@/utils/request.js';
import type { FileInfo } from './file.js';
import type { SystemAdminInfo } from './system/admin.js';

export type AdminProfileInfo = Pick<SystemAdminInfo, 'id' | 'username' | 'nickname' | 'mobile' | 'email' | 'status' | 'avatar'> & {
  roles: { id: string; roleName: string }[];
  organizations: { id: string; orgName: string }[];
};

export type AdminProfileUpdate = {
  nickname: string;
  email?: string;
  mobile: string;
  avatar?: FileInfo | null;
  oldPassword?: string;
  newPassword?: string;
};

export function adminProfileInfoApi() {
  return request<AdminProfileInfo, []>(() => ({ url: 'profile/info', method: 'get' }), { noLoading: true });
}

export function updateAdminProfileApi() {
  return request<AdminProfileInfo, [AdminProfileUpdate]>((data) => ({ url: 'profile/up', method: 'post', data }), { success: true, noLoading: true });
}
