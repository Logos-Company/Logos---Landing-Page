export interface Review {
    id: string;
    userId: string;
    psychologistId: string;
    rating: number;
    comment: string;
    createdAt: Date;
    status: 'pending' | 'approved' | 'rejected';
    moderatorId?: string;
    moderationNote?: string;
    moderatedAt?: Date;
    userName?: string;
    psychologistName?: string;
    isAnonymous?: boolean;
    userInfo?: {
        firstName: string;
        lastName: string;
        email: string;
    };
    psychologistInfo?: {
        firstName: string;
        lastName: string;
    };
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    pendingReviews: number;
    approvedReviews: number;
    rejectedReviews: number;
    reviewsByRating: {
        [key: number]: number;
    };
}
