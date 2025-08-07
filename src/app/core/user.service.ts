import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    addDoc,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { User, UserStats, Review, PsychologistChangeRequest, UserProfileData } from '../models/user.model';
import { PsychologistNote } from '../models/psychologist.model';
import { Appointment } from '../models/appointment.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private app = initializeApp(environment.firebase);
    private db = getFirestore(this.app);

    constructor() { }

    // ===== USER PROFILE MANAGEMENT =====

    async getUserProfile(userId: string): Promise<User | null> {
        try {
            const docRef = doc(this.db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data['createdAt']?.toDate(),
                    updatedAt: data['updatedAt']?.toDate(),
                    packagePurchaseDate: data['packagePurchaseDate']?.toDate(),
                    assignmentRequestedAt: data['assignmentRequestedAt']?.toDate(),
                    assignmentApprovedAt: data['assignmentApprovedAt']?.toDate()
                } as User;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    async updateUserProfile(userId: string, profileData: Partial<UserProfileData>): Promise<void> {
        try {
            const userRef = doc(this.db, 'users', userId);
            await updateDoc(userRef, {
                profileData: profileData,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    async updateUserBasicInfo(userId: string, updates: Partial<User>): Promise<void> {
        try {
            const userRef = doc(this.db, 'users', userId);
            await updateDoc(userRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error updating user basic info:', error);
            throw error;
        }
    }

    // ===== PSYCHOLOGIST ASSIGNMENT =====

    async requestPsychologistAssignment(userId: string, psychologistId: string, reason?: string): Promise<void> {
        try {
            console.log(`Requesting assignment for user ${userId} to psychologist ${psychologistId}`);

            // Check if user exists first
            const userRef = doc(this.db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error(`User with ID ${userId} does not exist`);
            }

            // Check if psychologist exists
            const psychRef = doc(this.db, 'users', psychologistId);
            const psychDoc = await getDoc(psychRef);

            if (!psychDoc.exists()) {
                throw new Error(`Psychologist with ID ${psychologistId} does not exist`);
            }

            // Update user with assignment request
            await setDoc(userRef, {
                assignedPsychologistId: psychologistId,
                assignmentStatus: 'pending',
                assignmentRequestedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }, { merge: true });

            // Create assignment request record
            const requestId = `${userId}_${psychologistId}_${Date.now()}`;
            await setDoc(doc(this.db, 'assignment_requests', requestId), {
                id: requestId,
                userId,
                psychologistId,
                reason: reason || '',
                status: 'pending',
                requestedAt: Timestamp.now()
            });

            // Create notification for admin
            const notificationId = `assign_${userId}_${Date.now()}`;
            await setDoc(doc(this.db, 'notifications', notificationId), {
                id: notificationId,
                type: 'assignment_request',
                title: 'Nowa prośba o przypisanie psychologa',
                message: `Użytkownik ${userId} prosi o przypisanie do psychologa ${psychologistId}`,
                recipientRole: 'admin',
                createdAt: Timestamp.now(),
                isRead: false,
                metadata: { userId, psychologistId }
            });

            console.log('Assignment request created successfully');

        } catch (error) {
            console.error('Error requesting psychologist assignment:', error);
            throw error;
        }
    }

    async changePsychologist(userId: string, newPsychologistId: string, reason: string, urgency: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
        try {
            const currentUser = await this.getUserProfile(userId);

            const changeRequest: Omit<PsychologistChangeRequest, 'id'> = {
                userId,
                currentPsychologistId: currentUser?.assignedPsychologistId,
                requestedPsychologistId: newPsychologistId,
                reason,
                status: 'pending',
                requestedAt: new Date(),
                urgency
            };

            await addDoc(collection(this.db, 'psychologist_change_requests'), {
                ...changeRequest,
                requestedAt: Timestamp.fromDate(changeRequest.requestedAt)
            });

            // Notify admin about change request
            await addDoc(collection(this.db, 'notifications'), {
                type: 'psychologist_change',
                title: 'Prośba o zmianę psychologa',
                message: `Użytkownik prosi o zmianę psychologa. Priorytet: ${urgency}`,
                recipientRole: 'admin',
                createdAt: Timestamp.now(),
                isRead: false,
                metadata: { userId, newPsychologistId, urgency }
            });
        } catch (error) {
            console.error('Error requesting psychologist change:', error);
            throw error;
        }
    }

    // ===== USER STATISTICS =====

    async getUserStats(userId: string): Promise<UserStats> {
        try {
            // Get user appointments
            const appointmentsQuery = query(
                collection(this.db, 'appointments'),
                where('userId', '==', userId)
            );
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const appointments = appointmentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data()['date'].toDate()
            })) as Appointment[];

            // Calculate stats
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const completedSessions = appointments.filter(apt => apt.status === 'completed').length;
            const cancelledSessions = appointments.filter(apt => apt.status === 'cancelled').length;
            const upcomingAppointments = appointments.filter(apt =>
                new Date(apt.date) > now && apt.status === 'scheduled'
            ).length;

            const sessionsThisMonth = appointments.filter(apt =>
                new Date(apt.date) >= startOfMonth && apt.status === 'completed'
            ).length;

            // Get next appointment
            const upcomingAppointment = appointments
                .filter(apt => new Date(apt.date) > now && apt.status === 'scheduled')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

            // Get current psychologist
            const user = await this.getUserProfile(userId); return {
                totalSessions: appointments.length,
                completedSessions,
                cancelledSessions,
                upcomingAppointments,
                currentPsychologist: user?.assignedPsychologistId,
                sessionsThisMonth,
                nextAppointment: upcomingAppointment ? new Date(upcomingAppointment.date) : undefined
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return {
                totalSessions: 0,
                completedSessions: 0,
                cancelledSessions: 0,
                upcomingAppointments: 0,
                sessionsThisMonth: 0
            };
        }
    }

    // ===== REVIEWS MANAGEMENT =====

    async addReview(review: Omit<Review, 'id'>): Promise<void> {
        try {
            await addDoc(collection(this.db, 'reviews'), {
                ...review,
                createdAt: Timestamp.fromDate(review.createdAt),
                status: 'pending',
                isVisible: false,
                helpfulVotes: 0
            });

            // Update psychologist rating
            await this.updatePsychologistRating(review.psychologistId);
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    }

    async getUserReviews(userId: string): Promise<Review[]> {
        try {
            const q = query(
                collection(this.db, 'reviews'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data()['createdAt'].toDate()
            })) as Review[];
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            return [];
        }
    }

    async getPsychologistReviews(psychologistId: string): Promise<Review[]> {
        try {
            const q = query(
                collection(this.db, 'reviews'),
                where('psychologistId', '==', psychologistId),
                where('status', '==', 'approved'),
                where('isVisible', '==', true),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data()['createdAt'].toDate()
            })) as Review[];
        } catch (error) {
            console.error('Error fetching psychologist reviews:', error);
            return [];
        }
    }

    private async updatePsychologistRating(psychologistId: string): Promise<void> {
        try {
            const reviews = await this.getPsychologistReviews(psychologistId);

            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                const averageRating = totalRating / reviews.length;

                const psychologistRef = doc(this.db, 'users', psychologistId);
                await updateDoc(psychologistRef, {
                    rating: Math.round(averageRating * 10) / 10,
                    reviewCount: reviews.length
                });
            }
        } catch (error) {
            console.error('Error updating psychologist rating:', error);
        }
    }

    // ===== NOTES MANAGEMENT =====

    async getUserNotes(userId: string, psychologistId?: string): Promise<PsychologistNote[]> {
        try {
            let q;
            if (psychologistId) {
                q = query(
                    collection(this.db, 'psychologist_notes'),
                    where('userId', '==', userId),
                    where('psychologistId', '==', psychologistId),
                    where('isVisibleToUser', '==', true),
                    orderBy('createdAt', 'desc')
                );
            } else {
                q = query(
                    collection(this.db, 'psychologist_notes'),
                    where('userId', '==', userId),
                    where('isVisibleToUser', '==', true),
                    orderBy('createdAt', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data()['createdAt'].toDate(),
                updatedAt: doc.data()['updatedAt']?.toDate()
            })) as PsychologistNote[];
        } catch (error) {
            console.error('Error fetching user notes:', error);
            return [];
        }
    }

    // ===== CALENDAR INTEGRATION =====

    async getUserCalendarData(userId: string, month: number, year: number): Promise<any[]> {
        try {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const q = query(
                collection(this.db, 'appointments'),
                where('userId', '==', userId),
                where('date', '>=', Timestamp.fromDate(startDate)),
                where('date', '<=', Timestamp.fromDate(endDate)),
                orderBy('date', 'asc')
            );

            const snapshot = await getDocs(q);
            const appointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data()['date'].toDate()
            })) as Appointment[];

            // Group appointments by date
            const calendarData: any[] = [];
            const daysInMonth = endDate.getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(year, month, day);
                const dayAppointments = appointments.filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate.getDate() === day &&
                        aptDate.getMonth() === month &&
                        aptDate.getFullYear() === year;
                });

                calendarData.push({
                    date: currentDate,
                    day: day,
                    appointments: dayAppointments,
                    hasAppointment: dayAppointments.length > 0,
                    isToday: this.isToday(currentDate),
                    isPast: currentDate < new Date()
                });
            }

            return calendarData;
        } catch (error) {
            console.error('Error getting user calendar data:', error);
            return [];
        }
    }

    private isToday(date: Date): boolean {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    // ===== PSYCHOLOGIST LISTING =====

    async getAllPsychologists(): Promise<User[]> {
        console.log('🔍 getAllPsychologists() CALLED');

        try {
            console.log('🔥 Testing Firebase connection...');
            console.log('Database instance:', this.db);

            console.log('🔍 Getting all psychologists from Firebase...');

            // First, let's test if we can read the users collection at all
            console.log('📋 Testing basic collection access...');
            const allUsersQuery = query(collection(this.db, 'users'));
            console.log('Query created:', allUsersQuery);

            console.log('🚀 Executing getDocs...');
            const allUsersSnapshot = await getDocs(allUsersQuery);
            console.log('✅ getDocs completed');
            console.log(`📊 Total documents in users collection: ${allUsersSnapshot.docs.length}`);

            if (allUsersSnapshot.docs.length === 0) {
                console.log('❌ NO DOCUMENTS FOUND IN USERS COLLECTION');
                return [];
            }

            allUsersSnapshot.docs.forEach(doc => {
                const data = doc.data();
                console.log(`👤 User ID: ${doc.id}, Role: ${data['role']}, Name: ${data['firstName']} ${data['lastName']}`);
            });

            // Now try the filtered query
            console.log('🔍 Filtering for psychologists...');
            const q = query(
                collection(this.db, 'users'),
                where('role', '==', 'psychologist')
            );
            const snapshot = await getDocs(q);
            console.log(`🧠 Found ${snapshot.docs.length} users with role psychologist in database`);

            let psychologists = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log(`✅ Found psychologist: ${data['firstName']} ${data['lastName']}, isActive: ${data['isActive']}, verification: ${data['verificationStatus']}`);
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data['createdAt']?.toDate()
                };
            }) as User[];

            // Filter in memory instead of in Firestore query
            psychologists = psychologists.filter(p =>
                p.isActive === true &&
                (p.verificationStatus === 'verified' || !p.verificationStatus) // Allow missing verificationStatus
            );

            console.log(`✅ After filtering: ${psychologists.length} active verified psychologists`);

            // Sort by premium listing first, then by rating
            psychologists = psychologists.sort((a, b) => {
                if (a.premiumListing && !b.premiumListing) return -1;
                if (!a.premiumListing && b.premiumListing) return 1;
                return (b.rating || 0) - (a.rating || 0);
            });

            console.log('🎯 Returning sorted psychologists:', psychologists.length);
            console.log('📋 Final psychologists list:', psychologists);
            return psychologists;
        } catch (error) {
            console.error('💥 Error fetching psychologists:', error);
            console.error('Error details:', error);
            return [];
        }
    }

    async searchPsychologists(searchTerm: string, filters?: {
        specialization?: string;
        language?: string;
        hourlyRateMin?: number;
        hourlyRateMax?: number;
        rating?: number;
    }): Promise<User[]> {
        try {
            let psychologists = await this.getAllPsychologists();

            // Apply text search
            if (searchTerm) {
                psychologists = psychologists.filter(p =>
                    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.specializations?.some(spec =>
                        spec.toLowerCase().includes(searchTerm.toLowerCase())
                    ) ||
                    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Apply filters
            if (filters) {
                if (filters.specialization) {
                    psychologists = psychologists.filter(p =>
                        p.specializations?.includes(filters.specialization!)
                    );
                }

                if (filters.language) {
                    psychologists = psychologists.filter(p =>
                        p.languages?.includes(filters.language!)
                    );
                }

                if (filters.hourlyRateMin !== undefined) {
                    psychologists = psychologists.filter(p =>
                        (p.hourlyRate || 0) >= filters.hourlyRateMin!
                    );
                }

                if (filters.hourlyRateMax !== undefined) {
                    psychologists = psychologists.filter(p =>
                        (p.hourlyRate || 0) <= filters.hourlyRateMax!
                    );
                }

                if (filters.rating !== undefined) {
                    psychologists = psychologists.filter(p =>
                        (p.rating || 0) >= filters.rating!
                    );
                }
            }

            return psychologists;
        } catch (error) {
            console.error('Error searching psychologists:', error);
            return [];
        }
    }

    // ===== ADMIN FUNCTIONS =====

    async enablePsychologistSelection(userId: string, adminId: string): Promise<void> {
        try {
            const userRef = doc(this.db, 'users', userId);
            await updateDoc(userRef, {
                canSelectPsychologist: true,
                updatedAt: Timestamp.now()
            });

            // Notify user about activation
            await addDoc(collection(this.db, 'notifications'), {
                type: 'account_activated',
                title: 'Konto aktywowane',
                message: 'Twoje konto zostało aktywowane. Możesz teraz wybierać psychologów.',
                recipientId: userId,
                createdAt: Timestamp.now(),
                isRead: false
            });

            console.log(`User ${userId} can now select psychologists (activated by ${adminId})`);
        } catch (error) {
            console.error('Error enabling psychologist selection:', error);
            throw error;
        }
    }

    async disablePsychologistSelection(userId: string, adminId: string, reason: string): Promise<void> {
        try {
            const userRef = doc(this.db, 'users', userId);
            await updateDoc(userRef, {
                canSelectPsychologist: false,
                updatedAt: Timestamp.now()
            });

            // Notify user about deactivation
            await addDoc(collection(this.db, 'notifications'), {
                type: 'account_deactivated',
                title: 'Wybór psychologa zablokowany',
                message: `Możliwość wyboru psychologa została zablokowana. Powód: ${reason}`,
                recipientId: userId,
                createdAt: Timestamp.now(),
                isRead: false
            });

            console.log(`User ${userId} can no longer select psychologists (deactivated by ${adminId})`);
        } catch (error) {
            console.error('Error disabling psychologist selection:', error);
            throw error;
        }
    }

    async getPendingActivations(): Promise<User[]> {
        try {
            const q = query(
                collection(this.db, 'users'),
                where('role', '==', 'user'),
                where('canSelectPsychologist', '==', false),
                where('isActive', '==', true)
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data()['createdAt']?.toDate(),
                updatedAt: doc.data()['updatedAt']?.toDate()
            })) as User[];
        } catch (error) {
            console.error('Error fetching pending activations:', error);
            return [];
        }
    }

    async approveAssignment(userId: string, adminId: string): Promise<void> {
        try {
            const userRef = doc(this.db, 'users', userId);
            await updateDoc(userRef, {
                assignmentStatus: 'approved',
                assignmentApprovedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Update assignment request
            const requestQuery = query(
                collection(this.db, 'assignment_requests'),
                where('userId', '==', userId),
                where('status', '==', 'pending')
            );
            const requestSnapshot = await getDocs(requestQuery);

            if (!requestSnapshot.empty) {
                const requestDoc = requestSnapshot.docs[0];
                await updateDoc(requestDoc.ref, {
                    status: 'approved',
                    approvedBy: adminId,
                    approvedAt: Timestamp.now()
                });
            }

            // Notify user about approval
            await addDoc(collection(this.db, 'notifications'), {
                type: 'assignment_approved',
                title: 'Przypisanie do psychologa zatwierdzone',
                message: 'Twoja prośba o przypisanie do psychologa została zatwierdzona.',
                recipientId: userId,
                createdAt: Timestamp.now(),
                isRead: false
            });
        } catch (error) {
            console.error('Error approving assignment:', error);
            throw error;
        }
    }

    async rejectAssignment(userId: string, adminId: string, reason: string): Promise<void> {
        try {
            const userRef = doc(this.db, 'users', userId);
            await updateDoc(userRef, {
                assignmentStatus: 'rejected',
                assignedPsychologistId: null,
                updatedAt: Timestamp.now()
            });

            // Update assignment request
            const requestQuery = query(
                collection(this.db, 'assignment_requests'),
                where('userId', '==', userId),
                where('status', '==', 'pending')
            );
            const requestSnapshot = await getDocs(requestQuery);

            if (!requestSnapshot.empty) {
                const requestDoc = requestSnapshot.docs[0];
                await updateDoc(requestDoc.ref, {
                    status: 'rejected',
                    rejectedBy: adminId,
                    rejectedAt: Timestamp.now(),
                    rejectionReason: reason
                });
            }

            // Notify user about rejection
            await addDoc(collection(this.db, 'notifications'), {
                type: 'assignment_rejected',
                title: 'Przypisanie do psychologa odrzucone',
                message: `Twoja prośba o przypisanie do psychologa została odrzucona. Powód: ${reason}`,
                recipientId: userId,
                createdAt: Timestamp.now(),
                isRead: false
            });
        } catch (error) {
            console.error('Error rejecting assignment:', error);
            throw error;
        }
    }

    async getPendingAssignments(): Promise<any[]> {
        try {
            const q = query(
                collection(this.db, 'assignment_requests'),
                where('status', '==', 'pending'),
                orderBy('requestedAt', 'asc')
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                requestedAt: doc.data()['requestedAt'].toDate()
            }));
        } catch (error) {
            console.error('Error fetching pending assignments:', error);
            return [];
        }
    }
}
