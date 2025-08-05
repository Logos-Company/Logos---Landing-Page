export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'push' | 'email' | 'sms' | 'in-app';
    recipients: string[];
    status: 'draft' | 'sent' | 'scheduled' | 'failed';
    createdAt: Date;
    scheduledAt?: Date;
    sentAt?: Date;
    createdBy: string;
    metadata?: any;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    type: 'maintenance' | 'update' | 'reminder' | 'promotion';
    title: string;
    message: string;
    channels: ('push' | 'email' | 'sms' | 'in-app')[];
    isActive: boolean;
}

export interface NotificationStats {
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    failedDeliveries: number;
}
