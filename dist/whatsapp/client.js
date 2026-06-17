import { UpstreamServiceError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
export class CloudApiWhatsappClient {
    config;
    fetchImpl;
    constructor(config) {
        this.config = config;
        this.fetchImpl = config.fetchImpl ?? fetch;
    }
    async sendTextMessage(to, body) {
        const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;
        let response;
        try {
            response = await this.fetchImpl(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to,
                    type: "text",
                    text: { body },
                }),
            });
        }
        catch (error) {
            throw new UpstreamServiceError("whatsapp", "Failed to reach WhatsApp Cloud API", error);
        }
        if (!response.ok) {
            const errorBody = await response.text().catch(() => "<no body>");
            logger.error("WhatsApp send message failed", { status: response.status, errorBody });
            throw new UpstreamServiceError("whatsapp", `WhatsApp Cloud API responded with status ${response.status}`);
        }
    }
}
//# sourceMappingURL=client.js.map