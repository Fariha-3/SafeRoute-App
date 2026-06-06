import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { GeminiService } from '../../m-framework/services/gemini.service'; 

@Component({
  selector: 'app-crowdsource',
  standalone: true,
  imports: [CommonModule, FormsModule, MContainerComponent],
  templateUrl: './crowdsource.component.html',
  styleUrl: './crowdsource.component.css'
})
export class CrowdsourceComponent {

  report = {
    category: '',
    severity: '',
    description: '',
    latitude: 0,
    longitude: 0,
    timestamp: ''
  };

  message = '';
  error = '';

  hazardType = '';
  authority = '';
  recommendedAction = '';

  constructor(
    private router: Router,
    private firebase: FirebaseService,
    private geminiService: GeminiService 
  ) {}

  addReport() {

    this.message = '';
    this.error = '';

    if (
      !this.report.category ||
      !this.report.severity ||
      !this.report.description
    ) {
      this.error = 'Please fill all fields';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {

        this.report.latitude = position.coords.latitude;
        this.report.longitude = position.coords.longitude;
        this.report.timestamp = new Date().toISOString();

        try {

          
          const geminiResult = await this.geminiService.analyzeReport(
            this.report.category,
            this.report.description
          );

          this.hazardType = geminiResult.hazardType;
          this.authority = geminiResult.authority;
          this.recommendedAction = geminiResult.recommendedAction;

          
          const key = this.firebase.pushToList('reports', {
            ...this.report,
            hazardType: this.hazardType,
            authority: this.authority,
            recommendedAction: this.recommendedAction
          });

          console.log('Firebase key:', key);

          // Reset form
          this.report = {
            category: '',
            severity: '',
            description: '',
            latitude: 0,
            longitude: 0,
            timestamp: ''
          };

        } catch (error) {
          console.error(error);
          this.error = 'Gemini analysis failed or Firebase error';
        }

      },
      (error) => {
        console.error(error);
        this.error = 'Location access denied';
      }
    );
  }

  back() {
    this.router.navigate(['/']);
  }
}


