import { Routes } from '@angular/router';
import { Feature1Component } from './features/feature1/feature1.component';
import { CrowdsourceComponent } from './features/crowdsource/crowdsource.component';
import { ViewReportsComponent } from './features/viewreports/viewreports.component';
import { HeatmapComponent } from './features/heatmap/heatmap.component';

export const routes: Routes = [
  { path: '', component: Feature1Component },
  { path: 'feature1', component: Feature1Component },
  { path: 'crowdsource', component: CrowdsourceComponent },
  { path: 'viewreports', component: ViewReportsComponent },
  { path: 'heatmap', component: HeatmapComponent }
];