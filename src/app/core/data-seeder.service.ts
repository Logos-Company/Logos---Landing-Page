import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, writeBatch, query, getDocs, getDoc, where, Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { Review } from '../models/review.model';
import { PsychologistNote } from '../models/psychologist.model';

@Injectable({
    providedIn: 'root'
})
export class DataSeederService {
    private app = initializeApp(environment.firebase);
    private db = getFirestore(this.app);

    constructor() { }

    // Sample psychologists data
    private samplePsychologists: Partial<User>[] = [
        {
            id: 'psych1',
            firstName: 'Anna',
            lastName: 'Kowalska',
            email: 'anna.kowalska@example.com',
            phone: '+48 123 456 789',
            role: 'psychologist',
            isActive: true,
            specializations: ['Zaburzenia lękowe', 'Depresja', 'Terapia par'],
            description: 'Doświadczona psycholog kliniczna specjalizująca się w terapii zaburzeń lękowych.',
            bio: 'Jestem psychologiem klinicznym z 8-letnim doświadczeniem w pracy z pacjentami cierpiącymi na zaburzenia lękowe i depresję. Ukończyłam studia magisterskie na Uniwersytecie Warszawskim oraz liczne kursy specjalistyczne.',
            experience: 8,
            education: 'Magister psychologii klinicznej, Uniwersytet Warszawski',
            languages: ['Polski', 'Angielski'],
            rating: 4.8,
            reviewCount: 47,
            hourlyRate: 120,
            pricePerSession: 120,
            isAvailable: true,
            licenseNumber: 'PK-2016-001',
            verificationStatus: 'verified',
            sessionsThisMonth: 23,
            completedSessions: 156,
            totalRevenue: 18720,
            profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '09:00', end: '17:00' }],
                tuesday: [{ start: '09:00', end: '17:00' }],
                wednesday: [{ start: '10:00', end: '18:00' }],
                thursday: [{ start: '09:00', end: '17:00' }],
                friday: [{ start: '09:00', end: '15:00' }],
                saturday: [],
                sunday: []
            },
            createdAt: new Date('2023-01-15'),
            lastSessionDate: new Date('2024-01-10')
        },
        {
            id: 'psych2',
            firstName: 'Marcin',
            lastName: 'Nowak',
            email: 'marcin.nowak@example.com',
            phone: '+48 234 567 890',
            role: 'psychologist',
            isActive: true,
            specializations: ['Terapia poznawczo-behawioralna', 'Zaburzenia osobowości', 'Psychologia sportu'],
            description: 'Specjalista terapii poznawczo-behawioralnej z doświadczeniem w psychologii sportu.',
            bio: 'Pracuję jako psycholog od 6 lat, specjalizując się w terapii CBT. Współpracuję również ze sportowcami, pomagając im radzić sobie ze stresem związanym z zawodami.',
            experience: 6,
            education: 'Magister psychologii, certyfikat CBT',
            languages: ['Polski', 'Niemiecki'],
            rating: 4.6,
            reviewCount: 32,
            hourlyRate: 100,
            pricePerSession: 100,
            isAvailable: true,
            licenseNumber: 'MN-2018-002',
            verificationStatus: 'verified',
            sessionsThisMonth: 18,
            completedSessions: 98,
            totalRevenue: 9800,
            profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '10:00', end: '18:00' }],
                tuesday: [{ start: '10:00', end: '18:00' }],
                wednesday: [{ start: '10:00', end: '18:00' }],
                thursday: [{ start: '10:00', end: '18:00' }],
                friday: [{ start: '10:00', end: '16:00' }],
                saturday: [{ start: '09:00', end: '13:00' }],
                sunday: []
            },
            createdAt: new Date('2023-03-20'),
            lastSessionDate: new Date('2024-01-08')
        },
        {
            id: 'psych3',
            firstName: 'Katarzyna',
            lastName: 'Wiśniewska',
            email: 'katarzyna.wisniewska@example.com',
            phone: '+48 345 678 901',
            role: 'psychologist',
            isActive: true,
            specializations: ['Terapia rodzin', 'Psychologia dziecięca', 'Zaburzenia rozwojowe'],
            description: 'Psycholog dziecięcy z pasją do terapii rodzinnej i rozwoju dzieci.',
            bio: 'Specializuję się w psychologii dziecięcej i terapii rodzinnej. Pomagam rodzinom w rozwiązywaniu konfliktów i wspieraniu rozwoju dzieci.',
            experience: 10,
            education: 'Magister psychologii rozwojowej, specjalizacja terapia rodzin',
            languages: ['Polski', 'Angielski', 'Francuski'],
            rating: 4.9,
            reviewCount: 68,
            hourlyRate: 140,
            pricePerSession: 140,
            isAvailable: false, // Currently busy
            licenseNumber: 'KW-2014-003',
            verificationStatus: 'verified',
            sessionsThisMonth: 31,
            completedSessions: 245,
            totalRevenue: 34300,
            profileImage: 'https://images.unsplash.com/photo-1594824154819-2bc2fa21e5ad?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '08:00', end: '16:00' }],
                tuesday: [{ start: '08:00', end: '16:00' }],
                wednesday: [{ start: '08:00', end: '16:00' }],
                thursday: [{ start: '08:00', end: '16:00' }],
                friday: [{ start: '08:00', end: '14:00' }],
                saturday: [],
                sunday: []
            },
            createdAt: new Date('2022-09-10'),
            lastSessionDate: new Date('2024-01-12')
        },
        {
            id: 'psych4',
            firstName: 'Paweł',
            lastName: 'Jankowski',
            email: 'pawel.jankowski@example.com',
            phone: '+48 456 789 012',
            role: 'psychologist',
            isActive: true,
            specializations: ['Terapia uzależnień', 'Wsparcie w kryzysie', 'Zaburzenia nastroju'],
            description: 'Terapeuta uzależnień z doświadczeniem w interwencjach kryzysowych.',
            bio: 'Specjalizuję się w terapii uzależnień i wsparciu osób w kryzysie. Mam doświadczenie w pracy z różnymi typami uzależnień.',
            experience: 7,
            education: 'Magister psychologii klinicznej, certyfikat terapii uzależnień',
            languages: ['Polski'],
            rating: 4.7,
            reviewCount: 41,
            hourlyRate: 110,
            pricePerSession: 110,
            isAvailable: true,
            licenseNumber: 'PJ-2017-004',
            verificationStatus: 'verified',
            sessionsThisMonth: 20,
            completedSessions: 134,
            totalRevenue: 14740,
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '11:00', end: '19:00' }],
                tuesday: [{ start: '11:00', end: '19:00' }],
                wednesday: [{ start: '11:00', end: '19:00' }],
                thursday: [{ start: '11:00', end: '19:00' }],
                friday: [{ start: '11:00', end: '17:00' }],
                saturday: [],
                sunday: []
            },
            createdAt: new Date('2023-05-08'),
            lastSessionDate: new Date('2024-01-09')
        },
        {
            id: 'psych5',
            firstName: 'Magdalena',
            lastName: 'Kozłowska',
            email: 'magdalena.kozlowska@example.com',
            phone: '+48 567 890 123',
            role: 'psychologist',
            isActive: true,
            specializations: ['Terapia traumy', 'EMDR', 'Zaburzenia stresowe'],
            description: 'Specjalistka terapii traumy z certyfikatem EMDR.',
            bio: 'Jestem certyfikowaną terapeutką EMDR z 5-letnim doświadczeniem w pracy z osobami po traumach. Pomagam w procesie uzdrawiania.',
            experience: 5,
            education: 'Magister psychologii, certyfikat EMDR poziom 2',
            languages: ['Polski', 'Angielski'],
            rating: 4.8,
            reviewCount: 29,
            hourlyRate: 130,
            pricePerSession: 130,
            isAvailable: true,
            licenseNumber: 'MK-2019-005',
            verificationStatus: 'verified',
            sessionsThisMonth: 16,
            completedSessions: 87,
            totalRevenue: 11310,
            profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '09:00', end: '15:00' }],
                tuesday: [{ start: '09:00', end: '15:00' }],
                wednesday: [{ start: '09:00', end: '15:00' }],
                thursday: [{ start: '13:00', end: '19:00' }],
                friday: [{ start: '13:00', end: '19:00' }],
                saturday: [],
                sunday: []
            },
            createdAt: new Date('2023-07-22'),
            lastSessionDate: new Date('2024-01-11')
        },
        {
            id: 'psych6',
            firstName: 'Tomasz',
            lastName: 'Wójcik',
            email: 'tomasz.wojcik@example.com',
            phone: '+48 678 901 234',
            role: 'psychologist',
            isActive: true,
            specializations: ['Psychoterapia psychodynamiczna', 'Zaburzenia osobowości', 'Terapia długoterminowa'],
            description: 'Psychoterapeuta psychodynamiczny z doświadczeniem w terapii długoterminowej.',
            bio: 'Praktykuję psychoterapię psychodynamiczną od 12 lat. Specjalizuję się w pracy z zaburzeniami osobowości i terapii długoterminowej.',
            experience: 12,
            education: 'Magister psychologii, certyfikat psychoterapii psychodynamicznej',
            languages: ['Polski', 'Angielski', 'Rosyjski'],
            rating: 4.9,
            reviewCount: 83,
            hourlyRate: 160,
            pricePerSession: 160,
            isAvailable: true,
            licenseNumber: 'TW-2012-006',
            verificationStatus: 'verified',
            sessionsThisMonth: 28,
            completedSessions: 312,
            totalRevenue: 49920,
            profileImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '08:00', end: '14:00' }],
                tuesday: [{ start: '08:00', end: '14:00' }],
                wednesday: [{ start: '14:00', end: '20:00' }],
                thursday: [{ start: '14:00', end: '20:00' }],
                friday: [{ start: '08:00', end: '14:00' }],
                saturday: [],
                sunday: []
            },
            createdAt: new Date('2022-04-15'),
            lastSessionDate: new Date('2024-01-12')
        },
        {
            id: 'psych7',
            firstName: 'Agnieszka',
            lastName: 'Dąbrowska',
            email: 'agnieszka.dabrowska@example.com',
            phone: '+48 789 012 345',
            role: 'psychologist',
            isActive: true,
            specializations: ['Terapia behawioralna', 'Zaburzenia odżywiania', 'Psychologia zdrowia'],
            description: 'Specjalistka terapii behawioralnej z fokusem na zaburzenia odżywiania.',
            bio: 'Specjalizuję się w terapii behawioralnej, szczególnie w obszarze zaburzeń odżywiania i psychologii zdrowia.',
            experience: 4,
            education: 'Magister psychologii klinicznej, certyfikat terapii behawioralnej',
            languages: ['Polski', 'Hiszpański'],
            rating: 4.5,
            reviewCount: 18,
            hourlyRate: 95,
            pricePerSession: 95,
            isAvailable: true,
            licenseNumber: 'AD-2020-007',
            verificationStatus: 'verified',
            sessionsThisMonth: 14,
            completedSessions: 52,
            totalRevenue: 4940,
            profileImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '10:00', end: '16:00' }],
                tuesday: [{ start: '10:00', end: '16:00' }],
                wednesday: [{ start: '12:00', end: '18:00' }],
                thursday: [{ start: '12:00', end: '18:00' }],
                friday: [{ start: '10:00', end: '14:00' }],
                saturday: [{ start: '10:00', end: '14:00' }],
                sunday: []
            },
            createdAt: new Date('2023-11-05'),
            lastSessionDate: new Date('2024-01-07')
        },
        {
            id: 'psych8',
            firstName: 'Robert',
            lastName: 'Lewandowski',
            email: 'robert.lewandowski@example.com',
            phone: '+48 890 123 456',
            role: 'psychologist',
            isActive: true,
            specializations: ['Terapia systemowa', 'Mediacje rodzinne', 'Konflikt i komunikacja'],
            description: 'Terapeuta systemowy specjalizujący się w mediacjach rodzinnych.',
            bio: 'Jestem terapeutą systemowym z 9-letnim doświadczeniem. Pomagam rodzinom w rozwiązywaniu konfliktów poprzez mediacje.',
            experience: 9,
            education: 'Magister psychologii, certyfikat terapii systemowej i mediacji',
            languages: ['Polski', 'Angielski'],
            rating: 4.7,
            reviewCount: 54,
            hourlyRate: 125,
            pricePerSession: 125,
            isAvailable: false, // Currently offline
            licenseNumber: 'RL-2015-008',
            verificationStatus: 'verified',
            sessionsThisMonth: 22,
            completedSessions: 187,
            totalRevenue: 23375,
            profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '09:00', end: '17:00' }],
                tuesday: [{ start: '09:00', end: '17:00' }],
                wednesday: [{ start: '09:00', end: '17:00' }],
                thursday: [{ start: '09:00', end: '17:00' }],
                friday: [{ start: '09:00', end: '15:00' }],
                saturday: [],
                sunday: []
            },
            createdAt: new Date('2023-02-28'),
            lastSessionDate: new Date('2024-01-05')
        },
        {
            id: 'psych9',
            firstName: 'Ewa',
            lastName: 'Kamińska',
            email: 'ewa.kaminska@example.com',
            phone: '+48 901 234 567',
            role: 'psychologist',
            isActive: true,
            specializations: ['Mindfulness', 'Redukcja stresu', 'Terapia grup'],
            description: 'Instruktorka mindfulness i specjalistka redukcji stresu.',
            bio: 'Praktykowję mindfulness od 15 lat. Prowadzę terapię grupową i indywidualną focusem na redukcji stresu.',
            experience: 6,
            education: 'Magister psychologii, certyfikat MBSR, instruktor mindfulness',
            languages: ['Polski', 'Angielski', 'Włoski'],
            rating: 4.8,
            reviewCount: 36,
            hourlyRate: 105,
            pricePerSession: 105,
            isAvailable: true,
            licenseNumber: 'EK-2018-009',
            verificationStatus: 'verified',
            sessionsThisMonth: 19,
            completedSessions: 114,
            totalRevenue: 11970,
            profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '07:00', end: '13:00' }],
                tuesday: [{ start: '07:00', end: '13:00' }],
                wednesday: [{ start: '07:00', end: '13:00' }],
                thursday: [{ start: '15:00', end: '21:00' }],
                friday: [{ start: '15:00', end: '21:00' }],
                saturday: [{ start: '08:00', end: '12:00' }],
                sunday: []
            },
            createdAt: new Date('2023-06-12'),
            lastSessionDate: new Date('2024-01-10')
        },
        {
            id: 'psych10',
            firstName: 'Michał',
            lastName: 'Szymański',
            email: 'michal.szymanski@example.com',
            phone: '+48 012 345 678',
            role: 'psychologist',
            isActive: true,
            specializations: ['Terapia par', 'Seksologia', 'Komunikacja w związku'],
            description: 'Terapeuta par i seksuolog z doświadczeniem w terapii związków.',
            bio: 'Specjalizuję się w terapii par i seksologii. Pomagam parom w poprawie komunikacji i budowaniu zdrowych relacji.',
            experience: 8,
            education: 'Magister psychologii, certyfikat terapii par i seksologii',
            languages: ['Polski', 'Angielski'],
            rating: 4.6,
            reviewCount: 45,
            hourlyRate: 115,
            pricePerSession: 115,
            isAvailable: true,
            licenseNumber: 'MS-2016-010',
            verificationStatus: 'verified',
            sessionsThisMonth: 25,
            completedSessions: 178,
            totalRevenue: 20470,
            profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            workingHours: {
                monday: [{ start: '10:00', end: '18:00' }],
                tuesday: [{ start: '10:00', end: '18:00' }],
                wednesday: [{ start: '14:00', end: '22:00' }],
                thursday: [{ start: '14:00', end: '22:00' }],
                friday: [{ start: '10:00', end: '16:00' }],
                saturday: [],
                sunday: []
            },
            createdAt: new Date('2023-01-30'),
            lastSessionDate: new Date('2024-01-11')
        }
    ];

    async seedPsychologists(): Promise<void> {
        try {
            console.log('Starting to seed psychologist data...');

            // Check if psychologists already exist
            const psychologistsRef = collection(this.db, 'users');
            const q = query(psychologistsRef, where('role', '==', 'psychologist'));
            const snapshot = await getDocs(q);

            if (snapshot.size >= this.samplePsychologists.length) {
                console.log('Psychologists already exist in database. Skipping psychologist seeding.');
                return;
            }

            const batch = writeBatch(this.db);

            // Add each psychologist to the batch
            for (const psychologist of this.samplePsychologists) {
                const docRef = doc(this.db, 'users', psychologist.id!);
                batch.set(docRef, {
                    ...psychologist,
                    createdAt: psychologist.createdAt,
                    updatedAt: new Date()
                });
            }

            // Commit the batch
            await batch.commit();
            console.log('Successfully seeded', this.samplePsychologists.length, 'psychologists to Firebase');

        } catch (error) {
            console.error('Error seeding psychologist data:', error);
            throw error;
        }
    }

    async seedSampleUser(): Promise<void> {
        try {
            console.log('Seeding sample user data...');

            // Check if user already exists
            const userRef = doc(this.db, 'users', 'user-test-id');
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                console.log('Sample user already exists. Skipping user seeding.');
                return;
            }

            const sampleUser: Partial<User> = {
                id: 'user-test-id',
                firstName: 'Jan',
                lastName: 'Testowy',
                email: 'jan.testowy@example.com',
                phone: '+48 123 123 123',
                role: 'user',
                isActive: true,
                assignedPsychologistId: 'psych1', // Assigned to Anna Kowalska
                assignmentStatus: 'approved',
                assignmentApprovedAt: new Date('2024-01-01'),
                creditBalance: 5,
                sessionsUsed: 3,
                totalSessions: 8,
                profileData: {
                    address: 'ul. Testowa 123',
                    city: 'Warszawa',
                    postalCode: '00-001',
                    country: 'Polska',
                    birthDate: new Date('1990-05-15'),
                    emergencyContact: {
                        name: 'Maria Testowa',
                        phone: '+48 456 456 456',
                        relationship: 'spouse'
                    },
                    goals: 'Praca nad redukcją stresu i poprawą komunikacji w relacjach.',
                    preferences: {
                        sessionType: 'both',
                        language: 'Polski',
                        gender: 'no-preference',
                        specialization: ['Zaburzenia lękowe', 'Terapia par']
                    }
                },
                createdAt: new Date('2023-12-01')
            };

            const docRef = doc(this.db, 'users', sampleUser.id!);
            await setDoc(docRef, {
                ...sampleUser,
                createdAt: sampleUser.createdAt,
                updatedAt: new Date()
            });

            console.log('Successfully seeded sample user to Firebase');

        } catch (error) {
            console.error('Error seeding sample user:', error);
            throw error;
        }
    }

    async seedSampleAppointments(): Promise<void> {
        try {
            console.log('Seeding sample appointments...');

            const sampleAppointments = [
                {
                    id: 'app1',
                    userId: 'user-test-id',
                    psychologistId: 'psych1',
                    date: new Date('2024-01-15T10:00:00'),
                    duration: 60,
                    status: 'completed',
                    type: 'online',
                    notes: 'Pierwsza sesja - wprowadzenie i omówienie celów terapii',
                    rating: 5,
                    createdAt: new Date('2024-01-10'),
                    updatedAt: new Date('2024-01-15')
                },
                {
                    id: 'app2',
                    userId: 'user-test-id',
                    psychologistId: 'psych1',
                    date: new Date('2024-01-22T10:00:00'),
                    duration: 60,
                    status: 'completed',
                    type: 'online',
                    notes: 'Praca nad technikami relaksacyjnymi',
                    rating: 5,
                    createdAt: new Date('2024-01-20'),
                    updatedAt: new Date('2024-01-22')
                },
                {
                    id: 'app3',
                    userId: 'user-test-id',
                    psychologistId: 'psych1',
                    date: new Date('2024-01-29T10:00:00'),
                    duration: 60,
                    status: 'completed',
                    type: 'online',
                    notes: 'Analiza postępów i planowanie kolejnych kroków',
                    rating: 4,
                    createdAt: new Date('2024-01-25'),
                    updatedAt: new Date('2024-01-29')
                },
                {
                    id: 'app4',
                    userId: 'user-test-id',
                    psychologistId: 'psych1',
                    date: new Date('2024-08-10T14:00:00'),
                    duration: 60,
                    status: 'scheduled',
                    type: 'online',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'app5',
                    userId: 'user-test-id',
                    psychologistId: 'psych1',
                    date: new Date('2024-08-17T14:00:00'),
                    duration: 60,
                    status: 'scheduled',
                    type: 'online',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            const batch = writeBatch(this.db);

            for (const appointment of sampleAppointments) {
                const docRef = doc(this.db, 'appointments', appointment.id);
                batch.set(docRef, appointment);
            }

            await batch.commit();
            console.log('Successfully seeded sample appointments to Firebase');

        } catch (error) {
            console.error('Error seeding sample appointments:', error);
            throw error;
        }
    }

    async seedSampleNotes(): Promise<void> {
        try {
            console.log('Seeding sample notes...');

            const sampleNotes = [
                {
                    id: 'note1',
                    userId: 'user-test-id',
                    psychologistId: 'psych1',
                    appointmentId: 'app1',
                    content: 'Pacjent wykazuje motywację do pracy nad sobą. Zidentyfikowaliśmy główne obszary do pracy: zarządzanie stresem i komunikacja w relacjach.',
                    createdAt: new Date('2024-01-15T11:00:00'),
                    isVisible: true
                },
                {
                    id: 'note2',
                    userId: 'user-test-id',
                    psychologistId: 'psych1',
                    appointmentId: 'app2',
                    content: 'Wprowadziliśmy techniki głębokiego oddychania i progresywnej relaksacji mięśniowej. Pacjent dobrze reaguje na te metody.',
                    createdAt: new Date('2024-01-22T11:00:00'),
                    isVisible: true
                },
                {
                    id: 'note3',
                    userId: 'user-test-id',
                    psychologistId: 'psych1',
                    appointmentId: 'app3',
                    content: 'Zauważalny postęp w radzeniu sobie ze stresem. Pacjent regularnie praktykuje poznane techniki. Planujemy pracę nad asertywną komunikacją.',
                    createdAt: new Date('2024-01-29T11:00:00'),
                    isVisible: true
                }
            ];

            const batch = writeBatch(this.db);

            for (const note of sampleNotes) {
                const docRef = doc(this.db, 'notes', note.id);
                batch.set(docRef, note);
            }

            await batch.commit();
            console.log('Successfully seeded sample notes to Firebase');

        } catch (error) {
            console.error('Error seeding sample notes:', error);
            throw error;
        }
    }

    async seedSampleReviews(): Promise<void> {
        try {
            console.log('Seeding sample reviews...');

            const sampleReviews = [
                {
                    id: 'review1',
                    userId: 'user-test-id',
                    psychologistId: 'psych1',
                    rating: 5,
                    comment: 'Pani Anna to bardzo profesjonalna i empatyczna psycholog. Dzięki sesją z nią znacznie poprawiłem swoje radzenie sobie ze stresem.',
                    isAnonymous: false,
                    createdAt: new Date('2024-02-01'),
                    sessionCount: 3,
                    status: 'approved',
                    isVisible: true,
                    helpfulVotes: 2,
                    wouldRecommend: true,
                    appointmentId: 'app3'
                }
            ];

            const batch = writeBatch(this.db);

            for (const review of sampleReviews) {
                const docRef = doc(this.db, 'reviews', review.id);
                batch.set(docRef, review);
            }

            await batch.commit();
            console.log('Successfully seeded sample reviews to Firebase');

        } catch (error) {
            console.error('Error seeding sample reviews:', error);
            throw error;
        }
    }

    async clearAllData(): Promise<void> {
        try {
            console.log('Clearing all data...');

            const collections = ['users', 'appointments', 'notes', 'reviews'];

            for (const collectionName of collections) {
                const collectionRef = collection(this.db, collectionName);
                const snapshot = await getDocs(collectionRef);

                const batch = writeBatch(this.db);

                snapshot.docs.forEach((docSnapshot: any) => {
                    batch.delete(docSnapshot.ref);
                });

                if (snapshot.docs.length > 0) {
                    await batch.commit();
                    console.log(`Successfully cleared ${collectionName} collection`);
                }
            }

            console.log('Successfully cleared all data');

        } catch (error) {
            console.error('Error clearing data:', error);
            throw error;
        }
    }

    async seedAllData(): Promise<void> {
        try {
            console.log('Seeding all sample data...');

            // First seed psychologists
            await this.seedPsychologists();

            // Then seed sample user
            await this.seedSampleUser();

            // Then seed appointments
            await this.seedSampleAppointments();

            // Then seed notes
            await this.seedSampleNotes();

            // Finally seed reviews
            await this.seedSampleReviews();

            console.log('Successfully seeded all sample data!');

        } catch (error) {
            console.error('Error seeding all data:', error);
            throw error;
        }
    }

    async seedPsychologistsOnly(): Promise<void> {
        try {
            console.log('Seeding psychologists for production use...');
            await this.seedPsychologists();
            console.log('Successfully seeded psychologists!');
        } catch (error) {
            console.error('Error seeding psychologists:', error);
            throw error;
        }
    }
}
