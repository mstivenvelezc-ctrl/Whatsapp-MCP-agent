const DEFAULT_AVAILABLE_DATES = ["2030-01-02", "2030-01-03", "2030-01-04", "2030-01-06"];
const DEFAULT_AVAILABLE_SLOTS = ["08:00", "08:30", "09:00"];
const DEFAULT_PRODUCTS = [
    { id: 1, name: "Producto demo", price: 100000, currency: "COP", isActive: true },
];
export class MockCrmClient {
    appointments = [];
    orders = [];
    loggedMessages = [];
    nextId = 1;
    nextOrderId = 1;
    async getAvailableDates() {
        return [...DEFAULT_AVAILABLE_DATES];
    }
    async getAvailableSlots(_date) {
        return [...DEFAULT_AVAILABLE_SLOTS];
    }
    async createAppointment(input) {
        const appointment = {
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
    listAppointments() {
        return [...this.appointments];
    }
    async listActiveProducts() {
        return [...DEFAULT_PRODUCTS];
    }
    async createOrder(input) {
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
        const order = {
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
    listOrders() {
        return [...this.orders];
    }
    async logMessage(input) {
        this.loggedMessages.push(input);
    }
    listLoggedMessages() {
        return [...this.loggedMessages];
    }
}
//# sourceMappingURL=mockCrmClient.js.map