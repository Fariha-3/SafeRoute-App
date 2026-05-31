import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService } from '../../m-framework/services/firebase.service';

@Component({
  selector: 'app-view-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewreports.component.html',
  styleUrl: './viewreports.component.css'
})
export class ViewReportsComponent implements OnInit {

  reports: any[] = [];

  constructor(
    private router: Router,
    private firebase: FirebaseService
  ) {}

  ngOnInit(): void {

    // Realtime updates from Firebase
    this.firebase.listenToList('reports', (data) => {
      this.reports = data;
      console.log('Reports:', this.reports);
    });

  }

  back(): void {
    this.router.navigate(['/']);
  }
}