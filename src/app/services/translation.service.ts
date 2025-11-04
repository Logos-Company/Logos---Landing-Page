import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';

interface Translations {
    [key: string]: {
        pl: string;
        en: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private translations: Translations = {
        // Navbar
        'navbar.home': {
            pl: 'Strona główna',
            en: 'Home'
        },
        'navbar.about': {
            pl: 'O nas',
            en: 'About us'
        },
        'navbar.contact': {
            pl: 'Kontakt',
            en: 'Contact'
        },
        'navbar.articles': {
            pl: 'Artykuły',
            en: 'Articles'
        },
        'navbar.login': {
            pl: 'Zaloguj się',
            en: 'Log in'
        },
        'navbar.register': {
            pl: 'Zarejestruj się',
            en: 'Sign up'
        },

        // Hero Section
        'hero.title': {
            pl: 'Porozmawiaj z psychologiem.',
            en: 'Talk to a psychologist.'
        },
        'hero.titleBreak': {
            pl: 'Bez wychodzenia z domu.',
            en: 'From the comfort of your home.'
        },
        'hero.description': {
            pl: 'Loogos to nowoczesna forma terapii online – dyskretna, dostępna i wygodna. Rozpocznij współpracę z naszymi psychologami i zyskaj realne wsparcie, kiedy go potrzebujesz.',
            en: 'Loogos is a modern form of online therapy – discreet, accessible and convenient. Start working with our psychologists and get real support when you need it.'
        },
        'hero.cta': {
            pl: 'Rozpocznij współpracę',
            en: 'Start cooperation'
        },

        // How it works
        'howItWorks.title': {
            pl: 'Jak to działa?',
            en: 'How does it work?'
        },
        'howItWorks.description': {
            pl: 'Rozpoczęcie współpracy to tylko kilka kroków',
            en: 'Starting cooperation is just a few steps'
        },
        'howItWorks.step1.title': {
            pl: 'Skontaktuj się z nami',
            en: 'Contact us'
        },
        'howItWorks.step1.desc': {
            pl: 'Wypełnij formularz kontaktowy lub zadzwoń – opowiesz nam o swoich potrzebach.',
            en: 'Fill out the contact form or call – tell us about your needs.'
        },
        'howItWorks.step2.title': {
            pl: 'Podpisz umowę',
            en: 'Sign the contract'
        },
        'howItWorks.step2.desc': {
            pl: 'Otrzymasz dostęp do konta i możliwość wyboru psychologa z naszej bazy.',
            en: 'You will get access to your account and the ability to choose a psychologist from our database.'
        },
        'howItWorks.step3.title': {
            pl: 'Wybierz specjalistę',
            en: 'Choose a specialist'
        },
        'howItWorks.step3.desc': {
            pl: 'Przeglądaj profile psychologów i wybierz osobę, która najbardziej Ci odpowiada.',
            en: 'Browse psychologist profiles and choose the person that suits you best.'
        },
        'howItWorks.step4.title': {
            pl: 'Rozpocznij sesje',
            en: 'Start sessions'
        },
        'howItWorks.step4.desc': {
            pl: 'Umów się na pierwsze spotkanie online w bezpiecznej i wygodnej atmosferze.',
            en: 'Schedule your first online meeting in a safe and comfortable atmosphere.'
        },

        // Contact form
        'contact.heroTitle': {
            pl: 'Skontaktuj się z nami',
            en: 'Contact us'
        },
        'contact.heroSubtitle': {
            pl: 'Jesteśmy tutaj, aby Ci pomóc. Napisz do nas i odpowiemy jak najszybciej możemy.',
            en: 'We are here to help you. Write to us and we will respond as quickly as possible.'
        },
        'contact.formTitle': {
            pl: 'Napisz do nas',
            en: 'Write to us'
        },
        'contact.formSubtitle': {
            pl: 'Wypełnij formularz poniżej, a my skontaktujemy się z Tobą w ciągu 24 godzin.',
            en: 'Fill out the form below and we will contact you within 24 hours.'
        },
        'contact.firstName': {
            pl: 'Imię',
            en: 'First name'
        },
        'contact.lastName': {
            pl: 'Nazwisko',
            en: 'Last name'
        },
        'contact.email': {
            pl: 'Email',
            en: 'Email'
        },
        'contact.phone': {
            pl: 'Telefon',
            en: 'Phone'
        },
        'contact.message': {
            pl: 'Wiadomość',
            en: 'Message'
        },
        'contact.privacyPolicy': {
            pl: 'Akceptuję politykę prywatności',
            en: 'I accept the privacy policy'
        },
        'contact.submit': {
            pl: 'Wyślij wiadomość',
            en: 'Send message'
        },
        'contact.submitting': {
            pl: 'Wysyłanie...',
            en: 'Sending...'
        },

        // Placeholders
        'placeholder.firstName': {
            pl: 'Twoje imię',
            en: 'Your first name'
        },
        'placeholder.lastName': {
            pl: 'Twoje nazwisko',
            en: 'Your last name'
        },
        'placeholder.email': {
            pl: 'twoj@email.com',
            en: 'your@email.com'
        },
        'placeholder.phone': {
            pl: '+48 123 456 789',
            en: '+44 123 456 789'
        },
        'placeholder.message': {
            pl: 'Opisz swoją sprawę...',
            en: 'Describe your matter...'
        },

        // Error messages
        'error.firstNameRequired': {
            pl: 'Imię jest wymagane',
            en: 'First name is required'
        },
        'error.lastNameRequired': {
            pl: 'Nazwisko jest wymagane',
            en: 'Last name is required'
        },
        'error.emailRequired': {
            pl: 'Email jest wymagany',
            en: 'Email is required'
        },
        'error.emailInvalid': {
            pl: 'Podaj prawidłowy adres email',
            en: 'Please provide a valid email address'
        },
        'error.privacyRequired': {
            pl: 'Musisz zaakceptować politykę prywatności',
            en: 'You must accept the privacy policy'
        },

        // CTA Section
        'cta.title': {
            pl: 'Zrób pierwszy krok ku lepszemu samopoczuciu',
            en: 'Take the first step towards better well-being'
        },
        'cta.description': {
            pl: 'Twoje zdrowie psychiczne ma znaczenie. Wystarczy jedna rozmowa, by zacząć coś zmieniać. Jesteśmy tu, by Ci pomóc.',
            en: 'Your mental health matters. Just one conversation can start changing something. We are here to help you.'
        },
        'cta.button': {
            pl: 'Rozpocznij współpracę',
            en: 'Start cooperation'
        },

        // Stats Section
        'stats.patients': {
            pl: 'Zadowolonych pacjentów',
            en: 'Satisfied patients'
        },
        'stats.psychologists': {
            pl: 'Doświadczonych psychologów',
            en: 'Experienced psychologists'
        },
        'stats.sessions': {
            pl: 'Przeprowadzonych sesji',
            en: 'Completed sessions'
        },
        'stats.satisfaction': {
            pl: 'Procent satysfakcji',
            en: 'Satisfaction rate'
        },

        // Specialists Section
        'specialists.title': {
            pl: 'Poznaj naszych specjalistów',
            en: 'Meet our specialists'
        },
        'specialists.description': {
            pl: 'Każdy z naszych specjalistów to osoba z doświadczeniem, empatią i indywidualnym podejściem do Ciebie i Twojej sytuacji.',
            en: 'Each of our specialists is a person with experience, empathy and an individual approach to you and your situation.'
        },
        'specialists.clinical': {
            pl: 'Psycholog kliniczny',
            en: 'Clinical psychologist'
        },
        'specialists.therapy': {
            pl: 'Terapia behawioralno-poznawcza',
            en: 'Cognitive behavioral therapy'
        },
        'specialists.sports': {
            pl: 'Psycholog sportowy',
            en: 'Sports psychologist'
        },
        'specialists.health': {
            pl: 'Psycholog zdrowia',
            en: 'Health psychologist'
        },
        'specialists.business': {
            pl: 'Psycholog biznesu',
            en: 'Business psychologist'
        },

        // Help Areas Section
        'helpAreas.title': {
            pl: 'Twoje potrzeby – nasze wsparcie',
            en: 'Your needs – our support'
        },
        'helpAreas.subtitle': {
            pl: 'Sprawdź, w czym możemy Ci pomóc',
            en: 'See how we can help you'
        },
        'helpAreas.description': {
            pl: 'Oferujemy indywidualne podejście i wsparcie dopasowane do Twoich potrzeb:',
            en: 'We offer an individual approach and support tailored to your needs:'
        },

        // Help areas items
        'helpAreas.emotional.title': {
            pl: 'Kryzys emocjonalny',
            en: 'Emotional crisis'
        },
        'helpAreas.emotional.desc': {
            pl: 'Terapia ukierunkowana na pomoc w trudnych chwilach życiowych – gdy czujesz, że wszystko Cię przerasta lub tracisz kontrolę nad emocjami.',
            en: 'Therapy focused on helping in difficult moments of life – when you feel that everything overwhelms you or you lose control over your emotions.'
        },
        'helpAreas.emotional.shortDesc': {
            pl: 'Czujesz się przytłoczony? Pomożemy Ci odzyskać równowagę emocjonalną i spojrzeć na sytuację z nowej perspektywy.',
            en: 'Do you feel overwhelmed? We will help you regain emotional balance and look at the situation from a new perspective.'
        },

        'helpAreas.relationships.title': {
            pl: 'Relacje i komunikacja',
            en: 'Relationships and communication'
        },
        'helpAreas.relationships.desc': {
            pl: 'Pomoc w budowaniu zdrowych relacji – w związkach, rodzinie czy pracy. Naucz się mówić o swoich potrzebach i stawiać granice.',
            en: 'Help in building healthy relationships – in relationships, family or work. Learn to talk about your needs and set boundaries.'
        },
        'helpAreas.relationships.shortDesc': {
            pl: 'Masz trudności w relacjach? Razem nauczymy się, jak budować zdrowe więzi i jasno wyrażać swoje potrzeby.',
            en: 'Do you have difficulties in relationships? Together we will learn how to build healthy bonds and clearly express your needs.'
        },

        'helpAreas.anxiety.title': {
            pl: 'Lęk i stres',
            en: 'Anxiety and stress'
        },
        'helpAreas.anxiety.desc': {
            pl: 'Lęki, napięcie, ataki paniki? Naucz się technik radzenia sobie ze stresem i odzyskaj poczucie bezpieczeństwa.',
            en: 'Anxiety, tension, panic attacks? Learn stress management techniques and regain a sense of security.'
        },
        'helpAreas.anxiety.shortDesc': {
            pl: 'Doświadczasz napięcia, niepokoju lub ataków paniki? Pokażemy Ci skuteczne techniki radzenia sobie i odzyskania spokoju.',
            en: 'Do you experience tension, anxiety or panic attacks? We will show you effective coping techniques and regaining peace.'
        },

        'helpAreas.confidence.title': {
            pl: 'Budowanie pewności siebie',
            en: 'Building self-confidence'
        },
        'helpAreas.confidence.desc': {
            pl: 'Wzmocnij samoocenę, przełam wewnętrzne blokady i naucz się żyć bardziej w zgodzie ze sobą.',
            en: 'Strengthen self-esteem, break through internal blocks and learn to live more in harmony with yourself.'
        },
        'helpAreas.confidence.shortDesc': {
            pl: 'Masz wątpliwości co do własnej wartości? Pomagamy w odkrywaniu wewnętrznej siły i życia w zgodzie ze sobą.',
            en: 'Do you have doubts about your own worth? We help you discover inner strength and live in harmony with yourself.'
        },

        'helpAreas.conversation.title': {
            pl: 'Potrzeba rozmowy',
            en: 'Need to talk'
        },
        'helpAreas.conversation.desc': {
            pl: 'Masz po prostu potrzebę rozmowy z kimś, kto nie będzie pytał, oceniał? Oferujemy wsparcie bez osądzania.',
            en: 'Do you simply need to talk to someone who won\'t ask questions or judge? We offer non-judgmental support.'
        },

        // Testimonials Section
        'testimonials.title': {
            pl: 'Opinie pacjentów',
            en: 'Patient reviews'
        },
        'testimonials.review1.text': {
            pl: 'Zmieniło moje życie! Dzięki terapii odzyskałam spokój i kontrolę nad emocjami. Sesje online były wygodne i dyskretne.',
            en: 'It changed my life! Thanks to therapy, I regained peace and control over my emotions. Online sessions were convenient and discreet.'
        },
        'testimonials.review1.author': {
            pl: 'Marta K.',
            en: 'Marta K.'
        },
        'testimonials.review2.text': {
            pl: 'Poprawiłem relacje z bliskimi. Nauczyłem się jasno wyrażać swoje potrzeby i stawiać granice. Dzięki temu moje kontakty rodzinne i zawodowe się poprawiły.',
            en: 'I improved my relationships with loved ones. I learned to clearly express my needs and set boundaries. This improved my family and work contacts.'
        },
        'testimonials.review2.author': {
            pl: 'Adam W.',
            en: 'Adam W.'
        },
        'testimonials.review3.text': {
            pl: 'Wsparcie w walce z lękiem. Techniki, które poznałam, pomogły mi opanować ataki paniki i radzić sobie ze stresem na co dzień.',
            en: 'Support in fighting anxiety. The techniques I learned helped me control panic attacks and cope with daily stress.'
        },
        'testimonials.review3.author': {
            pl: 'Paulina L.',
            en: 'Paulina L.'
        },
        'testimonials.review4.text': {
            pl: 'Zwiększyłem pewność siebie. Przez lata miałem wątpliwości co do siebie. Teraz czuję się silniejszy i bardziej sobą.',
            en: 'I increased my self-confidence. For years I had doubts about myself. Now I feel stronger and more myself.'
        },
        'testimonials.review4.author': {
            pl: 'Michał R.',
            en: 'Michał R.'
        },

        // FAQ Section
        'faq.title': {
            pl: 'Masz pytania? Mamy odpowiedzi.',
            en: 'Do you have questions? We have answers.'
        },
        'faq.subtitle': {
            pl: 'Zebraliśmy odpowiedzi na pytania, które najczęściej zadają nasi pacjenci – wszystko, co warto wiedzieć przed wizytą.',
            en: 'We have collected answers to questions most frequently asked by our patients – everything worth knowing before your visit.'
        },
        'faq.question1': {
            pl: 'Jak wygląda pierwsze spotkanie z psychologiem?',
            en: 'What does the first meeting with a psychologist look like?'
        },
        'faq.question2': {
            pl: 'Czy terapia online jest skuteczna?',
            en: 'Is online therapy effective?'
        },
        'faq.question3': {
            pl: 'Ile kosztuje wizyta?',
            en: 'How much does a visit cost?'
        },
        'faq.question4': {
            pl: 'Czy mogę zrezygnować z wizyty bez opłat?',
            en: 'Can I cancel a visit without fees?'
        },
        'faq.question5': {
            pl: 'Czy rozmowy są w pełni poufne?',
            en: 'Are conversations fully confidential?'
        },

        // Footer
        'footer.tagline': {
            pl: 'Zapewnij sobie spokój.',
            en: 'Give yourself peace of mind.'
        },
        'footer.links': {
            pl: 'Linki',
            en: 'Links'
        },
        'footer.privacy': {
            pl: 'Polityka Prywatności',
            en: 'Privacy Policy'
        },
        'footer.terms': {
            pl: 'Regulamin',
            en: 'Terms of Service'
        },
        'footer.contact': {
            pl: 'Kontakt',
            en: 'Contact'
        },
        'footer.social': {
            pl: 'Social Media',
            en: 'Social Media'
        },

        // Articles
        'articles.title': {
            pl: 'Artykuły',
            en: 'Articles'
        },
        'articles.subtitle': {
            pl: 'Odkryj naszą kolekcję artykułów o zdrowiu psychicznym, terapii i rozwoju osobistym',
            en: 'Discover our collection of articles about mental health, therapy and personal development'
        },
        'articles.allCategories': {
            pl: 'Wszystkie kategorie',
            en: 'All categories'
        },
        'articles.loading': {
            pl: 'Ładowanie artykułów...',
            en: 'Loading articles...'
        },
        'articles.retry': {
            pl: 'Spróbuj ponownie',
            en: 'Try again'
        },
        'articles.readMore': {
            pl: 'Czytaj więcej',
            en: 'Read more'
        },
        'articles.noArticles': {
            pl: 'Brak artykułów',
            en: 'No articles found'
        },
        'articles.noArticlesDesc': {
            pl: 'W tej kategorii nie ma jeszcze żadnych artykułów.',
            en: 'There are no articles in this category yet.'
        },
        'articles.error': {
            pl: 'Wystąpił błąd',
            en: 'An error occurred'
        },
        'articles.backToList': {
            pl: 'Powrót do listy',
            en: 'Back to list'
        },
        'articles.share': {
            pl: 'Udostępnij',
            en: 'Share'
        },
        'articles.author': {
            pl: 'Autor',
            en: 'Author'
        },
        'articles.category': {
            pl: 'Kategoria',
            en: 'Category'
        },
        'articles.shareArticle': {
            pl: 'Udostępnij artykuł',
            en: 'Share article'
        },
        'articles.related': {
            pl: 'Powiązane artykuły',
            en: 'Related articles'
        },
        'articles.ctaTitle': {
            pl: 'Chcesz przeczytać więcej?',
            en: 'Want to read more?'
        },
        'articles.ctaDescription': {
            pl: 'Odkryj więcej artykułów o zdrowiu psychicznym i rozwoju osobistym',
            en: 'Discover more articles about mental health and personal development'
        },
        'articles.exploreMore': {
            pl: 'Przeglądaj więcej artykułów',
            en: 'Explore more articles'
        }
    };

    constructor(private languageService: LanguageService) { }

    translate(key: string): string {
        const currentLang = this.languageService.getCurrentLanguage();
        const translation = this.translations[key];

        if (!translation) {
            console.warn(`Translation key "${key}" not found`);
            return key;
        }

        return translation[currentLang as 'pl' | 'en'] || translation.pl || key;
    }

    // Helper method for templates
    t(key: string): string {
        return this.translate(key);
    }
}