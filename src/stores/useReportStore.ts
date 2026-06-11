import { create } from 'zustand';
import type { Report, ReportType, ReportTargetType, ReportStatus } from '@/types';
import { mockReports, pickupPoints, platformRules } from '@/data/reports';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import { generateId } from '@/utils/format';

interface ReportState {
  reports: Report[];
  pickupPoints: typeof pickupPoints;
  platformRules: typeof platformRules;
  getReports: (status?: ReportStatus) => Report[];
  getReportById: (id: string) => Report | undefined;
  createReport: (params: {
    targetType: ReportTargetType;
    targetId: string;
    targetTitle?: string;
    type: ReportType;
    description: string;
    evidence?: string[];
  }) => string;
  getPickupPoints: () => typeof pickupPoints;
  getPlatformRules: () => typeof platformRules;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: getStorageItem('reports', mockReports),
  pickupPoints,
  platformRules,

  getReports: (status) => {
    const currentUserId = 'user-current';
    let reports = get().reports.filter((r) => r.reporterId === currentUserId);

    if (status) {
      reports = reports.filter((r) => r.status === status);
    }

    return reports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getReportById: (id) => {
    return get().reports.find((r) => r.id === id);
  },

  createReport: (params) => {
    const currentUserId = 'user-current';
    const reportId = 'report-' + Date.now();

    const newReport: Report = {
      id: reportId,
      reporterId: currentUserId,
      reporterName: '我是宝妈',
      targetType: params.targetType,
      targetId: params.targetId,
      targetTitle: params.targetTitle,
      type: params.type,
      description: params.description,
      evidence: params.evidence || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const reports = [newReport, ...state.reports];
      setStorageItem('reports', reports);
      return { reports };
    });

    return reportId;
  },

  getPickupPoints: () => {
    return get().pickupPoints;
  },

  getPlatformRules: () => {
    return get().platformRules;
  },
}));
