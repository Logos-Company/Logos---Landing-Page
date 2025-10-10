import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- dodaj to, aby używać CommonModule
import { TranslationService } from '../../../services/translation.service';
@Component({
  selector: 'app-stats',
  imports: [CommonModule], // <-- dodaj to
  standalone: true, // <- to sprawia, że musisz jawnie importować
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  stats: any[] = [];

  constructor(public translationService: TranslationService) {
    this.initializeStats();
  }

  initializeStats() {
    this.stats = [
      { value: 500, displayedValue: 0, labelKey: 'stats.patients', suffix: '+' },
      { value: 25, displayedValue: 0, labelKey: 'stats.psychologists', suffix: '+' },
      { value: 1200, displayedValue: 0, labelKey: 'stats.sessions', suffix: '+' },
      { value: 100, displayedValue: 0, labelKey: 'stats.satisfaction', suffix: '%' }
    ];
  }

  ngOnInit(): void {
    this.animateStats();
  }

  animateStats(): void {
    this.stats.forEach((stat, index) => {
      const duration = 2000; // 2s
      const frameRate = 30; // 30 FPS
      const totalFrames = Math.round(duration / (1000 / frameRate));
      let frame = 0;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        stat.displayedValue = Math.floor(stat.value * progress);

        if (frame >= totalFrames) {
          stat.displayedValue = stat.value; // ensure final value
          clearInterval(counter);
        }
      }, 1000 / frameRate);
    });
  }
}
