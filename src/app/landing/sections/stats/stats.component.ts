import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- dodaj to, aby używać CommonModule
@Component({
  selector: 'app-stats',
  imports: [CommonModule], // <-- dodaj to
  standalone: true, // <- to sprawia, że musisz jawnie importować
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  stats = [
    { value: 9, displayedValue: 0, label: 'Happy Customers' },
    { value: 150, displayedValue: 0, label: 'Monthly Visitors' },
    { value: 1500, displayedValue: 0, label: 'Countries Worldwide' },
    { value: 10000, displayedValue: 0, label: 'Top Partners' }
  ];

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
