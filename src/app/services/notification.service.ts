import { Injectable } from '@angular/core';
import { ref, push, get, update } from 'firebase/database';
import { auth, db } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  async requestPermission(): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  showBrowserNotification(title: string, body: string): void {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    reportId?: string
  ): Promise<void> {
    await push(ref(db, `notifications/${userId}`), {
      title,
      message,
      type,
      reportId: reportId || '',
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  async getMyUnreadNotifications(): Promise<any[]> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return [];
    }

    const snapshot = await get(ref(db, `notifications/${currentUser.uid}`));

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();

    return Object.keys(data)
      .map((id) => ({ id, ...data[id] }))
      .filter((notification) => !notification.read)
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });
  }

  async markAllAsRead(): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return;
    }

    const notifications = await this.getMyUnreadNotifications();

    for (const notification of notifications) {
      await update(ref(db, `notifications/${currentUser.uid}/${notification.id}`), {
        read: true
      });
    }
  }

  notifyNearbyHighSeverity(reports: any[]): void {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const nearbyHighSeverityReports = reports.filter((report) => {
        if (!report.latitude || !report.longitude) {
          return false;
        }

        const severity = String(report.severity || '').toLowerCase();

        if (severity !== 'high') {
          return false;
        }

        const distanceKm = this.calculateDistanceKm(
          userLat,
          userLng,
          Number(report.latitude),
          Number(report.longitude)
        );

        return distanceKm <= 1;
      });

      if (nearbyHighSeverityReports.length > 0) {
        this.showBrowserNotification(
          'Nearby High-Severity Hazard',
          `${nearbyHighSeverityReports.length} high-severity hazard(s) were reported near your location.`
        );
      }
    });
  }

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const earthRadiusKm = 6371;

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}