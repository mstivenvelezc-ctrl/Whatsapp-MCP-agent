import { logger } from "../lib/logger.js";
export function logConversationMessage(crmClient, clientPhone, clientName, messageType, messageContent) {
    crmClient
        .logMessage({
        clientPhone,
        messageType,
        messageContent,
        ...(clientName !== undefined ? { clientName } : {}),
    })
        .catch((error) => {
        logger.warn("Failed to log conversation message in CRM", { clientPhone, messageType, error });
    });
}
//# sourceMappingURL=conversationLogging.js.map