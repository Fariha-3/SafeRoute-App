import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommunityService } from '../../services/community.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-feature1',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feature1.component.html',
  styleUrl: './feature1.component.css'
})
export class Feature1Component implements OnInit {
  registerName = '';
  registerEmail = '';
  registerPassword = '';

  loginEmail = '';
  loginPassword = '';

  currentUser: User | null = null;
  profile: any = null;
  reports: any[] = [];
  leaderboard: any[] = [];

  message = '';
  errorMessage = '';

  constructor(
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
        this.profile = null;
        this.reports = [];
        this.leaderboard = [];
      }
    });
  }

  async register(): Promise<void> {
    try {
      this.clearMessages();

      if (!this.registerName || !this.registerEmail || !this.registerPassword) {
        this.errorMessage = 'Please enter name, email, and password to register.';
        return;
      }

      await this.authService.register(
        this.registerName,
        this.registerEmail,
        this.registerPassword
      );

      this.message = 'Registration successful.';
      this.registerPassword = '';
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async login(): Promise<void> {
    try {
      this.clearMessages();

      if (!this.loginEmail || !this.loginPassword) {
        this.errorMessage = 'Please enter email and password to login.';
        return;
      }

      await this.authService.login(this.loginEmail, this.loginPassword);
      this.message = 'Login successful.';
      this.loginPassword = '';
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async logout(): Promise<void> {
    try {
      this.clearMessages();
      await this.authService.logout();
      this.message = 'Logged out successfully.';
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async loadProfile(): Promise<void> {
    this.profile = await this.authService.getCurrentUserProfile();
  }

  async loadReports(): Promise<void> {
    this.reports = await this.communityService.getReports();
  }

  async loadLeaderboard(): Promise<void> {
    this.leaderboard = await this.communityService.getLeaderboard();
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
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }
}