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