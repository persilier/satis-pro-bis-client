const appConfig = {
  version: "2020.1",
  name: "SATIS",
  appFullName: (plan) => `SATIS ${plan} 2020.1`,
  enterprise: "DMD",
  contact: "21256325",
  timeAfterDisconnection: 8,
  apiDomaine: `http://url`,
  host: `host`,
  port: 8000,
  language: "fr",
  useManyLanguage: "false",
  listConnectData: {
    PRO: {
      grant_type: "grant_type",
      client_id: 2,
      client_secret: "client_secret",
      username: "username",
      password: "password",
    },
    HUB: {
      grant_type: "grant_type",
      client_id: 2,
      client_secret: "client_secret",
      username: "username",
      password: "password",
    },
    MACRO: {
      grant_type: "grant_type",
      client_id: 2,
      client_secret: "client_secret",
      username: "username",
      password: "password",
    },
  },
};
export default appConfig;
export const suportUrl = `http://163.172.106.97:8906/auth/login-1`;
