import type { CrmClient } from "../crm/types.js";
import { logger } from "../lib/logger.js";

export function logConversationMessage(
    crmClient: CrmClient,
    clientPhone: string,
    clientName: string | undefined,
    messageType: "USER" | "BOT",
    messageContent: string,
): void {
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
