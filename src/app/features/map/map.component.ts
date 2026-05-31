import { Component, NgZone } from '@angular/core';
import {MContainerComponent} from "../../m-framework/components/m-container/m-container.component";
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { CommonModule, Location } from '@angular/common';
import { MAhaComponent } from "../../m-framework/components/m-aha/m-aha.component";
import { FormsModule } from '@angular/forms';

declare var google:any;
interface SafetyReport {
  id?: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MContainerComponent, CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  latitude: number;
  longitude: number;
  map!: any;
  mapElementRef!: HTMLElement;
  selectedAreaReports: SafetyReport[] = [];
  showReportBox: boolean = false;
  reports: SafetyReport[] = [];
  reportCircles: any[] = []
  allReports: SafetyReport[] = [];
  selectedCategory: string = 'All';
  selectedSeverity: string = 'All';
  selectedTimeRange: string = 'All';
  filteredReports: SafetyReport[] = [];   // reports shown after Load Reports
  showFilteredReportsBox: boolean = false; // filter results box
  filterHidden: boolean = false;


categories: string[] = [
  'All',
  'Poorly Lit Street',
  'Damaged Infrastructure',
  'Security Concern',
  'Environmental Hazard'
];

severities: string[] = [
  'All',
  'Low',
  'Medium',
  'High'
];

timeRanges: string[] = [
  'Last 24 Hours',
  'Last Week',
  'All'
];

  constructor(
  private firebase: FirebaseService,
  private location: Location,
  private ngZone: NgZone
) {
  this.latitude = 0;
  this.longitude = 0;
}

openAreaReports(report: SafetyReport) {
  this.ngZone.run(() => {
    this.selectedAreaReports = this.getReportsNearArea(report);

    // close filtered report box if it is open
    this.showFilteredReportsBox = false;

    // open heat zone report box
    this.showReportBox = true;
  });
}

toggleFilter() {
  this.filterHidden = !this.filterHidden;
}

  ngOnInit(){
    this.getPosition();
  }

  goBack() {
  this.location.back();
}

  getPosition()
  {
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition((data) => {
        this.latitude = data.coords.latitude;
        this.longitude = data.coords.longitude;
        this.loadMap();
      })
    }
  }

  loadMap() {
  console.log(this.latitude);
  console.log(this.longitude);

  const mapOptions = {
    center: { lat: this.latitude, lng: this.longitude },
    zoom: 15,
    mapTypeId: 'roadmap'
  };

  this.mapElementRef = document.getElementById('map') as HTMLElement;
  this.map = new google.maps.Map(this.mapElementRef, mapOptions);

  this.addMarker();

  this.loadReportsFromFirebase();
}

loadReportsFromFirebase() {
  this.firebase.listenToList('reports', (data: SafetyReport[]) => {
    console.log('Firebase reports on map:', data);

    this.allReports = data.filter(report =>
      report.latitude !== undefined &&
      report.longitude !== undefined &&
      report.category &&
      report.severity
    );

    // Heatmap should show from the beginning
    this.reports = this.allReports;

    this.displayReportHeatmap();
  });
}

applyFilters() {
  console.log('Load Reports clicked');

  this.filteredReports = this.allReports.filter(report => {
    const categoryMatch =
      this.selectedCategory === 'All' ||
      report.category === this.selectedCategory;

    const severityMatch =
      this.selectedSeverity === 'All' ||
      report.severity === this.selectedSeverity;

    const timeMatch = this.matchesTimeRange(report.timestamp);

    return categoryMatch && severityMatch && timeMatch;
  });

  this.showFilteredReportsBox = true;

  console.log('Filtered reports:', this.filteredReports);
}



matchesTimeRange(timestamp: string): boolean {
  if (this.selectedTimeRange === 'All') {
    return true;
  }

  const reportTime = new Date(timestamp).getTime();

  if (isNaN(reportTime)) {
    return false;
  }

  const now = Date.now();

  if (this.selectedTimeRange === 'Last 24 Hours') {
    return now - reportTime <= 24 * 60 * 60 * 1000;
  }

  if (this.selectedTimeRange === 'Last Week') {
    return now - reportTime <= 7 * 24 * 60 * 60 * 1000;
  }

  return true;
}


displayReportHeatmap() {
  // clear old circles
  this.reportCircles.forEach(circle => circle.setMap(null));
  this.reportCircles = [];

  this.reports.forEach(report => {
    let radius = 60;
    let opacity = 0.25;
    let color = '#00aa00'; // Low = green

    if (report.severity === 'Medium') {
      radius = 90;
      opacity = 0.35;
      color = '#ff9900'; // Medium = orange
    }

    if (report.severity === 'High') {
      radius = 130;
      opacity = 0.5;
      color = '#ff0000'; // High = red
    }

    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: opacity,
      map: this.map,
      center: {
        lat: Number(report.latitude),
        lng: Number(report.longitude)
      },
      radius: radius,
      clickable: true,
      zIndex: 20
    });

    circle.addListener('click', () => {
      this.openAreaReports(report);
    });

    circle.addListener('dblclick', () => {
      this.openAreaReports(report);
    });

    this.reportCircles.push(circle);
  });
}

addMarker() {
  const marker = new google.maps.Marker({
    position: {
      lat: this.latitude,
      lng: this.longitude
    },
    map: this.map,
    title: 'Your Current Location'
  });

  return marker;
}

getReportsNearArea(clickedReport: SafetyReport): SafetyReport[] {
  const areaRadiusMeters = 200;

  return this.reports.filter(report => {
    const distance = this.calculateDistance(
      clickedReport.latitude,
      clickedReport.longitude,
      report.latitude,
      report.longitude
    );

    return distance <= areaRadiusMeters;
  });
}

calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadius = 6371000;

  const dLat = this.toRadians(lat2 - lat1);
  const dLng = this.toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRadians(lat1)) *
    Math.cos(this.toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

closeReportBox() {
  this.showReportBox = false;
  this.selectedAreaReports = [];
}


closeFilteredReportsBox() {
  this.showFilteredReportsBox = false;
  this.filteredReports = [];
}

}
