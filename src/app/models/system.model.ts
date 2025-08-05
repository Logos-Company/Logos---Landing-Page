export interface SystemUpgrade {
    id: string;
    name: string;
    description: string;
    version: string;
    type: 'feature' | 'bugfix' | 'security' | 'performance';
    status: 'available' | 'installing' | 'installed' | 'failed';
    releaseDate: Date;
    installDate?: Date;
    requiredDowntime: number; // minutes
    dependencies: string[];
    rollbackAvailable: boolean;
    changelog: string[];
}

export interface SystemConfiguration {
    id: string;
    category: string;
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'json';
    description: string;
    isSecret: boolean;
    updatedAt: Date;
    updatedBy: string;
}

export interface BackupInfo {
    id: string;
    type: 'automatic' | 'manual';
    size: number;
    createdAt: Date;
    status: 'creating' | 'completed' | 'failed';
    downloadUrl?: string;
    description?: string;
}
