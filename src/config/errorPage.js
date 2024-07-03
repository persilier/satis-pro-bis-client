export const ERROR_401 = "/error401";

export const redirectError401Page = code => {
    if (code === 401)
        window.location.href = ERROR_401;
};
