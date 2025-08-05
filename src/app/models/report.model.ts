export interface Report {
    id: string;
    name: string;
    type: 'user-activity' | 'revenue' | 'sessions' | 'psychologist-performance' | 'system-health';
    parameters: ReportParameters;
    data: any;
    generatedAt: Date;
    generatedBy: string;
    format: 'excel' | 'pdf' | 'csv';
    fileUrl?: string;
    status: 'generating' | 'ready' | 'failed';
}

export interface ReportParameters {
    dateFrom: Date;
    dateTo: Date;
    filters: { [key: string]: any };
    groupBy?: string;
    sortBy?: string;
    includeCharts?: boolean;
}

export interface SystemHealth {
    database: {
        status: 'healthy' | 'warning' | 'error';
        responseTime: number;
        lastChecked: Date;
    };
    payments: {
        status: 'healthy' | 'warning' | 'error';
        lastTransaction: Date;
        failureRate: number;
    };
    email: {
        status: 'healthy' | 'warning' | 'error';
        queueLength: number;
        averageDelay: number;
    };
    storage: {
        status: 'healthy' | 'warning' | 'error';
        usagePercentage: number;
        freeSpace: number;
    };
}
