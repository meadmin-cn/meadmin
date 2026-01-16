import { app } from '@/app';
import { VxeModal, VxeUI } from 'vxe-pc-ui';
import 'vxe-pc-ui/es/style.css';
import { VxeColgroup, VxeColumn, VxeGrid, VxeTable, VxeToolbar } from 'vxe-table';
import VXETablePluginElement from 'vxe-table-plugin-element';
import 'vxe-table-plugin-element/dist/style.css';
import 'vxe-table/es/style.css';
VxeUI.use(VXETablePluginElement);
if (app?.config?.globalProperties?.$start) {
  app.use(VxeModal);
  app.use(VxeTable);
  app.use(VxeColumn);
  app.use(VxeColgroup);
  app.use(VxeGrid);
  app.use(VxeToolbar);
}
