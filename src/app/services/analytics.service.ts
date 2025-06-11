// analytics.service.ts
import { Injectable } from '@angular/core';
import posthog from 'posthog-js';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    pageView(path: string) {
        if (posthog && posthog.has_opted_in_capturing()) {
            posthog.capture('$pageview', { path });
        }
    }

    identify(userId: string, props: Record<string, any> = {}) {
        posthog.identify(userId, props);
    }

    track(event: string, props: Record<string, any> = {}) {
        if (posthog && posthog.has_opted_in_capturing()) {
            posthog.capture(event, props);
        }
    }
}
