import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-feature1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature1.component.html',
  styleUrl: './feature1.component.css'
})
export class Feature1Component implements OnInit {
  registerName = '';
  registerEmail = '';
  registerPassword = '';

  loginEmail = '';
  loginPassword = '';

  message = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.listenToAuthChanges(async (user) => {
      if (user) {
        await this.router.navigate(['/home']);
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

      await this.router.navigate(['/home']);
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

      await this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }
}