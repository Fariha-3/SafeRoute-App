import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MContainerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  
  constructor(private router:Router) 
  {    
  }
  navigateToMap() {
    this.router.navigate(['/map']);
  }

  addReport() {
    this.router.navigate(['/crowdsource']);
  }

  viewReports() {
    this.router.navigate(['/viewreports']);
  }

  viewHeatmap() {
    this.router.navigate(['/heatmap']);
  }

}