import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import appConfig from "../config/appConfig";
import {debug} from "../helpers/function";

const useReadNotification = (claimId, registerAClaim = null) => {
    const [isRead, setIsRead] = useState(false);

    const verifyRegisterAClaim = useCallback((rAClaim, status, type) => {
        if (!registerAClaim)
            return true;
        if (type === "RegisterAClaim") {
            if (rAClaim === status)
                return true;
            else
                return false;
        } else {
            return true
        }
    }, []);

    const getClaimId = useCallback((id, notifications, rAClaim) => {
        debug(notifications, "notifications");
        return notifications.filter(
            n => {
                return n.data.claim.id === id && n.type.substr(39, n.type.length) !== "PostDiscussionMessage" && n.type.substr(39, n.type.length) !== "AddContributorToDiscussion" && verifyRegisterAClaim(rAClaim, n.data.claim.status, n.type.substr(39, n.type.length))
            }
        );
    }, []);

    const formatId = useCallback((notifications) => {
        const ids = [];
        notifications.map(n => ids.push(n.id));
        return ids;
    }, []);

    const readNotification = useCallback(async (notificationId) => {
        const allNotifications = JSON.parse(localStorage.getItem("eventNotification"));
        const restNotification = allNotifications.filter(n => !notificationId.includes(n.id));
        const data = {
            "notifications": notificationId
        };
        await axios.put(`${appConfig.apiDomaine}/unread-notifications`, data)
            .then(({data}) => {
                localStorage.removeItem("eventNotification");
                localStorage.setItem("eventNotification", JSON.stringify(restNotification));
                setIsRead(true);
            })
            .catch(({response}) => {console.log("Something is wrong")})
    }, []);

    useEffect(() => {
        if (claimId) {
            const eventNotification = JSON.parse(localStorage.getItem("eventNotification"));
            const existingId = getClaimId(claimId, eventNotification, registerAClaim);
            debug(existingId, "existingId");

            // Read notification
            if (existingId.length)
                readNotification(formatId(existingId))
        }
    }, [claimId, registerAClaim]);

    return [
        isRead
    ];
};

export default useReadNotification;
