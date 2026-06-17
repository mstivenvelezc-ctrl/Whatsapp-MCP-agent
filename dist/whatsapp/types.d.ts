import { z } from "zod";
export declare const whatsappWebhookPayloadSchema: z.ZodObject<{
    object: z.ZodString;
    entry: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        changes: z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            value: z.ZodObject<{
                messaging_product: z.ZodLiteral<"whatsapp">;
                metadata: z.ZodOptional<z.ZodObject<{
                    display_phone_number: z.ZodOptional<z.ZodString>;
                    phone_number_id: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                }, {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                }>>;
                contacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    profile: z.ZodOptional<z.ZodObject<{
                        name: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        name?: string | undefined;
                    }, {
                        name?: string | undefined;
                    }>>;
                    wa_id: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }, {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }>, "many">>;
                messages: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    from: z.ZodString;
                    id: z.ZodString;
                    timestamp: z.ZodOptional<z.ZodString>;
                    type: z.ZodString;
                    text: z.ZodOptional<z.ZodObject<{
                        body: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        body: string;
                    }, {
                        body: string;
                    }>>;
                    interactive: z.ZodOptional<z.ZodObject<{
                        type: z.ZodString;
                        button_reply: z.ZodOptional<z.ZodObject<{
                            id: z.ZodString;
                            title: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            id: string;
                            title: string;
                        }, {
                            id: string;
                            title: string;
                        }>>;
                        list_reply: z.ZodOptional<z.ZodObject<{
                            id: z.ZodString;
                            title: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            id: string;
                            title: string;
                        }, {
                            id: string;
                            title: string;
                        }>>;
                    }, "strip", z.ZodTypeAny, {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    }, {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }, {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                messaging_product: "whatsapp";
                metadata?: {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                } | undefined;
                contacts?: {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }[] | undefined;
                messages?: {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }[] | undefined;
            }, {
                messaging_product: "whatsapp";
                metadata?: {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                } | undefined;
                contacts?: {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }[] | undefined;
                messages?: {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }[] | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            value: {
                messaging_product: "whatsapp";
                metadata?: {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                } | undefined;
                contacts?: {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }[] | undefined;
                messages?: {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }[] | undefined;
            };
            field: string;
        }, {
            value: {
                messaging_product: "whatsapp";
                metadata?: {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                } | undefined;
                contacts?: {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }[] | undefined;
                messages?: {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }[] | undefined;
            };
            field: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        changes: {
            value: {
                messaging_product: "whatsapp";
                metadata?: {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                } | undefined;
                contacts?: {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }[] | undefined;
                messages?: {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }[] | undefined;
            };
            field: string;
        }[];
    }, {
        id: string;
        changes: {
            value: {
                messaging_product: "whatsapp";
                metadata?: {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                } | undefined;
                contacts?: {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }[] | undefined;
                messages?: {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }[] | undefined;
            };
            field: string;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    object: string;
    entry: {
        id: string;
        changes: {
            value: {
                messaging_product: "whatsapp";
                metadata?: {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                } | undefined;
                contacts?: {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }[] | undefined;
                messages?: {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }[] | undefined;
            };
            field: string;
        }[];
    }[];
}, {
    object: string;
    entry: {
        id: string;
        changes: {
            value: {
                messaging_product: "whatsapp";
                metadata?: {
                    display_phone_number?: string | undefined;
                    phone_number_id?: string | undefined;
                } | undefined;
                contacts?: {
                    wa_id: string;
                    profile?: {
                        name?: string | undefined;
                    } | undefined;
                }[] | undefined;
                messages?: {
                    type: string;
                    from: string;
                    id: string;
                    text?: {
                        body: string;
                    } | undefined;
                    timestamp?: string | undefined;
                    interactive?: {
                        type: string;
                        button_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                        list_reply?: {
                            id: string;
                            title: string;
                        } | undefined;
                    } | undefined;
                }[] | undefined;
            };
            field: string;
        }[];
    }[];
}>;
export type WhatsappWebhookPayload = z.infer<typeof whatsappWebhookPayloadSchema>;
export interface IncomingWhatsappMessage {
    from: string;
    waMessageId: string;
    text: string;
    contactName: string | undefined;
}
export declare function extractIncomingMessages(payload: WhatsappWebhookPayload): IncomingWhatsappMessage[];
//# sourceMappingURL=types.d.ts.map