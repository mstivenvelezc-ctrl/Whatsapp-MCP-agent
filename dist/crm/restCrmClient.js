import { UpstreamServiceError } from "../lib/errors.js";
export class RestCrmClient {
    config;
    fetchImpl;
    constructor(config) {
        this.config = config;
        this.fetchImpl = config.fetchImpl ?? fetch;
    }
    async getAvailableDates() {
        const response = await this.request("GET", "/api/appointments/available-dates");
        return (await this.parseJson(response));
    }
    async getAvailableSlots(date) {
        const response = await this.request("GET", `/api/appointments/available-slots?date=${encodeURIComponent(date)}`);
        return (await this.parseJson(response));
    }
    async createAppointment(input) {
        const response = await this.request("POST", "/api/appointments", input);
        return (await this.parseJson(response));
    }
    async listActiveProducts() {
        const response = await this.request("GET", "/api/products/active");
        return (await this.parseJson(response));
    }
    async createOrder(input) {
        const products = await this.listActiveProducts();
        const productsById = new Map(products.map((product) => [product.id, product]));
        const items = input.items.map((item) => {
            const product = productsById.get(item.productId);
            if (!product) {
                throw new Error(`Producto ${item.productId} no existe o no está activo`);
            }
            return {
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.price,
                subtotal: product.price * item.quantity,
            };
        });
        const body = {
            order: {
                clientPhone: input.clientPhone,
                type: input.type,
                ...(input.clientName !== undefined ? { clientName: input.clientName } : {}),
                ...(input.notes !== undefined ? { notes: input.notes } : {}),
            },
            items,
        };
        const response = await this.request("POST", "/api/orders", body);
        return (await this.parseJson(response));
    }
    async logMessage(input) {
        await this.request("POST", "/api/messages", {
            clientPhone: input.clientPhone,
            messageType: input.messageType,
            messageContent: input.messageContent,
            ...(input.clientName !== undefined ? { clientName: input.clientName } : {}),
        });
    }
    async escalateToAgent(input) {
        const response = await this.request("POST", "/api/ai/escalate", {
            clientPhone: input.clientPhone,
            requestText: input.requestText,
            ...(input.clientName !== undefined ? { clientName: input.clientName } : {}),
        });
        return (await this.parseJson(response));
    }
    async request(method, path, body) {
        try {
            const response = await this.fetchImpl(`${this.config.baseUrl}${path}`, {
                method,
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    "Content-Type": "application/json",
                },
                ...(body ? { body: JSON.stringify(body) } : {}),
            });
            if (!response.ok) {
                const errorBody = await response.text().catch(() => "<no body>");
                throw new UpstreamServiceError("crm", `CRM responded with status ${response.status}: ${errorBody}`);
            }
            return response;
        }
        catch (error) {
            if (error instanceof UpstreamServiceError)
                throw error;
            throw new UpstreamServiceError("crm", "Failed to reach CRM service", error);
        }
    }
    async parseJson(response) {
        try {
            return await response.json();
        }
        catch (error) {
            throw new UpstreamServiceError("crm", "CRM returned an invalid JSON response", error);
        }
    }
}
//# sourceMappingURL=restCrmClient.js.map