import { useActionModel } from '@/hooks/index.js';
import MeSelectFile from './index.vue';
export const useMeSelectUserFile = ()=> useActionModel(MeSelectFile, true, 'show');