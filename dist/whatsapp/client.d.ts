export interface WhatsappClient {
    sendTextMessage(to: string, body: string): Promise<void>;
}
export interface WhatsappClientConfig {
    accessToken: string;
    phoneNumberId: string;
    apiVersion: string;
    fetchImpl?: typeof fetch;
}
export declare class CloudApiWhatsappClient implements WhatsappClient {
    private readonly config;
    private readonly fetchImpl;
    constructor(config: WhatsappClientConfig);
    sendTextMessage(to: string, body: string): Promise<void>;
}
//# sourceMappingURL=client.d.ts.map