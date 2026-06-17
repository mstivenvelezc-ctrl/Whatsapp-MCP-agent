import { UpstreamServiceError } from "../lib/errors.js";
import type {
    CreateAppointmentInput,
    CreateOrderInput,
    CrmAppointment,
    CrmClient,
    CrmOrder,
    CrmProduct,
    LogMessageInput,
} from "./types.js";

export interface RestCrmClientConfig {
    baseUrl: string;
    apiKey: string;
    fetchImpl?: typeof fetch;
}

export class RestCrmClient implements CrmClient {
    private readonly fetchImpl: typeof fetch;

    constructor(private readonly config: RestCrmClientConfig) {
        this.fetchImpl = config.fetchImpl ?? fetch;
    }

    async getAvailableDates(): Promise<string[]> {
        const response = await this.request("GET", "/api/appointments/available-dates");
        return (await this.parseJson(response)) as string[];
    }

    async getAvailableSlots(date: string): Promise<string[]> {
        const response = await this.request(
            "GET",
            `/api/appointments/available-slots?date=${encodeURIComponent(date)}`,
        );
        return (await this.parseJson(response)) as string[];
    }

    async createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment> {
        const response = await this.request("POST", "/api/appointments", input);
        return (await this.parseJson(response)) as CrmAppointment;
    }

    async listActiveProducts(): Promise<CrmProduct[]> {
        const response = await this.request("GET", "/api/products/active");
        return (await this.parseJson(response)) as CrmProduct[];
    }

    async createOrder(input: CreateOrderInput): Promise<CrmOrder> {
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
        return (await this.parseJson(response)) as CrmOrder;
    }

    async logMessage(input: LogMessageInput): Promise<void> {
        await this.request("POST", "/api/messages", {
            clientPhone: input.clientPhone,
            messageType: input.messageType,
            messageContent: input.messageContent,
            ...(input.clientName !== undefined ? { clientName: input.clientName } : {}),
        });
    }

    private async request(method: string, path: string, body?: unknown): Promise<Response> {
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
                throw new UpstreamServiceError(
                    "crm",
                    `CRM responded with status ${response.status}: ${errorBody}`,
                );
            }

            return response;
        } catch (error) {
            if (error instanceof UpstreamServiceError) throw error;
            throw new UpstreamServiceError("crm", "Failed to reach CRM service", error);
        }
    }

    private async parseJson(response: Response): Promise<unknown> {
        try {
            return await response.json();
        } catch (error) {
            throw new UpstreamServiceError("crm", "CRM returned an invalid JSON response", error);
        }
    }
}
