import { Component } from '@angular/core';
import {MContainerComponent} from "../../m-framework/components/m-container/m-container.component";

declare var google:any;
interface SafetyReport {
  id: string;
  lat: number;
  lng: number;
  category: string;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  timestamp: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MContainerComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  latitude: number;
  longitude: number;
  map!: any;
  mapElementRef!: HTMLElement;

  reports: SafetyReport[] = [];
  reportCircles: any[] = [];

  constructor(){
    this.latitude = 0;
    this.longitude = 0;
  }

  ngOnInit(){
    this.getPosition();
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

  // temporary dummy reports
  this.createDummyReports();

  // show reports on map
  this.displayReportHeatmap();
}

createDummyReports() {
  this.reports = [
    {
      id: 'r1',
      lat: this.latitude + 0.001,
      lng: this.longitude + 0.001,
      category: 'Poorly Lit Street',
      severity: 'High',
      description: 'Very dark street near parking area',
      timestamp: Date.now()
    },
    {
      id: 'r2',
      lat: this.latitude + 0.0012,
      lng: this.longitude + 0.0011,
      category: 'Security Concern',
      severity: 'High',
      description: 'Suspicious activity reported nearby',
      timestamp: Date.now()
    },
    {
      id: 'r3',
      lat: this.latitude - 0.001,
      lng: this.longitude - 0.001,
      category: 'Damaged Infrastructure',
      severity: 'Medium',
      description: 'Broken pavement near sidewalk',
      timestamp: Date.now()
    },
    {
      id: 'r4',
      lat: this.latitude - 0.0015,
      lng: this.longitude + 0.0008,
      category: 'Environmental Hazard',
      severity: 'Low',
      description: 'Small water leakage on road',
      timestamp: Date.now()
    }
  ];
}

displayReportHeatmap() {
  // clear old circles
  this.reportCircles.forEach(circle => circle.setMap(null));
  this.reportCircles = [];

  this.reports.forEach(report => {
    let radius = 60;
    let opacity = 0.25;

    if (report.severity === 'Medium') {
      radius = 90;
      opacity = 0.35;
    }

    if (report.severity === 'High') {
      radius = 130;
      opacity = 0.5;
    }

    const circle = new google.maps.Circle({
      strokeWeight: 1,
      fillOpacity: opacity,
      map: this.map,
      center: {
        lat: report.lat,
        lng: report.lng
      },
      radius: radius
    });

    circle.addListener('click', () => {
      alert(
        `Category: ${report.category}\n` +
        `Severity: ${report.severity}\n` +
        `Description: ${report.description}`
      );
    });

    this.reportCircles.push(circle);
  });
}

  addMarker()
  {
      const marker = new google.maps.Marker({
      		position: {lat: this.latitude, lng: this.longitude},
      		map: this.map
    	});
    return marker;
  }




}
