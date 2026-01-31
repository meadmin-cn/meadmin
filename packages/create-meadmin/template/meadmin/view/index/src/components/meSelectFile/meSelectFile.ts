import { useActionModel } from '@/hooks/index.js';
import MeSelectFile from './index.vue';
export const useMeSelectFile = () => useActionModel(MeSelectFile, true, 'show');
