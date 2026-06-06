import { Component, NgZone } from '@angular/core';
import {MContainerComponent} from "../../m-framework/components/m-container/m-container.component";
import { FirebaseService } from '../../m-framework/services/firebase.service';
import { CommonModule, Location } from '@angular/common';
import { MAhaComponent } from "../../m-framework/components/m-aha/m-aha.component";
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../m-framework/services/gemini.service';

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
  routeDestination: string = '';
  directionsService!: any;
  directionsRenderer!: any;
  routeMessage: string = '';
  showRouteBox: boolean = false;
  unsafeRouteReports: SafetyReport[] = [];
  unsafeRouteCircles: any[] = [];
  currentRouteResult: any = null;
  selectedRouteIndex: number = 0;
  showRouteActions: boolean = false;
  acceptedRouteMessage: string = '';
  routeAdvisory: string = '';
  showRouteAdvisory: boolean = false;


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
  private ngZone: NgZone,
  private gemini: GeminiService
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
  this.initializeRouteServices();

  this.addMarker();

  this.loadReportsFromFirebase();
}

initializeRouteServices() {
  this.directionsService = new google.maps.DirectionsService();

  this.directionsRenderer = new google.maps.DirectionsRenderer({
    map: this.map,
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: '#2563eb',
      strokeOpacity: 0.9,
      strokeWeight: 6
    }
  });
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

    // When map first opens, show all reports on heatmap
    this.reports = this.allReports;

    // Draw full heatmap initially
    this.displayReportHeatmap();
  });
}

applyFilters() {
  console.log('Apply filters clicked');

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

  // IMPORTANT:
  // Update the heatmap data also
  this.reports = this.filteredReports;

  // Redraw heatmap with only filtered reports
  this.displayReportHeatmap();

  // Show written filtered reports panel too
  this.showFilteredReportsBox = true;

  // Close area report box if it was open
  this.showReportBox = false;
  this.selectedAreaReports = [];

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
    let radius = 30;
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
  
}

drawDefaultRoute() {
  if (!this.routeDestination.trim()) {
    this.routeMessage = 'Please enter a destination.';
    this.showRouteBox = true;
    this.showRouteActions = false;
    return;
  }

  const origin = {
    lat: this.latitude,
    lng: this.longitude
  };

  const request = {
    origin: origin,
    destination: this.routeDestination,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true
  };

  this.directionsService.route(request, (result: any, status: any) => {
    if (status === 'OK') {
      this.currentRouteResult = result;
      this.selectedRouteIndex = 0;

      this.directionsRenderer.setDirections(result);
      this.directionsRenderer.setRouteIndex(0);

      this.checkRouteSafety(result, 0);

      this.showRouteActions = true;
      this.acceptedRouteMessage = '';

      console.log('Route result:', result);
    } else {
      console.error('Directions request failed:', status);

      this.routeMessage = 'Could not draw route. Please check the destination.';
      this.showRouteBox = true;
      this.showRouteActions = false;
    }
  });
}

checkRouteSafety(routeResult: any, routeIndex: number = 0)  {
  this.clearUnsafeRouteCircles();

  const routePath = this.getDetailedRoutePath(routeResult, routeIndex);

  console.log('All reports:', this.allReports);
  console.log('Detailed route path points:', routePath.length);

  this.unsafeRouteReports = this.allReports.filter(report => {
    const isHighSeverity =
      report.severity &&
      report.severity.toLowerCase() === 'high';

    const nearRoute = this.isReportNearRoute(report, routePath);

    console.log('Checking report:', report.category, report.severity, {
      isHighSeverity,
      nearRoute,
      latitude: report.latitude,
      longitude: report.longitude
    });

    return isHighSeverity && this.isActiveReport(report) && nearRoute;
  });

  this.highlightUnsafeRouteZones();

  if (this.unsafeRouteReports.length > 0) {
    this.routeMessage =
      `Warning: This route passes near ${this.unsafeRouteReports.length} high-severity hazard zone(s). ` +
      `The unsafe areas have been highlighted in red. Consider requesting an alternate route.`;
  } else {
    this.routeMessage =
      'Good news: No high-severity hazard zones were detected near this route.';
  }

  this.showRouteBox = true;
  void this.generateRouteAdvisory();
  console.log('Unsafe reports near route:', this.unsafeRouteReports);
}

isActiveReport(report: SafetyReport): boolean {
  if (!report.timestamp) {
    return false;
  }

  const reportTime = new Date(report.timestamp).getTime();

  if (isNaN(reportTime)) {
    return false;
  }

  const now = Date.now();
  const lastWeek = 7 * 24 * 60 * 60 * 1000;

  return now - reportTime <= lastWeek;
}

getDetailedRoutePath(routeResult: any, routeIndex: number = 0): any[] {
  const path: any[] = [];

  const route = routeResult.routes[routeIndex];

  route.legs.forEach((leg: any) => {
    leg.steps.forEach((step: any) => {
      step.path.forEach((point: any) => {
        path.push({
          lat: point.lat(),
          lng: point.lng()
        });
      });
    });
  });

  return path;
}

acceptOriginalRoute() {
  this.acceptedRouteMessage = 'Original route accepted. Please stay alert and follow the highlighted safety information.';

  this.routeMessage = 'You accepted the currently displayed route.';
  this.showRouteBox = true;

  console.log('Accepted route index:', this.selectedRouteIndex);
}

requestAlternateRoute() {
  if (!this.currentRouteResult || !this.currentRouteResult.routes) {
    this.routeMessage = 'No route available. Please draw a route first.';
    this.showRouteBox = true;
    return;
  }

  const totalRoutes = this.currentRouteResult.routes.length;

  if (totalRoutes <= 1) {
    this.routeMessage = 'No alternate route was found by Google Maps for this destination.';
    this.showRouteBox = true;
    return;
  }

  let bestRouteIndex = this.selectedRouteIndex;
  let lowestUnsafeCount = this.unsafeRouteReports.length;

  for (let i = 0; i < totalRoutes; i++) {
    if (i === this.selectedRouteIndex) {
      continue;
    }

    const routePath = this.getDetailedRoutePath(this.currentRouteResult, i);

    const unsafeReportsForRoute = this.allReports.filter(report => {
      const isHighSeverity =
        report.severity &&
        report.severity.toLowerCase() === 'high';

      return isHighSeverity && this.isActiveReport(report) && this.isReportNearRoute(report, routePath);
    });

    if (unsafeReportsForRoute.length < lowestUnsafeCount) {
      lowestUnsafeCount = unsafeReportsForRoute.length;
      bestRouteIndex = i;
    }
  }

  if (bestRouteIndex === this.selectedRouteIndex) {
    this.routeMessage =
      'Alternate routes were checked, but none were safer than the current route.';
    this.showRouteBox = true;
    return;
  }

  this.selectedRouteIndex = bestRouteIndex;

  this.directionsRenderer.setRouteIndex(bestRouteIndex);

  this.checkRouteSafety(this.currentRouteResult, bestRouteIndex);

  this.routeMessage =
    `Alternate route loaded. This route has ${lowestUnsafeCount} high-severity hazard zone(s) nearby.`;

  this.showRouteBox = true;

  console.log('Alternate route selected:', bestRouteIndex);
}

async generateRouteAdvisory() {
  this.showRouteAdvisory = true;

  this.routeAdvisory = 'Generating safety advisory...';

  try {
    const advisory = await this.gemini.generateRouteSafetyAdvisory(
      this.routeDestination,
      this.unsafeRouteReports,
      this.selectedRouteIndex
    );

    this.ngZone.run(() => {
      this.routeAdvisory = advisory;
      this.showRouteAdvisory = true;
    });

  } catch (error) {
    console.error('Failed to generate route advisory:', error);

    this.ngZone.run(() => {
      if (this.unsafeRouteReports.length > 0) {
        this.routeAdvisory =
          `This route passes near ${this.unsafeRouteReports.length} high-severity hazard zone(s). Please stay alert and consider requesting an alternate route.`;
      } else {
        this.routeAdvisory =
          'This route appears safe based on current high-severity reports.';
      }

      this.showRouteAdvisory = true;
    });
  }
}

isReportNearRoute(report: SafetyReport, routePath: any[]): boolean {
  const dangerDistanceMeters = 400;

  const reportLat = Number(report.latitude);
  const reportLng = Number(report.longitude);

  if (isNaN(reportLat) || isNaN(reportLng)) {
    return false;
  }

  for (let i = 0; i < routePath.length - 1; i++) {
    const pointA = routePath[i];
    const pointB = routePath[i + 1];

    const distance = this.distanceFromPointToRouteSegment(
      reportLat,
      reportLng,
      pointA.lat,
      pointA.lng,
      pointB.lat,
      pointB.lng
    );

    if (distance <= dangerDistanceMeters) {
      return true;
    }
  }

  return false;
}

distanceFromPointToRouteSegment(
  pointLat: number,
  pointLng: number,
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): number {
  const earthRadius = 6371000;

  const toRad = (value: number) => value * Math.PI / 180;

  const refLat = toRad(pointLat);

  const project = (lat: number, lng: number) => {
    return {
      x: earthRadius * toRad(lng) * Math.cos(refLat),
      y: earthRadius * toRad(lat)
    };
  };

  const point = project(pointLat, pointLng);
  const start = project(startLat, startLng);
  const end = project(endLat, endLng);

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      Math.pow(point.x - start.x, 2) +
      Math.pow(point.y - start.y, 2)
    );
  }

  let t =
    ((point.x - start.x) * dx + (point.y - start.y) * dy) /
    (dx * dx + dy * dy);

  t = Math.max(0, Math.min(1, t));

  const closestPoint = {
    x: start.x + t * dx,
    y: start.y + t * dy
  };

  return Math.sqrt(
    Math.pow(point.x - closestPoint.x, 2) +
    Math.pow(point.y - closestPoint.y, 2)
  );
}

highlightUnsafeRouteZones() {
  this.unsafeRouteReports.forEach(report => {
    const circle = new google.maps.Circle({
      strokeColor: '#dc2626',
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: '#dc2626',
      fillOpacity: 0.25,
      map: this.map,
      center: {
        lat: Number(report.latitude),
        lng: Number(report.longitude)
      },
      radius: 180,
      clickable: true,
      zIndex: 50
    });

    circle.addListener('click', () => {
      this.openAreaReports(report);
    });

    this.unsafeRouteCircles.push(circle);
  });
}

clearUnsafeRouteCircles() {
  this.unsafeRouteCircles.forEach(circle => circle.setMap(null));
  this.unsafeRouteCircles = [];
}

closeRouteBox() {
  this.showRouteBox = false;
}

}
