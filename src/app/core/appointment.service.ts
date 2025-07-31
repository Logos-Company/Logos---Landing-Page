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
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Appointment, AppointmentMessage, TimeSlotAvailability } from '../models/appointment.model';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private app = initializeApp(environment.firebase);
    private db = getFirestore(this.app);

    private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
    public appointments$ = this.appointmentsSubject.asObservable();

    constructor() { }

    async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<string> {
        try {
            const docRef = doc(collection(this.db, 'appointments'));
            await setDoc(docRef, {
                ...appointment,
                createdAt: new Date(),
                status: 'scheduled',
                reminderSent: false
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    async getUserAppointments(userId: string): Promise<Appointment[]> {
        try {
            const q = query(
                collection(this.db, 'appointments'),
                where('userId', '==', userId),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data()['date'].toDate()
            })) as Appointment[];
        } catch (error) {
            console.error('Error fetching user appointments:', error);
            return [];
        }
    }

    async getPsychologistAppointments(psychologistId: string): Promise<Appointment[]> {
        try {
            const q = query(
                collection(this.db, 'appointments'),
                where('psychologistId', '==', psychologistId),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data()['date'].toDate()
            })) as Appointment[];
        } catch (error) {
            console.error('Error fetching psychologist appointments:', error);
            return [];
        }
    }

    async getUpcomingAppointments(userId: string): Promise<Appointment[]> {
        try {
            const now = new Date();
            const q = query(
                collection(this.db, 'appointments'),
                where('userId', '==', userId),
                where('date', '>=', now),
                where('status', '==', 'scheduled'),
                orderBy('date', 'asc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data()['date'].toDate()
            })) as Appointment[];
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
            return [];
        }
    }

    async getAppointmentById(id: string): Promise<Appointment | null> {
        try {
            const docRef = doc(this.db, 'appointments', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    date: data['date'].toDate()
                } as Appointment;
            }
            return null;
        } catch (error) {
            console.error('Error fetching appointment:', error);
            return null;
        }
    }

    async updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
        try {
            const docRef = doc(this.db, 'appointments', id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    async cancelAppointment(id: string, reason: string, cancelledBy: string): Promise<void> {
        try {
            await this.updateAppointment(id, {
                status: 'cancelled',
                cancellationReason: reason,
                cancellationDate: new Date(),
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            throw error;
        }
    }

    async completeAppointment(id: string, notes?: string): Promise<void> {
        try {
            await this.updateAppointment(id, {
                status: 'completed',
                psychologistNotes: notes,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error completing appointment:', error);
            throw error;
        }
    }

    async getAvailableTimeSlots(
        psychologistId: string,
        date: string
    ): Promise<string[]> {
        try {
            // Get psychologist working hours for the day
            const psychologistRef = doc(this.db, 'psychologists', psychologistId);
            const psychologistSnap = await getDoc(psychologistRef);

            if (!psychologistSnap.exists()) {
                return [];
            }

            const psychologist = psychologistSnap.data();
            const dateObj = new Date(date);
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayOfWeek = dayNames[dateObj.getDay()];

            const workingHours = psychologist['workingHours'];
            if (!workingHours || !workingHours[dayOfWeek]) {
                return [];
            }

            const daySchedule = workingHours[dayOfWeek];
            const availableSlots: string[] = [];

            // Generate time slots for each working period
            for (const timeSlot of daySchedule) {
                const slots = this.generateTimeSlots(timeSlot.start, timeSlot.end, 60); // 60-minute sessions
                availableSlots.push(...slots);
            }

            // Get existing appointments for this date and psychologist
            const appointmentsQuery = query(
                collection(this.db, 'appointments'),
                where('psychologistId', '==', psychologistId),
                where('date', '==', new Date(date)),
                where('status', 'in', ['scheduled'])
            );
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const bookedSlots = appointmentsSnapshot.docs.map(doc => doc.data()['startTime']);

            // Filter out booked slots
            return availableSlots.filter(slot => !bookedSlots.includes(slot));
        } catch (error) {
            console.error('Error getting available time slots:', error);
            return [];
        }
    }

    private generateTimeSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
        const slots: string[] = [];
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        for (let time = startTotalMinutes; time < endTotalMinutes; time += durationMinutes) {
            const hours = Math.floor(time / 60);
            const minutes = time % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            slots.push(timeString);
        }

        return slots;
    }

    async getCalendarData(userId: string, month: number, year: number): Promise<any[]> {
        try {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const q = query(
                collection(this.db, 'appointments'),
                where('userId', '==', userId),
                where('date', '>=', startDate),
                where('date', '<=', endDate),
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
                    isToday: this.isToday(currentDate)
                });
            }

            return calendarData;
        } catch (error) {
            console.error('Error getting calendar data:', error);
            return [];
        }
    }

    private isToday(date: Date): boolean {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    async sendMessage(message: Omit<AppointmentMessage, 'id'>): Promise<void> {
        try {
            const docRef = doc(collection(this.db, 'appointment-messages'));
            await setDoc(docRef, {
                ...message,
                createdAt: new Date(),
                isRead: false
            });
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async getAppointmentMessages(appointmentId: string): Promise<AppointmentMessage[]> {
        try {
            const q = query(
                collection(this.db, 'appointment-messages'),
                where('appointmentId', '==', appointmentId),
                orderBy('createdAt', 'asc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data()['createdAt'].toDate()
            })) as AppointmentMessage[];
        } catch (error) {
            console.error('Error fetching appointment messages:', error);
            return [];
        }
    }

    async markMessageAsRead(messageId: string): Promise<void> {
        try {
            const docRef = doc(this.db, 'appointment-messages', messageId);
            await updateDoc(docRef, {
                isRead: true
            });
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }

    async getDayAppointments(userId: string, date: Date): Promise<Appointment[]> {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const q = query(
                collection(this.db, 'appointments'),
                where('userId', '==', userId),
                where('date', '>=', startOfDay),
                where('date', '<=', endOfDay),
                orderBy('startTime', 'asc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data()['date'].toDate()
            })) as Appointment[];
        } catch (error) {
            console.error('Error getting day appointments:', error);
            return [];
        }
    }

    async rescheduleAppointment(
        appointmentId: string,
        newDate: Date,
        newStartTime: string,
        newEndTime: string
    ): Promise<void> {
        try {
            await this.updateAppointment(appointmentId, {
                date: newDate,
                startTime: newStartTime,
                endTime: newEndTime,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            throw error;
        }
    }
}
