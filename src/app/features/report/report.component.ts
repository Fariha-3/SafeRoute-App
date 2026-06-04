import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {

  category: string = '';
  description: string = '';

  hazardType: string = '';
  authority: string = '';
  recommendedAction: string = '';

  submitReport() {

    // Simulated Gemini response
    // Replace this section with your Gemini API call

    if (this.category === 'Road Hazard') {

      this.hazardType = 'Poor Street Lighting';
      this.authority = 'Municipality';
      this.recommendedAction =
        'Avoid this area after dark and report the issue to the municipality.';

    } else if (this.category === 'Traffic Issue') {

      this.hazardType = 'Damaged Traffic Signal';
      this.authority = 'Traffic Police';
      this.recommendedAction =
        'Use caution at the intersection and notify Traffic Police.';

    } else {

      this.hazardType = 'General Public Hazard';
      this.authority = 'Civil Defense';
      this.recommendedAction =
        'Exercise caution and report the issue to the appropriate authority.';
    }

    const report = {
      category: this.category,
      description: this.description,
      hazardType: this.hazardType,
      authority: this.authority,
      recommendedAction: this.recommendedAction,
      timestamp: new Date()
    };

    console.log('Report Submitted:', report);

    // Later:
    // Save report to Firebase here
  }
}
