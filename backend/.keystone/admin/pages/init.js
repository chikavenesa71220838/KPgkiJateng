import { getInitPage } from '@keystone-6/auth/pages/InitPage';

const fieldPaths = ["name","email","password"];

export default getInitPage({"listKey":"Admin","fieldPaths":["name","email","password"],"enableWelcome":true});
