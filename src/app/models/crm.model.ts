export interface CrmIntegration {
    id: string;
    name: string;
    type: 'livespace' | 'hubspot' | 'salesforce';
    apiKey: string;
    apiUrl: string;
    isActive: boolean;
    lastSync: Date;
    syncInterval: number; // minutes
    fieldMappings: FieldMapping[];
    settings: CrmSettings;
}

export interface FieldMapping {
    localField: string;
    crmField: string;
    direction: 'import' | 'export' | 'bidirectional';
    transformation?: string;
}

export interface CrmSettings {
    autoSync: boolean;
    syncOnUserCreate: boolean;
    syncOnUserUpdate: boolean;
    syncAppointments: boolean;
    syncPayments: boolean;
}

export interface CrmContact {
    id: string;
    crmId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
    tags: string[];
    lastActivity: Date;
    customFields: { [key: string]: any };
}

export interface CrmSyncResult {
    success: boolean;
    imported: number;
    exported: number;
    failed: number;
    errors: string[];
    timestamp: Date;
}
