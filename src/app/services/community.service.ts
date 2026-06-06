import { Injectable } from '@angular/core';
import { ref, get, update, runTransaction } from 'firebase/database';
import { auth, db } from '../firebase.config';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  constructor(
    private notificationService: NotificationService
  ) {}

  async getReports(): Promise<any[]> {
    const snapshot = await get(ref(db, 'reports'));

    if (!snapshot.exists()) {
      return [];
    }

    const reportsData = snapshot.val();

    return Object.keys(reportsData).map((id) => {
      const report = reportsData[id];

      return {
        id: id,
        ...report,
        upvoteCount: report.upvotes ? Object.keys(report.upvotes).length : 0,
        disputeCount: report.disputes ? Object.keys(report.disputes).length : 0
      };
    }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  async upvoteReport(reportId: string): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('You must login first.');
    }

    const reportRef = ref(db, `reports/${reportId}`);
    const snapshot = await get(reportRef);

    if (!snapshot.exists()) {
      throw new Error('Report not found.');
    }

    const report = snapshot.val();

    if (report.userId === currentUser.uid) {
      throw new Error('You cannot upvote your own report.');
    }

    const upvotes = report.upvotes || {};

    if (upvotes[currentUser.uid]) {
      throw new Error('You already upvoted this report.');
    }

    await update(reportRef, {
      [`upvotes/${currentUser.uid}`]: true,
      [`disputes/${currentUser.uid}`]: null
    });

    await this.increaseUserValue(report.userId, 'upvotesReceived', 1);

    // Each upvote gives 2 safety score points
    await this.increaseUserValue(report.userId, 'safetyScore', 2);

    const newUpvoteCount = Object.keys({
      ...upvotes,
      [currentUser.uid]: true
    }).length;

    if (newUpvoteCount >= 3 && !report.verified) {
      await update(reportRef, {
        verified: true
      });

      await this.increaseUserValue(report.userId, 'verifiedReportCount', 1);
      await this.increaseUserValue(report.userId, 'safetyScore', 25);

      await this.notificationService.createNotification(
        report.userId,
        'Report Verified',
        'Your report has been verified by the community after receiving 3 upvotes.',
        'REPORT_VERIFIED',
        reportId
      );
    }
  }

  async disputeReport(reportId: string): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('You must login first.');
    }

    const reportRef = ref(db, `reports/${reportId}`);
    const snapshot = await get(reportRef);

    if (!snapshot.exists()) {
      throw new Error('Report not found.');
    }

    const report = snapshot.val();

    if (report.userId === currentUser.uid) {
      throw new Error('You cannot dispute your own report.');
    }

    const disputes = report.disputes || {};

    if (disputes[currentUser.uid]) {
      throw new Error('You already disputed this report.');
    }

    await update(reportRef, {
      [`disputes/${currentUser.uid}`]: true,
      [`upvotes/${currentUser.uid}`]: null
    });
  }

  async getLeaderboard(): Promise<any[]> {
    const snapshot = await get(ref(db, 'users'));

    if (!snapshot.exists()) {
      return [];
    }

    const usersData = snapshot.val();

    return Object.keys(usersData).map((uid) => {
      return {
        uid: uid,
        ...usersData[uid]
      };
    }).sort((a, b) => (b.safetyScore || 0) - (a.safetyScore || 0));
  }

  async increaseReportCountForUser(uid: string): Promise<void> {
    await this.increaseUserValue(uid, 'reportCount', 1);
    await this.increaseUserValue(uid, 'safetyScore', 10);
  }

  private async increaseUserValue(uid: string, field: string, amount: number): Promise<void> {
    const valueRef = ref(db, `users/${uid}/${field}`);

    await runTransaction(valueRef, (currentValue) => {
      return (currentValue || 0) + amount;
    });
  }
}