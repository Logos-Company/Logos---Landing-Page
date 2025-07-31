import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface AdminStats {
    totalUsers: number;
    newUsersToday: number;
    activePsychologists: number;
    pendingPsychologists: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    monthlySessions: number;
    sessionsGrowth: number;
    visitorsToday: number;
    conversionRate: number;
}

export interface SystemActivity {
    id: string;
    type: 'user-registered' | 'payment-received' | 'session-completed' | 'psychologist-approved' | 'error' | 'maintenance';
    message: string;
    timestamp: Date;
    userId?: string;
    metadata?: any;
}

export interface CrmStats {
    syncedContacts: number;
    newLeads: number;
    lastSync: Date;
    pendingSync: number;
}

export interface NotificationData {
    type: 'push' | 'email' | 'sms' | 'in-app';
    title: string;
    message: string;
    recipients: string[] | 'all';
    scheduled?: Date;
    metadata?: any;
}

export interface ContractTemplate {
    id: string;
    name: string;
    type: 'standard' | 'credit' | 'corporate';
    template: string;
    fields: ContractField[];
    isActive: boolean;
}

export interface ContractField {
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    label: string;
    required: boolean;
    options?: string[];
    defaultValue?: any;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private statsSubject = new BehaviorSubject<AdminStats>({
        totalUsers: 1250,
        newUsersToday: 12,
        activePsychologists: 45,
        pendingPsychologists: 3,
        monthlyRevenue: 125000,
        revenueGrowth: 15.5,
        monthlySessions: 890,
        sessionsGrowth: 8.2,
        visitorsToday: 234,
        conversionRate: 3.6
    });

    constructor(private http: HttpClient) { }

    // Stats Methods
    getStats(): Observable<AdminStats> {
        return this.statsSubject.asObservable();
    }

    async refreshStats(): Promise<AdminStats> {
        // Mock data for demonstration
        const stats: AdminStats = {
            totalUsers: 1250 + Math.floor(Math.random() * 10),
            newUsersToday: Math.floor(Math.random() * 20),
            activePsychologists: 45 + Math.floor(Math.random() * 5),
            pendingPsychologists: Math.floor(Math.random() * 5),
            monthlyRevenue: 125000 + Math.floor(Math.random() * 10000),
            revenueGrowth: 15.5 + (Math.random() * 10 - 5),
            monthlySessions: 890 + Math.floor(Math.random() * 50),
            sessionsGrowth: 8.2 + (Math.random() * 5),
            visitorsToday: 234 + Math.floor(Math.random() * 100),
            conversionRate: 3.6 + (Math.random() * 2 - 1)
        };

        this.statsSubject.next(stats);
        return stats;
    }

    // Activity Methods
    async getRecentActivity(limit: number = 20): Promise<SystemActivity[]> {
        // Mock data
        return [
            {
                id: '1',
                type: 'user-registered',
                message: 'Nowy użytkownik: Maria Kowalska',
                timestamp: new Date(),
            },
            {
                id: '2',
                type: 'payment-received',
                message: 'Otrzymano płatność 200 PLN od Jan Nowak',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
            },
            {
                id: '3',
                type: 'session-completed',
                message: 'Zakończono sesję: Dr. Anna Wiśniewska z Piotr Kowalski',
                timestamp: new Date(Date.now() - 1000 * 60 * 60),
            },
            {
                id: '4',
                type: 'psychologist-approved',
                message: 'Zatwierdzono psychologa: Dr. Marcin Zieliński',
                timestamp: new Date(Date.now() - 1000 * 60 * 120),
            }
        ];
    }

    async logActivity(activity: Omit<SystemActivity, 'id' | 'timestamp'>): Promise<void> {
        // Mock implementation
        console.log('Log activity:', activity);
    }

    // User Management Methods
    async getAllUsers(filters?: any): Promise<any[]> {
        // Mock data
        return [
            {
                id: '1',
                firstName: 'Jan',
                lastName: 'Kowalski',
                email: 'jan.kowalski@example.com',
                role: 'user',
                isActive: true,
                createdAt: new Date()
            },
            {
                id: '2',
                firstName: 'Anna',
                lastName: 'Nowak',
                email: 'anna.nowak@example.com',
                role: 'psychologist',
                isActive: true,
                createdAt: new Date()
            }
        ];
    }

    async updateUserRole(userId: string, newRole: string): Promise<void> {
        console.log('Update user role:', { userId, newRole });
    }

    async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
        console.log('Toggle user status:', { userId, isActive });
    }

    async createModerator(userData: any, permissions: string[]): Promise<void> {
        console.log('Create moderator:', { userData, permissions });
    }

    // CRM Integration Methods
    async getCrmStats(): Promise<CrmStats> {
        return {
            syncedContacts: 1245,
            newLeads: 23,
            lastSync: new Date(),
            pendingSync: 5
        };
    }

    async syncWithLivespace(): Promise<void> {
        console.log('Sync with Livespace CRM');
    }

    async importContactsFromCrm(): Promise<any[]> {
        return [];
    }

    async exportContactsToCrm(userIds: string[]): Promise<void> {
        console.log('Export contacts to CRM:', userIds);
    }

    // PostHog Integration Methods
    async syncWithPostHog(): Promise<void> {
        console.log('Sync with PostHog');
    }

    // Contract Management Methods
    async getContractTemplates(): Promise<ContractTemplate[]> {
        return [
            {
                id: '1',
                name: 'Umowa standardowa',
                type: 'standard',
                template: 'Template content...',
                fields: [],
                isActive: true
            }
        ];
    }

    async saveContractTemplate(template: Omit<ContractTemplate, 'id'>): Promise<string> {
        console.log('Save contract template:', template);
        return 'new-template-id';
    }

    async generatePdfContract(templateId: string, data: any): Promise<Blob> {
        console.log('Generate PDF contract:', { templateId, data });
        return new Blob(['Mock PDF content'], { type: 'application/pdf' });
    }

    // Notification Methods
    async sendNotification(notification: NotificationData): Promise<void> {
        console.log('Send notification:', notification);
    }

    // Export Methods
    async exportUsersToExcel(): Promise<Blob> {
        console.log('Export users to Excel');
        return new Blob(['Mock Excel content'], { type: 'application/vnd.ms-excel' });
    }

    async exportAnalyticsData(timeRange: string): Promise<Blob> {
        console.log('Export analytics data:', timeRange);
        return new Blob(['Mock analytics data'], { type: 'application/vnd.ms-excel' });
    }

    // Financial Methods
    async getFinancialReport(startDate: Date, endDate: Date): Promise<any> {
        return {
            totalRevenue: 125000,
            paymentCount: 450,
            averagePayment: 278,
            payments: []
        };
    }

    // Moderator Management
    async getModeratorPermissions(): Promise<string[]> {
        return [
            'moderate_reviews',
            'block_users',
            'approve_psychologists',
            'manage_content',
            'view_reports',
            'send_notifications'
        ];
    }

    async updateModeratorPermissions(userId: string, permissions: string[]): Promise<void> {
        console.log('Update moderator permissions:', { userId, permissions });
    }
}
