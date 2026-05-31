import { Component } from '@angular/core';
import {MContainerComponent} from "../../m-framework/components/m-container/m-container.component";
import { FirebaseService } from '../../m-framework/services/firebase.service';

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

  constructor(private firebase: FirebaseService) {
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

  this.loadReportsFromFirebase();
}

loadReportsFromFirebase() {
  this.firebase.listenToList('reports', (data: SafetyReport[]) => {
    console.log('Firebase reports on map:', data);

    this.reports = data.filter(report =>
      report.latitude &&
      report.longitude &&
      report.category &&
      report.severity
    );

    this.displayReportHeatmap();
  });
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
      radius: radius
    });

    circle.addListener('click', () => {
      alert(
        `Category: ${report.category}\n` +
        `Severity: ${report.severity}\n` +
        `Description: ${report.description}\n` +
        `Time: ${new Date(report.timestamp).toLocaleString()}`
      );
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


}
