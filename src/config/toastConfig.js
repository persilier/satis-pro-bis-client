import i18n from "../i18n";
import Swal from "sweetalert2";

export const toastBottomEndConfig =  {
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 6000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
};

export const toastLongBottomEndConfig =  {
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 9000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
};

export const toastTopEndConfig =  {
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
};

export const toastTopStartConfig =  {
    toast: true,
    position: 'top-start',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
};

export const toastBottomStartConfig =  {
    toast: true,
    position: 'bottom-start',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
};

export const toastCenterStartConfig =  {
    toast: true,
    position: 'center-start',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
};

export const toastCenterEndConfig =  {
    toast: true,
    position: 'center-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
};

export const toastAddErrorMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'error',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white' class='m-4'>${i18n.t("Echec de l'enregistrement")}</strong>`
            }
        ) : null
    )

};

export const toastAddSuccessMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Succès de l'enregistrement")}</strong>`
            }
        ) : null
    )

};
export const toastConnectSuccessMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Connexion réussie")}</strong>`
            }
        ) : null
    )
};
export const toastConnectErrorMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'error',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Connexion échouée")}</strong>`
            }
        ) : null
    )
};

export const toastEditSuccessMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Succès de la modification")}</strong>`
            }
        ) : null
    )
};

export const toastEditErrorMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'error',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white' class='m-4'>${i18n.t("Echec de la modification")}</strong>`
            }
        ) : null
    )

};

export const toastDeleteSuccessMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white' class='m-4'>${i18n.t("Succès de la suppression")}</strong>`
            }
        ) : null
    )

};

export const toastDeleteSuccessMessageConfigUser = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white' class='m-4'>${i18n.t("Succès de la déconnexion")}</strong>`
            }
        ) : null
    )

};

export const toastDeleteErrorMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'error',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white' class='m-4'>${i18n.t("Echec de la suppression")}</strong>`
            }
        ) : null
    )

};

export const toastErrorMessageWithParameterConfig = (message) => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'error',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white' class='m-4'>${message}</strong>`
            }
        ) : null
    )
};

export const toastSuccessMessageWithParameterConfig = (message) => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white' class='m-4'>${message}</strong>`
            }
        ) : null
    )

};

export const toastMergeSuccessMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Plainte fusionée avec succes")}</strong>`
            }
        ) : null
    )
};

export const toastRejectClaimSuccessMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Réclamation rejetée avec succès")}</strong>`
            }
        ) : null
    )
};

export const toastAssignClaimSuccessMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Réclamation affectée avec succès")}</strong>`
            }
        ) : null
    )
};

export const toastRejectTreatmentClaimSuccessMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Rejeter avec succès")}</strong>`
            }
        ) : null
    )
};

export const toastValidateTreatmentClaimSuccessMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Succès de la validation")}</strong>`
            }
        ) : null
    )

};

export const toastInvalidPeriodMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'error',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Période invalide")}</strong>`
            }
        ) : null
    )

};

export const toastValidPeriodMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'success',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>${i18n.t("Période valide")}</strong>`
            }
        ) : null
    )
};
