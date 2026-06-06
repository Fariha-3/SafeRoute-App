import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { auth } from '../../firebase.config';
import { CommunityService } from '../../services/community.service';
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
    timestamp: '',
    verified: false,
    userId: '',
    userEmail: ''
  };

  hazardType = '';
  authority = '';
  recommendedAction = '';

  message = '';
  error = '';

  constructor(
    private router: Router,
    private firebase: FirebaseService,
    private communityService: CommunityService,
    private geminiService: GeminiService
  ) {}

  addReport() {
    this.message = '';
    this.error = '';

    const currentUser = auth.currentUser;

    if (!currentUser) {
      this.error = 'You must login before submitting a report.';
      return;
    }

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
        try {
          const geminiResult = await this.geminiService.analyzeReport(
            this.report.category,
            this.report.description
          );

          this.hazardType = geminiResult.hazardType;
          this.authority = geminiResult.authority;
          this.recommendedAction = geminiResult.recommendedAction;

          const reportData = {
            category: this.report.category,
            severity: this.report.severity,
            description: this.report.description,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
            verified: false,
            userId: currentUser.uid,
            userEmail: currentUser.email || '',
            hazardType: this.hazardType,
            authority: this.authority,
            recommendedAction: this.recommendedAction
          };

          console.log('Saving report:', reportData);

          const key = this.firebase.pushToList('reports', reportData);
          console.log('Firebase key:', key);

          await this.communityService.increaseReportCountForUser(currentUser.uid);

          this.message = 'Report submitted successfully.';

          this.report = {
            category: '',
            severity: '',
            description: '',
            latitude: 0,
            longitude: 0,
            timestamp: '',
            verified: false,
            userId: '',
            userEmail: ''
          };

          this.hazardType = '';
          this.authority = '';
          this.recommendedAction = '';
        } catch (error) {
          console.error(error);
          this.error = 'Gemini analysis failed or Firebase error.';
        }
      },
      (error) => {
        console.error(error);
        this.error = 'Location access denied';
      }
    );
  }

  back() {
    this.router.navigate(['/home']);
  }
}