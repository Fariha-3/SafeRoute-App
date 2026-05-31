import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css'
})
export class HeatmapComponent {
  constructor(private router: Router) {}
  back() {
    this.router.navigate(['/']);
  }
}