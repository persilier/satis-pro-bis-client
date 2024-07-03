import i18n from "../i18n";

export const notificationConfig = () => {
  return i18n.isInitialized
    ? {
        "acknowledgment-of-receipt-incoming": i18n.t(
          "Accusé de réception par mail"
        ),
        "acknowledgment-of-receipt": i18n.t("Accusé de réception"),
        "register-a-claim": i18n.t("Enregistrer une réclamation"),
        "complete-a-claim": i18n.t("Completer une réclamation"),
        "transferred-to-targeted-institution": i18n.t(
          "Transféré à une institution ciblée"
        ),
        "transferred-to-unit": i18n.t("Transféré à l'unité"),
        "assigned-to-staff": i18n.t("Assigné au personnel"),
        "reject-a-claim": i18n.t("Rejeter une réclamation"),
        "treat-a-claim": i18n.t("Traiter une réclamation"),
        "invalidate-a-treatment": i18n.t("Invalider un traitement"),
        "validate-a-treatment": i18n.t("Valider un traitement"),
        "communicate-the-solution": i18n.t("Communiquer la solution"),
        "communicate-the-solution-unfounded": i18n.t(
          "Communiquer la solution sans fondement"
        ),
        "add-contributor-to-discussion": i18n.t(
          "Ajouter contributeur à la discussion"
        ),
        "post-discussion-message": i18n.t("Message post discussion"),
        "reminder-before-deadline": i18n.t(
          "Relance automatique avant échéance"
        ),
        "reminder-after-deadline": i18n.t("Relance automatique après échéance"),
        "recurrence-alert": i18n.t("Maximum réclamations tolérable"),
        "revoke-claim-claimer-notification": i18n.t(
          "Notifier le réclamant lorsqu'on révoque la réclamation"
        ),
        "revoke-claim-staff-notification": i18n.t(
          "Notifier le pilote lorsqu'on révoque la réclamation"
        ),
        "register-a-claim-high-force-fulness": i18n.t(
          "Enregistrement d'une réclamation ayant un niveau de gravité élève"
        ),
      }
    : null;
};

export const EventNotification = [
  "AcknowledgmentOfReceipt",
  "AddContributorToDiscussion",
  "AssignedToStaff",
  "CommunicateTheSolution",
  "CompleteAClaim",
  "InvalidateATreatment",
  "PostDiscussionMessage",
  "RegisterAClaim",
  "RejectAClaim",
  "TransferredToTargetedInstitution",
  "TransferredToUnit",
  "TreatAClaim",
  "ValidateATreatment",
];

export const EventNotificationPath = {
  AddContributorToDiscussion: (id) => `/chat#message-chat`,
  AssignedToStaff: (id) => `/process/claim-assign/${id}/detail`,
  CompleteAClaim: (id) => `/process/claim-assign/${id}/detail`,
  InvalidateATreatment: (id) => `/process/claim-assign/to-staff/${id}/detail`,
  PostDiscussionMessage: (id) => `/message-receved`,
  RegisterAClaim: {
    full: (id) => `/process/claim-assign/${id}/detail`,
    incomplete: (id) => `/process/incomplete_claims/edit/${id}`,
  },
  RejectAClaim: (id) => `/process/claim-assign/${id}/detail`,
  TransferredToTargetedInstitution: (id) =>
    `/process/claim-assign/${id}/detail`,
  TransferredToUnit: (id) => `/process/claim-list-detail/${id}/detail`,
  TreatAClaim: (id) => `/process/claim-to-validated/${id}/detail`,
  ValidateATreatment: (id) => `/process/claim_measure/${id}/detail`,
};

export const RelaunchNotification = [
  "ReminderBeforeDeadline",
  "ReminderAfterDeadline",
  "Recurrence",
  "RegisterAClaimHighForcefulness",
];
