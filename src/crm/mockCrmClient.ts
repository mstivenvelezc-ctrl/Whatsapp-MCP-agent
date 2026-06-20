import type {
    CreateAppointmentInput,
    CreateOrderInput,
    CrmAppointment,
    CrmClient,
    CrmOrder,
    CrmProduct,
    EscalateToAgentInput,
    EscalateToAgentResult,
    LogMessageInput,
} from "./types.js";

const DEFAULT_AVAILABLE_DATES = ["2030-01-02", "2030-01-03", "2030-01-04", "2030-01-06"];
const DEFAULT_AVAILABLE_SLOTS = ["08:00", "08:30", "09:00"];
const DEFAULT_PRODUCTS: CrmProduct[] = [
    { id: 1, name: "Producto demo", price: 100000, currency: "COP", isActive: true },
];
const DEFAULT_DEPARTMENT = "Comercial";

export class MockCrmClient implements CrmClient {
    private readonly appointments: CrmAppointment[] = [];
    private readonly orders: CrmOrder[] = [];
    private readonly loggedMessages: LogMessageInput[] = [];
    private readonly escalations: EscalateToAgentInput[] = [];
    private nextId = 1;
    private nextOrderId = 1;
    simulateOutOfHours = false;

    async getAvailableDates(): Promise<string[]> {
        return [...DEFAULT_AVAILABLE_DATES];
    }

    async getAvailableSlots(_date: string): Promise<string[]> {
        return [...DEFAULT_AVAILABLE_SLOTS];
    }

    async createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment> {
        const appointment: CrmAppointment = {
            id: this.nextId++,
            clientPhone: input.clientPhone,
            appointmentDate: input.appointmentDate,
            appointmentTime: input.appointmentTime,
            status: "PENDING",
            ...(input.clientName !== undefined ? { clientName: input.clientName } : {}),
            ...(input.department !== undefined ? { department: input.department } : {}),
            ...(input.notes !== undefined ? { notes: input.notes } : {}),
        };
        this.appointments.push(appointment);
        return appointment;
    }

    listAppointments(): CrmAppointment[] {
        return [...this.appointments];
    }

    async listActiveProducts(): Promise<CrmProduct[]> {
        return [...DEFAULT_PRODUCTS];
    }

    async createOrder(input: CreateOrderInput): Promise<CrmOrder> {
        const items = input.items.map((item) => {
            const product = DEFAULT_PRODUCTS.find((p) => p.id === item.productId);
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
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);

        const order: CrmOrder = {
            id: this.nextOrderId++,
            clientPhone: input.clientPhone,
            type: input.type,
            status: "PENDIENTE",
            subtotal: total,
            discount: 0,
            total,
            items,
            ...(input.clientName !== undefined ? { clientName: input.clientName } : {}),
            ...(input.notes !== undefined ? { notes: input.notes } : {}),
        };
        this.orders.push(order);
        return order;
    }

    listOrders(): CrmOrder[] {
        return [...this.orders];
    }

    async logMessage(input: LogMessageInput): Promise<void> {
        this.loggedMessages.push(input);
    }

    listLoggedMessages(): LogMessageInput[] {
        return [...this.loggedMessages];
    }

    async escalateToAgent(input: EscalateToAgentInput): Promise<EscalateToAgentResult> {
        this.escalations.push(input);
        if (this.simulateOutOfHours) {
            return { department: DEFAULT_DEPARTMENT, outOfHours: true };
        }
        return { department: DEFAULT_DEPARTMENT, agentName: "Asesor demo" };
    }

    listEscalations(): EscalateToAgentInput[] {
        return [...this.escalations];
    }
}
