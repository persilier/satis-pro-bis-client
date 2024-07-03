import Swal from "sweetalert2/src/sweetalert2.js";
import {
    toastTopStartConfig,
    toastTopEndConfig,
    toastBottomStartConfig,
    toastBottomEndConfig,
    toastCenterStartConfig,
    toastCenterEndConfig, toastLongBottomEndConfig
} from "../../config/toastConfig";

export const ToastTopStart = Swal.mixin(toastTopStartConfig);
export const ToastTopEnd = Swal.mixin(toastTopEndConfig);
export const ToastBottomStart = Swal.mixin(toastBottomStartConfig);
export const ToastBottomEnd = Swal.mixin(toastBottomEndConfig);
export const ToastLongBottomEnd = Swal.mixin(toastLongBottomEndConfig);
export const ToastCenterStart = Swal.mixin(toastCenterStartConfig);
export const ToastCenterEnd = Swal.mixin(toastCenterEndConfig);
