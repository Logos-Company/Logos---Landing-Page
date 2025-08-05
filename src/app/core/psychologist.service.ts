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
    addDoc,
    getDoc,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Psychologist, PsychologistNote, PsychologistStats } from '../models/psychologist.model';
import { Review } from '../models/user.model';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PsychologistService {
    private app = initializeApp(environment.firebase);
    private db = getFirestore(this.app);

    private psychologistsSubject = new BehaviorSubject<Psychologist[]>([]);
    public psychologists$ = this.psychologistsSubject.asObservable();

    constructor() { }

    async getAllPsychologists(): Promise<Psychologist[]> {
        try {
            const q = query(
                collection(this.db, 'psychologists'),
                where('isActive', '==', true),
                orderBy('rating', 'desc')
            );
            const snapshot = await getDocs(q);
            const psychologists = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Psychologist[];

            this.psychologistsSubject.next(psychologists);
            return psychologists;
        } catch (error) {
            console.error('Error fetching psychologists:', error);
            return [];
        }
    }

    async searchPsychologists(searchTerm: string): Promise<Psychologist[]> {
        try {
            const allPsychologists = await this.getAllPsychologists();
            const filtered = allPsychologists.filter(psychologist =>
                psychologist.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                psychologist.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                psychologist.specializations.some(spec =>
                    spec.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            return filtered;
        } catch (error) {
            console.error('Error searching psychologists:', error);
            return [];
        }
    }

    async getRandomPsychologists(count: number = 10): Promise<Psychologist[]> {
        try {
            const allPsychologists = await this.getAllPsychologists();
            const shuffled = allPsychologists.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        } catch (error) {
            console.error('Error fetching random psychologists:', error);
            return [];
        }
    }

    async getPsychologistById(id: string): Promise<Psychologist | null> {
        try {
            const docRef = doc(this.db, 'psychologists', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Psychologist;
            }
            return null;
        } catch (error) {
            console.error('Error fetching psychologist:', error);
            return null;
        }
    }

    async createPsychologist(psychologist: Omit<Psychologist, 'id'>): Promise<string> {
        try {
            const docRef = doc(collection(this.db, 'psychologists'));
            await setDoc(docRef, {
                ...psychologist,
                createdAt: new Date(),
                isActive: true,
                rating: 0,
                reviewCount: 0,
                totalSessions: 0
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating psychologist:', error);
            throw error;
        }
    }

    async updatePsychologist(id: string, updates: Partial<Psychologist>): Promise<void> {
        try {
            const docRef = doc(this.db, 'psychologists', id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating psychologist:', error);
            throw error;
        }
    }

    async deletePsychologist(id: string): Promise<void> {
        try {
            const docRef = doc(this.db, 'psychologists', id);
            await updateDoc(docRef, {
                isActive: false,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error deleting psychologist:', error);
            throw error;
        }
    }

    async getPsychologistReviews(psychologistId: string): Promise<Review[]> {
        try {
            const q = query(
                collection(this.db, 'reviews'),
                where('psychologistId', '==', psychologistId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[];
        } catch (error) {
            console.error('Error fetching psychologist reviews:', error);
            return [];
        }
    }

    async addReview(review: Omit<Review, 'id'>): Promise<void> {
        try {
            const docRef = doc(collection(this.db, 'reviews'));
            await setDoc(docRef, {
                ...review,
                createdAt: new Date()
            });

            // Update psychologist rating
            await this.updatePsychologistRating(review.psychologistId);
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    }

    private async updatePsychologistRating(psychologistId: string): Promise<void> {
        try {
            const reviews = await this.getPsychologistReviews(psychologistId);
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

            await this.updatePsychologist(psychologistId, {
                rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                reviewCount: reviews.length
            });
        } catch (error) {
            console.error('Error updating psychologist rating:', error);
        }
    }

    async getPsychologistNotes(psychologistId: string, userId?: string): Promise<PsychologistNote[]> {
        try {
            let q;
            if (userId) {
                q = query(
                    collection(this.db, 'psychologist-notes'),
                    where('psychologistId', '==', psychologistId),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc')
                );
            } else {
                q = query(
                    collection(this.db, 'psychologist-notes'),
                    where('psychologistId', '==', psychologistId),
                    orderBy('createdAt', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PsychologistNote[];
        } catch (error) {
            console.error('Error fetching psychologist notes:', error);
            return [];
        }
    }

    async addNote(note: Omit<PsychologistNote, 'id'>): Promise<void> {
        try {
            const docRef = doc(collection(this.db, 'psychologist-notes'));
            await setDoc(docRef, {
                ...note,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error adding note:', error);
            throw error;
        }
    }

    async updateNote(noteId: string, updates: Partial<PsychologistNote>): Promise<void> {
        try {
            const docRef = doc(this.db, 'psychologist-notes', noteId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    }

    async deleteNote(noteId: string): Promise<void> {
        try {
            const docRef = doc(this.db, 'psychologist-notes', noteId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }

    async getPsychologistStats(psychologistId: string): Promise<PsychologistStats> {
        try {
            // Get appointments for stats
            const appointmentsQuery = query(
                collection(this.db, 'appointments'),
                where('psychologistId', '==', psychologistId),
                where('status', '==', 'completed')
            );
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const appointments = appointmentsSnapshot.docs.map(doc => doc.data());

            // Get current month stats
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

            const thisMonthAppointments = appointments.filter(apt => {
                const aptDate = apt['date'].toDate();
                return aptDate >= firstDayOfMonth;
            });

            // Get psychologist data
            const psychologist = await this.getPsychologistById(psychologistId);
            const hourlyRate = psychologist?.hourlyRate || 0;

            // Get upcoming appointments
            const upcomingQuery = query(
                collection(this.db, 'appointments'),
                where('psychologistId', '==', psychologistId),
                where('status', '==', 'scheduled'),
                where('date', '>=', new Date())
            );
            const upcomingSnapshot = await getDocs(upcomingQuery);

            // Get active clients
            const clientIds = new Set(appointments.map(apt => apt['userId']));

            return {
                totalSessions: appointments.length,
                totalRevenue: appointments.length * hourlyRate,
                averageRating: psychologist?.rating || 0,
                activeClients: clientIds.size,
                thisMonthSessions: thisMonthAppointments.length,
                thisMonthRevenue: thisMonthAppointments.length * hourlyRate,
                upcomingAppointments: upcomingSnapshot.docs.length
            };
        } catch (error) {
            console.error('Error fetching psychologist stats:', error);
            return {
                totalSessions: 0,
                totalRevenue: 0,
                averageRating: 0,
                activeClients: 0,
                thisMonthSessions: 0,
                thisMonthRevenue: 0,
                upcomingAppointments: 0
            };
        }
    }

    async getAvailablePsychologists(date: string, time: string): Promise<Psychologist[]> {
        try {
            const allPsychologists = await this.getAllPsychologists();
            const dateObj = new Date(date);
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayOfWeek = dayNames[dateObj.getDay()];

            const availablePsychologists = allPsychologists.filter(psychologist => {
                if (!psychologist.isAvailable) return false;

                const daySchedule = psychologist.workingHours[dayOfWeek as keyof typeof psychologist.workingHours];
                if (!daySchedule || daySchedule.length === 0) return false;

                return daySchedule.some(slot => {
                    const slotStart = slot.start;
                    const slotEnd = slot.end;
                    return time >= slotStart && time < slotEnd;
                });
            });

            // Check for existing appointments at this time
            const appointmentsQuery = query(
                collection(this.db, 'appointments'),
                where('date', '==', new Date(date)),
                where('startTime', '==', time),
                where('status', 'in', ['scheduled'])
            );
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const busyPsychologistIds = appointmentsSnapshot.docs.map(doc => doc.data()['psychologistId']);

            return availablePsychologists.filter(p => !busyPsychologistIds.includes(p.id));
        } catch (error) {
            console.error('Error getting available psychologists:', error);
            return [];
        }
    }

    async getPsychologist(id: string): Promise<Psychologist | null> {
        try {
            const docRef = doc(this.db, 'psychologists', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Psychologist;
            }
            return null;
        } catch (error) {
            console.error('Error getting psychologist:', error);
            return null;
        }
    }

    // ===== CLIENT MANAGEMENT =====

    async getAssignedClients(psychologistId: string): Promise<any[]> {
        try {
            const q = query(
                collection(this.db, 'users'),
                where('assignedPsychologistId', '==', psychologistId),
                where('assignmentStatus', '==', 'approved')
            );
            const snapshot = await getDocs(q);

            const clients = [];
            for (const docSnapshot of snapshot.docs) {
                const clientData = docSnapshot.data();

                // Get client stats
                const appointmentsQuery = query(
                    collection(this.db, 'appointments'),
                    where('userId', '==', docSnapshot.id),
                    where('psychologistId', '==', psychologistId)
                );
                const appointmentsSnapshot = await getDocs(appointmentsQuery);
                const appointments = appointmentsSnapshot.docs.map(doc => doc.data());

                const completedSessions = appointments.filter(apt => apt['status'] === 'completed').length;
                const upcomingSessions = appointments.filter(apt =>
                    new Date(apt['date'].toDate()) > new Date() && apt['status'] === 'scheduled'
                ).length;

                clients.push({
                    id: docSnapshot.id,
                    ...clientData,
                    createdAt: clientData['createdAt']?.toDate(),
                    stats: {
                        totalSessions: appointments.length,
                        completedSessions,
                        upcomingSessions,
                        lastSession: appointments.length > 0 ?
                            appointments.sort((a, b) => b['date'].toDate() - a['date'].toDate())[0]['date'].toDate()
                            : null
                    }
                });
            }

            return clients.sort((a, b) => (b.stats.lastSession || 0) - (a.stats.lastSession || 0));
        } catch (error) {
            console.error('Error fetching assigned clients:', error);
            return [];
        }
    }

    async removeClient(psychologistId: string, clientId: string, reason: string): Promise<void> {
        try {
            // Update client's assignment
            const clientRef = doc(this.db, 'users', clientId);
            await updateDoc(clientRef, {
                assignedPsychologistId: null,
                assignmentStatus: 'rejected',
                updatedAt: new Date()
            });

            // Log the removal
            await addDoc(collection(this.db, 'client_removals'), {
                psychologistId,
                clientId,
                reason,
                removedAt: new Date()
            });

            // Cancel upcoming appointments
            const upcomingQuery = query(
                collection(this.db, 'appointments'),
                where('userId', '==', clientId),
                where('psychologistId', '==', psychologistId),
                where('status', '==', 'scheduled'),
                where('date', '>=', new Date())
            );
            const upcomingSnapshot = await getDocs(upcomingQuery);

            for (const appointmentDoc of upcomingSnapshot.docs) {
                await updateDoc(appointmentDoc.ref, {
                    status: 'cancelled',
                    cancellationReason: 'Klient usunięty przez psychologa',
                    cancellationDate: new Date()
                });
            }

            // Notify client
            await addDoc(collection(this.db, 'notifications'), {
                type: 'client_removed',
                title: 'Zmiana przypisania',
                message: `Twój psycholog zakończył współpracę. Powód: ${reason}`,
                recipientId: clientId,
                createdAt: new Date(),
                isRead: false
            });
        } catch (error) {
            console.error('Error removing client:', error);
            throw error;
        }
    }

    // ===== APPOINTMENT MANAGEMENT =====

    async createAppointmentSlot(psychologistId: string, date: Date, startTime: string, endTime: string): Promise<void> {
        try {
            await addDoc(collection(this.db, 'available_slots'), {
                psychologistId,
                date: date,
                startTime,
                endTime,
                isBooked: false,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error creating appointment slot:', error);
            throw error;
        }
    }

    async cancelAppointment(appointmentId: string, reason: string, sendNotification: boolean = true): Promise<void> {
        try {
            const appointmentRef = doc(this.db, 'appointments', appointmentId);
            const appointmentSnap = await getDoc(appointmentRef);

            if (!appointmentSnap.exists()) {
                throw new Error('Appointment not found');
            }

            const appointmentData = appointmentSnap.data();

            await updateDoc(appointmentRef, {
                status: 'cancelled',
                cancellationReason: reason,
                cancellationDate: new Date(),
                updatedAt: new Date()
            });

            if (sendNotification) {
                // Notify client about cancellation
                await addDoc(collection(this.db, 'notifications'), {
                    type: 'appointment_cancelled',
                    title: 'Wizyta odwołana',
                    message: `Twoja wizyta została odwołana przez psychologa. Powód: ${reason}`,
                    recipientId: appointmentData['userId'],
                    createdAt: new Date(),
                    isRead: false,
                    metadata: { appointmentId, reason }
                });
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            throw error;
        }
    }

    async rescheduleAppointment(
        appointmentId: string,
        newDate: Date,
        newStartTime: string,
        newEndTime: string,
        reason: string
    ): Promise<void> {
        try {
            const appointmentRef = doc(this.db, 'appointments', appointmentId);
            const appointmentSnap = await getDoc(appointmentRef);

            if (!appointmentSnap.exists()) {
                throw new Error('Appointment not found');
            }

            const appointmentData = appointmentSnap.data();

            await updateDoc(appointmentRef, {
                date: newDate,
                startTime: newStartTime,
                endTime: newEndTime,
                updatedAt: new Date(),
                rescheduleReason: reason
            });

            // Notify client about rescheduling
            await addDoc(collection(this.db, 'notifications'), {
                type: 'appointment_rescheduled',
                title: 'Wizyta przełożona',
                message: `Twoja wizyta została przełożona na ${newDate.toLocaleDateString()} o ${newStartTime}. Powód: ${reason}`,
                recipientId: appointmentData['userId'],
                createdAt: new Date(),
                isRead: false,
                metadata: { appointmentId, newDate, newStartTime, reason }
            });
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            throw error;
        }
    }

    // ===== CALENDAR MANAGEMENT =====

    async getCalendarEvents(psychologistId: string, month: number, year: number): Promise<any[]> {
        try {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const q = query(
                collection(this.db, 'appointments'),
                where('psychologistId', '==', psychologistId),
                where('date', '>=', startDate),
                where('date', '<=', endDate),
                orderBy('date', 'asc')
            );

            const snapshot = await getDocs(q);
            const appointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data()['date'].toDate()
            })) as any[];

            // Group by date
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
                    isPast: currentDate < new Date(),
                    revenue: dayAppointments
                        .filter(apt => apt.status === 'completed')
                        .reduce((sum, apt) => sum + (apt.price || 100), 0)
                });
            }

            return calendarData;
        } catch (error) {
            console.error('Error getting calendar events:', error);
            return [];
        }
    }

    private isToday(date: Date): boolean {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    // ===== PREMIUM LISTING =====

    async purchasePremiumListing(psychologistId: string, duration: number): Promise<void> {
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + duration);

            const psychologistRef = doc(this.db, 'users', psychologistId);
            await updateDoc(psychologistRef, {
                premiumListing: true,
                premiumListingExpiry: expiryDate,
                updatedAt: new Date()
            });

            // Log purchase
            await addDoc(collection(this.db, 'premium_purchases'), {
                psychologistId,
                duration,
                purchaseDate: new Date(),
                expiryDate,
                amount: duration * 50 // 50 PLN per day
            });
        } catch (error) {
            console.error('Error purchasing premium listing:', error);
            throw error;
        }
    }

    async checkPremiumListingExpiry(): Promise<void> {
        try {
            const now = new Date();
            const q = query(
                collection(this.db, 'users'),
                where('role', '==', 'psychologist'),
                where('premiumListing', '==', true)
            );

            const snapshot = await getDocs(q);

            for (const docSnapshot of snapshot.docs) {
                const data = docSnapshot.data();
                const expiryDate = data['premiumListingExpiry']?.toDate();

                if (expiryDate && expiryDate <= now) {
                    await updateDoc(docSnapshot.ref, {
                        premiumListing: false,
                        premiumListingExpiry: null
                    });
                }
            }
        } catch (error) {
            console.error('Error checking premium listing expiry:', error);
        }
    }

    // ===== ENHANCED STATISTICS =====

    async getDetailedStats(psychologistId: string): Promise<any> {
        try {
            const baseStats = await this.getPsychologistStats(psychologistId);

            // Get monthly revenue data for the last 6 months
            const monthlyData = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                const monthlyQuery = query(
                    collection(this.db, 'appointments'),
                    where('psychologistId', '==', psychologistId),
                    where('status', '==', 'completed'),
                    where('date', '>=', startOfMonth),
                    where('date', '<=', endOfMonth)
                );

                const monthlySnapshot = await getDocs(monthlyQuery);
                const sessionsCount = monthlySnapshot.docs.length;
                const revenue = sessionsCount * (baseStats.totalRevenue / baseStats.totalSessions || 100);

                monthlyData.push({
                    month: date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }),
                    sessions: sessionsCount,
                    revenue: revenue
                });
            }

            // Get client satisfaction data
            const reviewsQuery = query(
                collection(this.db, 'reviews'),
                where('psychologistId', '==', psychologistId),
                where('status', '==', 'approved')
            );
            const reviewsSnapshot = await getDocs(reviewsQuery);
            const reviews = reviewsSnapshot.docs.map(doc => doc.data());

            const ratingDistribution = {
                5: reviews.filter(r => r['rating'] === 5).length,
                4: reviews.filter(r => r['rating'] === 4).length,
                3: reviews.filter(r => r['rating'] === 3).length,
                2: reviews.filter(r => r['rating'] === 2).length,
                1: reviews.filter(r => r['rating'] === 1).length
            };

            return {
                ...baseStats,
                monthlyData,
                ratingDistribution,
                totalReviews: reviews.length,
                recommendationRate: reviews.filter(r => r['wouldRecommend']).length / reviews.length * 100
            };
        } catch (error) {
            console.error('Error getting detailed stats:', error);
            return await this.getPsychologistStats(psychologistId);
        }
    }

    async addPsychologist(psychologistData: any): Promise<string> {
        try {
            const docRef = await addDoc(collection(this.db, 'psychologists'), psychologistData);
            return docRef.id;
        } catch (error) {
            console.error('Error adding psychologist:', error);
            throw error;
        }
    }
}