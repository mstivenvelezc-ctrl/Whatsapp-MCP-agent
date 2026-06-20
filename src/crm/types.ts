export interface CreateAppointmentInput {
    clientPhone: string;
    clientName?: string;
    department?: string;
    appointmentDate: string; // YYYY-MM-DD
    appointmentTime: string; // HH:mm
    notes?: string;
}

export interface CrmAppointment {
    id: number;
    clientPhone: string;
    clientName?: string;
    department?: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    notes?: string;
}

export interface CrmProduct {
    id: number;
    name: string;
    description?: string;
    price: number;
    discount?: number;
    category?: string;
    currency: string;
    isActive: boolean;
}

export interface CreateOrderItemInput {
    productId: number;
    quantity: number;
}

export interface CreateOrderInput {
    clientPhone: string;
    clientName?: string;
    type: "PEDIDO" | "COTIZACION";
    notes?: string;
    items: CreateOrderItemInput[];
}

export interface CrmOrderItem {
    productId?: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface CrmOrder {
    id: number;
    clientPhone: string;
    clientName?: string;
    type: string;
    status: string;
    subtotal: number;
    discount: number;
    total: number;
    notes?: string;
    items: CrmOrderItem[];
}

export interface LogMessageInput {
    clientPhone: string;
    clientName?: string;
    messageType: "USER" | "BOT";
    messageContent: string;
}

export interface EscalateToAgentInput {
    clientPhone: string;
    clientName?: string;
    requestText: string;
}

export interface EscalateToAgentResult {
    department: string;
    agentName?: string;
    outOfHours?: boolean;
}

export interface CrmClient {
    getAvailableDates(): Promise<string[]>;
    getAvailableSlots(date: string): Promise<string[]>;
    createAppointment(input: CreateAppointmentInput): Promise<CrmAppointment>;
    listActiveProducts(): Promise<CrmProduct[]>;
    createOrder(input: CreateOrderInput): Promise<CrmOrder>;
    logMessage(input: LogMessageInput): Promise<void>;
    escalateToAgent(input: EscalateToAgentInput): Promise<EscalateToAgentResult>;
}
