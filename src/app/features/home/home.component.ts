import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommunityService } from '../../services/community.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MContainerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  profile: any = null;
  reports: any[] = [];
  leaderboard: any[] = [];

  message = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private communityService: CommunityService
  ) {}

  ngOnInit(): void {
    this.authService.listenToAuthChanges(async (user) => {
      this.currentUser = user;

      if (user) {
        await this.loadProfile();
        await this.loadReports();
        await this.loadLeaderboard();
      } else {
        await this.router.navigate(['/feature1']);
      }
    });
  }

  navigateToMap(): void {
    this.router.navigate(['/map']);
  }

  addReport(): void {
    this.router.navigate(['/crowdsource']);
  }

  viewReports(): void {
    this.router.navigate(['/viewreports']);
  }

  viewHeatmap(): void {
    this.router.navigate(['/heatmap']);
  }

  async loadProfile(): Promise<void> {
    const userProfile = await this.authService.getCurrentUserProfile();

    if (this.currentUser && userProfile) {
      const calculatedStats = await this.communityService.calculateUserStats(this.currentUser.uid);

      this.profile = {
        ...userProfile,
        ...calculatedStats
      };
    }
  }

  async loadReports(): Promise<void> {
    this.reports = await this.communityService.getReports();
  }

  async loadLeaderboard(): Promise<void> {
    this.leaderboard = await this.communityService.getCalculatedLeaderboard();
  }

  async upvote(reportId: string): Promise<void> {
    try {
      this.clearMessages();

      await this.communityService.upvoteReport(reportId);

      this.message = 'Report upvoted.';
      await this.loadReports();
      await this.loadLeaderboard();
      await this.loadProfile();
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async dispute(reportId: string): Promise<void> {
    try {
      this.clearMessages();

      await this.communityService.disputeReport(reportId);

      this.message = 'Report disputed.';
      await this.loadReports();
      await this.loadLeaderboard();
      await this.loadProfile();
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async logout(): Promise<void> {
    try {
      this.clearMessages();

      await this.authService.logout();
      await this.router.navigate(['/feature1']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }
}