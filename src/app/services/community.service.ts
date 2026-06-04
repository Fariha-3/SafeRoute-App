import { Injectable } from '@angular/core';
import { ref, get, update, runTransaction } from 'firebase/database';
import { auth, db } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private reportsPath = 'reports';

  async getReports(): Promise<any[]> {
    const snapshot = await get(ref(db, this.reportsPath));

    if (!snapshot.exists()) {
      return [];
    }

    const reportsData = snapshot.val();

    return Object.keys(reportsData).map((id) => {
      const report = reportsData[id];

      return {
        id,
        ...report,
        userId: report.userId || report.uid || report.createdBy || report.ownerId,
        category: report.category || report.hazardType || 'Uncategorized',
        severity: report.severity || 'Not specified',
        description: report.description || report.details || report.reportDescription || 'No description',
        timestamp: report.timestamp || report.createdAt || 0,
        verified: report.verified || false,
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

    const reportRef = ref(db, `${this.reportsPath}/${reportId}`);
    const snapshot = await get(reportRef);

    if (!snapshot.exists()) {
      throw new Error('Report not found.');
    }

    const report = snapshot.val();
    const reportOwnerId = report.userId || report.uid || report.createdBy || report.ownerId;

    if (!reportOwnerId) {
      throw new Error('This report does not have an owner user ID.');
    }

    if (reportOwnerId === currentUser.uid) {
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

    const newUpvoteCount = Object.keys({
      ...upvotes,
      [currentUser.uid]: true
    }).length;

    if (newUpvoteCount >= 3 && !report.verified) {
      await update(reportRef, {
        verified: true
      });
    }
  }

  async disputeReport(reportId: string): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('You must login first.');
    }

    const reportRef = ref(db, `${this.reportsPath}/${reportId}`);
    const snapshot = await get(reportRef);

    if (!snapshot.exists()) {
      throw new Error('Report not found.');
    }

    const report = snapshot.val();
    const reportOwnerId = report.userId || report.uid || report.createdBy || report.ownerId;

    if (reportOwnerId === currentUser.uid) {
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

  async calculateUserStats(uid: string): Promise<any> {
    const snapshot = await get(ref(db, this.reportsPath));

    let reportCount = 0;
    let verifiedReportCount = 0;
    let upvotesReceived = 0;

    if (snapshot.exists()) {
      const reportsData = snapshot.val();

      Object.keys(reportsData).forEach((reportId) => {
        const report = reportsData[reportId];
        const ownerId = report.userId || report.uid || report.createdBy || report.ownerId;

        if (ownerId === uid) {
          reportCount++;

          if (report.verified) {
            verifiedReportCount++;
          }

          if (report.upvotes) {
            upvotesReceived += Object.keys(report.upvotes).length;
          }
        }
      });
    }

    const safetyScore =
      reportCount * 10 +
      upvotesReceived * 5 +
      verifiedReportCount * 25;

    return {
      reportCount,
      verifiedReportCount,
      upvotesReceived,
      safetyScore
    };
  }

  async getCalculatedLeaderboard(): Promise<any[]> {
    const usersSnapshot = await get(ref(db, 'users'));
    const reportsSnapshot = await get(ref(db, this.reportsPath));

    if (!usersSnapshot.exists()) {
      return [];
    }

    const usersData = usersSnapshot.val();
    const reportsData = reportsSnapshot.exists() ? reportsSnapshot.val() : {};

    const leaderboard = Object.keys(usersData).map((uid) => {
      let reportCount = 0;
      let verifiedReportCount = 0;
      let upvotesReceived = 0;

      Object.keys(reportsData).forEach((reportId) => {
        const report = reportsData[reportId];
        const ownerId = report.userId || report.uid || report.createdBy || report.ownerId;

        if (ownerId === uid) {
          reportCount++;

          if (report.verified) {
            verifiedReportCount++;
          }

          if (report.upvotes) {
            upvotesReceived += Object.keys(report.upvotes).length;
          }
        }
      });

      const safetyScore =
        reportCount * 10 +
        upvotesReceived * 5 +
        verifiedReportCount * 25;

      return {
        uid,
        ...usersData[uid],
        reportCount,
        verifiedReportCount,
        upvotesReceived,
        safetyScore
      };
    });

    return leaderboard.sort((a, b) => b.safetyScore - a.safetyScore);
  }

  async getLeaderboard(): Promise<any[]> {
    return this.getCalculatedLeaderboard();
  }

  private async increaseUserValue(uid: string, field: string, amount: number): Promise<void> {
    const valueRef = ref(db, `users/${uid}/${field}`);

    await runTransaction(valueRef, (currentValue) => {
      return (currentValue || 0) + amount;
    });
  }
}