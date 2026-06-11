export type ReportTargetType = 'product' | 'user' | 'order';

export type ReportType = 
  | 'dangerous_toy'
  | 'counterfeit'
  | 'inappropriate_content'
  | 'fraud'
  | 'other';

export type ReportStatus = 'pending' | 'processing' | 'resolved' | 'rejected';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  type: ReportType;
  description: string;
  evidence: string[];
  status: ReportStatus;
  handlerReply?: string;
  createdAt: string;
  handledAt?: string;
}

export interface Arbitration {
  id: string;
  orderId: string;
  applicantId: string;
  applicantName: string;
  respondentId: string;
  respondentName: string;
  reason: string;
  description: string;
  evidence: string[];
  status: ReportStatus;
  platformReply?: string;
  resolution?: string;
  createdAt: string;
  handledAt?: string;
}

export const reportTypeLabels: Record<ReportType, string> = {
  dangerous_toy: '危险玩具',
  counterfeit: '假冒伪劣',
  inappropriate_content: '不当内容',
  fraud: '欺诈行为',
  other: '其他问题',
};

export const reportStatusLabels: Record<ReportStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  rejected: '已驳回',
};

export const reportStatusColors: Record<ReportStatus, string> = {
  pending: 'text-orange-600 bg-orange-50',
  processing: 'text-blue-600 bg-blue-50',
  resolved: 'text-green-600 bg-green-50',
  rejected: 'text-gray-600 bg-gray-50',
};

export const recallToys = [
  {
    id: 'recall-001',
    name: '磁力珠玩具',
    reason: '存在误食窒息风险，小零件可能脱落被儿童吞食',
    date: '2024-01-15',
  },
  {
    id: 'recall-002',
    name: '弹射类玩具枪',
    reason: '弹射力度超标，可能造成眼部伤害',
    date: '2024-03-20',
  },
  {
    id: 'recall-003',
    name: '劣质毛绒玩具',
    reason: '填充物不达标，可能引起过敏反应',
    date: '2024-05-10',
  },
  {
    id: 'recall-004',
    name: '电动遥控车（某批次）',
    reason: '电池过热风险，可能引发火灾',
    date: '2024-06-05',
  },
  {
    id: 'recall-005',
    name: '水晶泥/史莱姆',
    reason: '硼含量超标，长期接触有害健康',
    date: '2024-08-12',
  },
];
