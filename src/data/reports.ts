import type { Report } from '@/types';

export const mockReports: Report[] = [
  {
    id: 'report-1',
    reporterId: 'user-current',
    reporterName: '我是宝妈',
    targetType: 'product',
    targetId: 'prod-6',
    targetTitle: '芭比娃娃套装',
    type: 'dangerous_toy',
    description: '这个娃娃有小零件很容易掉，我家宝宝差点吞下去，太危险了！',
    evidence: [],
    status: 'processing',
    handlerReply: '已收到您的举报，正在核实中，预计1-3个工作日内给您回复。',
    createdAt: '2024-05-20T10:30:00Z',
    handledAt: '2024-05-21T09:15:00Z',
  },
];

export const pickupPoints = [
  {
    id: 'point-1',
    name: '望京SOHO 便利店',
    address: '北京市朝阳区望京SOHO T1 B座',
    distance: 0.8,
    type: '便利店',
    hours: '8:00 - 22:00',
  },
  {
    id: 'point-2',
    name: '四得公园 东门',
    address: '北京市朝阳区四得公园东门',
    distance: 1.2,
    type: '公园',
    hours: '6:00 - 22:00',
  },
  {
    id: 'point-3',
    name: '望京地铁站 A口',
    address: '北京市朝阳区地铁14号线望京站A口',
    distance: 1.5,
    type: '地铁站',
    hours: '5:30 - 23:00',
  },
  {
    id: 'point-4',
    name: '凯德MALL 服务台',
    address: '北京市朝阳区广顺北大街33号',
    distance: 2.0,
    type: '商场',
    hours: '10:00 - 22:00',
  },
];

export const platformRules = [
  {
    id: 'rule-1',
    title: '玩具安全标准',
    content: '所有发布的玩具必须符合国家玩具安全标准（GB 6675），严禁发布存在安全隐患的玩具。',
  },
  {
    id: 'rule-2',
    title: '消毒卫生要求',
    content: '建议卖家在发布前对玩具进行消毒处理，并在商品描述中说明消毒方式。毛绒玩具建议清洗晾晒，塑料玩具建议酒精擦拭。',
  },
  {
    id: 'rule-3',
    title: '如实描述义务',
    content: '卖家必须如实描述玩具的成色、瑕疵、配件情况，如因描述不实产生纠纷，卖家需承担相应责任。',
  },
  {
    id: 'rule-4',
    title: '交易方式说明',
    content: '平台支持自提和邮寄两种交易方式。自提请在公共场所进行，确保人身安全。邮寄请妥善包装，避免运输损坏。',
  },
  {
    id: 'rule-5',
    title: '禁止发布品类',
    content: '禁止发布以下商品：假冒伪劣玩具、存在安全召回的玩具、破损严重无法使用的玩具、违反国家规定的玩具。',
  },
];
