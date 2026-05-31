import { Routes } from '@angular/router';
import { Feature1Component } from './features/feature1/feature1.component';

export const routes: Routes = [
  { path: 'feature1', component: Feature1Component },
  { path: '', redirectTo: 'feature1', pathMatch: 'full' }
];