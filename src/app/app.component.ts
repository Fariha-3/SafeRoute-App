import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MHeaderComponent } from './m-framework/components/m-header/m-header.component';
import { MCardComponent } from './m-framework/components/m-card/m-card.component';
import { MContainerComponent } from './m-framework/components/m-container/m-container.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MContainerComponent,
    MCardComponent,
    MHeaderComponent,
    RouterOutlet,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'SafeRoute';
}