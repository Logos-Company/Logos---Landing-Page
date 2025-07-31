import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Review {
    id: string;
    psychologistId: string;
    psychologistName: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    moderatorId?: string;
    moderatorNotes?: string;
    flags?: string[];
}

export interface Report {
    id: string;
    reportedType: 'user' | 'psychologist' | 'review' | 'content';
    reportedId: string;
    reportedBy: string;
    reason: string;
    description: string;
    evidence?: string[];
    status: 'open' | 'investigating' | 'resolved' | 'dismissed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    createdAt: Date;
    resolvedAt?: Date;
    resolution?: string;
}

export interface PsychologistUpgrade {
    id: string;
    psychologistId: string;
    psychologistName: string;
    upgradeType: 'premium' | 'verified' | 'specialist' | 'featured';
    requestedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
    criteria: UpgradeCriteria;
    moderatorNotes?: string;
    autoApproved?: boolean;
}

export interface UpgradeCriteria {
    minSessions: number;
    minRating: number;
    minReviews: number;
    verificationDocuments: boolean;
    backgroundCheck: boolean;
    specialistCertification?: boolean;
}

export interface AccountBlock {
    id: string;
    userId: string;
    userName: string;
    blockType: 'temporary' | 'permanent';
    reason: string;
    blockedBy: string;
    blockedAt: Date;
    expiresAt?: Date;
    isActive: boolean;
}

export interface ContentRestriction {
    id: string;
    userId: string;
    userName: string;
    restrictionType: 'reviews' | 'messaging' | 'booking' | 'all';
    reason: string;
    duration: number; // in hours
    createdBy: string;
    createdAt: Date;
    expiresAt: Date;
    isActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ModerationService {
    private pendingReviewsSubject = new BehaviorSubject<Review[]>([]);
    private activeReportsSubject = new BehaviorSubject<Report[]>([]);

    constructor(private http: HttpClient) { }

    // Review Moderation
    getPendingReviews(): Observable<Review[]> {
        return this.pendingReviewsSubject.asObservable();
    }

    async loadPendingReviews(): Promise<Review[]> {
        // Mock data - replace with real API call
        const reviews: Review[] = [
            {
                id: '1',
                psychologistId: 'psych-1',
                psychologistName: 'Dr. Anna Kowalska',
                userId: 'user-1',
                userName: 'Jan Nowak',
                rating: 5,
                comment: 'Świetna sesja, bardzo pomocna!',
                createdAt: new Date(),
                status: 'pending'
            },
            {
                id: '2',
                psychologistId: 'psych-2',
                psychologistName: 'Dr. Piotr Wiśniewski',
                userId: 'user-2',
                userName: 'Maria Kowalczyk',
                rating: 1,
                comment: 'Bardzo nieprofesjonalne podejście, nie polecam!',
                createdAt: new Date(Date.now() - 1000 * 60 * 30),
                status: 'pending',
                flags: ['aggressive-language', 'potential-fake']
            }
        ];

        this.pendingReviewsSubject.next(reviews);
        return reviews;
    }

    async approveReview(reviewId: string, moderatorNotes?: string): Promise<void> {
        console.log('Approve review:', { reviewId, moderatorNotes });

        // Update local state
        const currentReviews = this.pendingReviewsSubject.value;
        const updatedReviews = currentReviews.map(review =>
            review.id === reviewId
                ? { ...review, status: 'approved' as const, moderatorNotes }
                : review
        );
        this.pendingReviewsSubject.next(updatedReviews);
    }

    async rejectReview(reviewId: string, reason: string): Promise<void> {
        console.log('Reject review:', { reviewId, reason });

        // Update local state
        const currentReviews = this.pendingReviewsSubject.value;
        const updatedReviews = currentReviews.map(review =>
            review.id === reviewId
                ? { ...review, status: 'rejected' as const, moderatorNotes: reason }
                : review
        );
        this.pendingReviewsSubject.next(updatedReviews);
    }

    async flagReview(reviewId: string, flags: string[], reason: string): Promise<void> {
        console.log('Flag review:', { reviewId, flags, reason });

        // Update local state
        const currentReviews = this.pendingReviewsSubject.value;
        const updatedReviews = currentReviews.map(review =>
            review.id === reviewId
                ? { ...review, status: 'flagged' as const, flags, moderatorNotes: reason }
                : review
        );
        this.pendingReviewsSubject.next(updatedReviews);
    }

    // Report Management
    getActiveReports(): Observable<Report[]> {
        return this.activeReportsSubject.asObservable();
    }

    async loadActiveReports(): Promise<Report[]> {
        // Mock data - replace with real API call
        const reports: Report[] = [
            {
                id: '1',
                reportedType: 'psychologist',
                reportedId: 'psych-1',
                reportedBy: 'user-1',
                reason: 'inappropriate-behavior',
                description: 'Psycholog zachowywał się nieprofesjonalnie podczas sesji',
                status: 'open',
                priority: 'high',
                createdAt: new Date()
            },
            {
                id: '2',
                reportedType: 'user',
                reportedId: 'user-2',
                reportedBy: 'psych-2',
                reason: 'harassment',
                description: 'Użytkownik wysyła obraźliwe wiadomości',
                status: 'investigating',
                priority: 'urgent',
                createdAt: new Date(Date.now() - 1000 * 60 * 60)
            }
        ];

        this.activeReportsSubject.next(reports);
        return reports;
    }

    async assignReport(reportId: string, moderatorId: string): Promise<void> {
        console.log('Assign report:', { reportId, moderatorId });

        const currentReports = this.activeReportsSubject.value;
        const updatedReports = currentReports.map(report =>
            report.id === reportId
                ? { ...report, assignedTo: moderatorId, status: 'investigating' as const }
                : report
        );
        this.activeReportsSubject.next(updatedReports);
    }

    async resolveReport(reportId: string, resolution: string): Promise<void> {
        console.log('Resolve report:', { reportId, resolution });

        const currentReports = this.activeReportsSubject.value;
        const updatedReports = currentReports.map(report =>
            report.id === reportId
                ? {
                    ...report,
                    status: 'resolved' as const,
                    resolution,
                    resolvedAt: new Date()
                }
                : report
        );
        this.activeReportsSubject.next(updatedReports);
    }

    async dismissReport(reportId: string, reason: string): Promise<void> {
        console.log('Dismiss report:', { reportId, reason });

        const currentReports = this.activeReportsSubject.value;
        const updatedReports = currentReports.map(report =>
            report.id === reportId
                ? {
                    ...report,
                    status: 'dismissed' as const,
                    resolution: reason,
                    resolvedAt: new Date()
                }
                : report
        );
        this.activeReportsSubject.next(updatedReports);
    }

    // Psychologist Upgrades
    async getPendingUpgrades(): Promise<PsychologistUpgrade[]> {
        // Mock data
        return [
            {
                id: '1',
                psychologistId: 'psych-1',
                psychologistName: 'Dr. Anna Kowalska',
                upgradeType: 'premium',
                requestedAt: new Date(),
                status: 'pending',
                criteria: {
                    minSessions: 50,
                    minRating: 4.5,
                    minReviews: 20,
                    verificationDocuments: true,
                    backgroundCheck: true
                }
            }
        ];
    }

    async checkUpgradeCriteria(psychologistId: string, upgradeType: PsychologistUpgrade['upgradeType']): Promise<{
        meets: boolean;
        currentStats: any;
        requirements: UpgradeCriteria;
    }> {
        // Mock check - replace with real verification
        const currentStats = {
            totalSessions: 75,
            averageRating: 4.8,
            totalReviews: 32,
            hasDocuments: true,
            backgroundCheckPassed: true
        };

        const requirements = this.getUpgradeRequirements(upgradeType);

        const meets = currentStats.totalSessions >= requirements.minSessions &&
            currentStats.averageRating >= requirements.minRating &&
            currentStats.totalReviews >= requirements.minReviews &&
            currentStats.hasDocuments === requirements.verificationDocuments &&
            currentStats.backgroundCheckPassed === requirements.backgroundCheck;

        return { meets, currentStats, requirements };
    }

    async approveUpgrade(upgradeId: string, moderatorNotes?: string): Promise<void> {
        console.log('Approve upgrade:', { upgradeId, moderatorNotes });
    }

    async rejectUpgrade(upgradeId: string, reason: string): Promise<void> {
        console.log('Reject upgrade:', { upgradeId, reason });
    }

    // Auto-upgrade system
    async processAutoUpgrades(): Promise<void> {
        console.log('Processing automatic upgrades...');

        // Get all psychologists eligible for auto-upgrades
        const eligiblePsychologists = await this.getEligiblePsychologists();

        for (const psychologist of eligiblePsychologists) {
            const upgradeCheck = await this.checkUpgradeCriteria(psychologist.id, 'premium');

            if (upgradeCheck.meets) {
                await this.autoApproveUpgrade(psychologist.id, 'premium');
            }
        }
    }

    private async getEligiblePsychologists(): Promise<any[]> {
        // Mock data - get psychologists eligible for auto-upgrade
        return [];
    }

    private async autoApproveUpgrade(psychologistId: string, upgradeType: PsychologistUpgrade['upgradeType']): Promise<void> {
        console.log('Auto-approve upgrade:', { psychologistId, upgradeType });
    }

    private getUpgradeRequirements(upgradeType: PsychologistUpgrade['upgradeType']): UpgradeCriteria {
        switch (upgradeType) {
            case 'premium':
                return {
                    minSessions: 50,
                    minRating: 4.5,
                    minReviews: 20,
                    verificationDocuments: true,
                    backgroundCheck: true
                };
            case 'verified':
                return {
                    minSessions: 100,
                    minRating: 4.7,
                    minReviews: 50,
                    verificationDocuments: true,
                    backgroundCheck: true
                };
            case 'specialist':
                return {
                    minSessions: 200,
                    minRating: 4.8,
                    minReviews: 100,
                    verificationDocuments: true,
                    backgroundCheck: true,
                    specialistCertification: true
                };
            case 'featured':
                return {
                    minSessions: 500,
                    minRating: 4.9,
                    minReviews: 200,
                    verificationDocuments: true,
                    backgroundCheck: true
                };
            default:
                throw new Error('Unknown upgrade type');
        }
    }

    // Account Blocking
    async blockAccount(userId: string, blockType: AccountBlock['blockType'], reason: string, duration?: number): Promise<void> {
        const block: AccountBlock = {
            id: this.generateId(),
            userId,
            userName: 'User Name', // TODO: Get from user service
            blockType,
            reason,
            blockedBy: 'current-moderator-id', // TODO: Get from auth service
            blockedAt: new Date(),
            expiresAt: blockType === 'temporary' && duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : undefined,
            isActive: true
        };

        console.log('Block account:', block);

        // TODO: Send notification to user
        await this.notifyAccountBlocked(userId, block);
    }

    async unblockAccount(userId: string, reason: string): Promise<void> {
        console.log('Unblock account:', { userId, reason });

        // TODO: Send notification to user
        await this.notifyAccountUnblocked(userId);
    }

    async getActiveBlocks(): Promise<AccountBlock[]> {
        // Mock data
        return [
            {
                id: '1',
                userId: 'user-1',
                userName: 'Jan Kowalski',
                blockType: 'temporary',
                reason: 'Spam messaging',
                blockedBy: 'mod-1',
                blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22),
                isActive: true
            }
        ];
    }

    // Content Restrictions
    async restrictUserContent(userId: string, restrictionType: ContentRestriction['restrictionType'], reason: string, duration: number): Promise<void> {
        const restriction: ContentRestriction = {
            id: this.generateId(),
            userId,
            userName: 'User Name', // TODO: Get from user service
            restrictionType,
            reason,
            duration,
            createdBy: 'current-moderator-id', // TODO: Get from auth service
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000),
            isActive: true
        };

        console.log('Restrict user content:', restriction);

        // TODO: Send notification to user
        await this.notifyContentRestriction(userId, restriction);
    }

    async removeContentRestriction(restrictionId: string): Promise<void> {
        console.log('Remove content restriction:', restrictionId);
    }

    async getActiveRestrictions(): Promise<ContentRestriction[]> {
        // Mock data
        return [
            {
                id: '1',
                userId: 'user-1',
                userName: 'Jan Kowalski',
                restrictionType: 'reviews',
                reason: 'Fake reviews detected',
                duration: 24,
                createdBy: 'mod-1',
                createdAt: new Date(Date.now() - 1000 * 60 * 60),
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23),
                isActive: true
            }
        ];
    }

    // Notification Methods
    private async notifyAccountBlocked(userId: string, block: AccountBlock): Promise<void> {
        // TODO: Send notification
        console.log('Notify account blocked:', { userId, block });
    }

    private async notifyAccountUnblocked(userId: string): Promise<void> {
        // TODO: Send notification
        console.log('Notify account unblocked:', userId);
    }

    private async notifyContentRestriction(userId: string, restriction: ContentRestriction): Promise<void> {
        // TODO: Send notification
        console.log('Notify content restriction:', { userId, restriction });
    }

    // Utility Methods
    private generateId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // Statistics
    async getModerationStats(): Promise<any> {
        return {
            pendingReviews: 5,
            activeReports: 3,
            resolvedToday: 12,
            blockedAccounts: 2,
            activeRestrictions: 1,
            pendingUpgrades: 4
        };
    }
}
