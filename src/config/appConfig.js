const appConfig = {
    version: "2022.1",
    name: 'SATIS',
    appFullName: (plan) => `SATIS ${plan} 2022.1`,
    enterprise: 'DMD',
    contact: '21256325',
    timeAfterDisconnection: 8,
    //apiDomaine: `https://satis-pro-bis-server.satis-soft.com`,
    apiDomaine: `http://127.0.0.1:8000`,
    host: `http://127.0.0.1`,
    port: 8000,
    listConnectData: {
        PRO: {
            grant_type: "password",
            client_id: 2,
            client_secret: "1pbAfr622mag4bKQuHOQpl1k89hG6Jv35f8TYHqC",
            username: "username",
            password: "password",
        },
        HUB: {
            grant_type: "password",
            client_id: 2,
            client_secret: "client_secret",
            username: "username",
            password: "password"
        },
        MACRO: {
            grant_type: "grant_type",
            client_id: 2,
            client_secret: "client_secret",
            username: "username",
            password: "password"
        }
    }
};
export default appConfig
export const suportUrl = `http://163.172.106.97:8906/auth/login-1`;
