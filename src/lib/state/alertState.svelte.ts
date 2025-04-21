import { ALERT_TYPES } from "$lib/ts/constants";

type AlertType = typeof ALERT_TYPES[keyof typeof ALERT_TYPES];

export const alertMessage = $state({message:''});
export const alertType = $state<{type: AlertType}>({type:ALERT_TYPES.INFO});

export const displayAlert = (message:string, type: AlertType = ALERT_TYPES.INFO, resetTime = 3000) => { 
    alertMessage.message = message;
    alertType.type = type;
    setTimeout(() => {
        alertMessage.message = '';
        alertType.type = ALERT_TYPES.INFO;
    }, resetTime);
}
