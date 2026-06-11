import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  AlertTriangle,
  Shield,
  Flag,
  Scale,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Plus,
  X,
  Image as ImageIcon,
  Package,
  User as UserIcon,
  FileText,
  MapPin,
  Info,
} from 'lucide-react';
import { useReportStore } from '@/stores/useReportStore';
import { useProductStore } from '@/stores/useProductStore';
import {
  reportTypeLabels,
  reportStatusLabels,
  reportStatusColors,
  recallToys,
  type ReportType,
  type ReportTargetType,
} from '@/types';
import { pickupPoints, platformRules } from '@/data/reports';
import { formatDistance, formatRelativeTime } from '@/utils/format';

export default function Report() {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const [searchParams] = useSearchParams();
  const { getReports, createReport, getPickupPoints, getPlatformRules } = useReportStore();
  const { getProductById } = useProductStore();

  const reports = getReports();
  const pickupPointsList = getPickupPoints();
  const rules = getPlatformRules();

  const targetType = searchParams.get('type') as ReportTargetType | null;
  const targetId = searchParams.get('id') || '';

  // 举报提交页面
  if (section === 'submit') {
    return <ReportSubmitPage onBack={() => navigate(-1)} targetType={targetType || 'product'} targetId={targetId} />;
  }

  // 处理进度页面
  if (section === 'progress') {
    return <ProgressPage onBack={() => navigate('/report')} />;
  }

  // 主页面
  return (
    <div className="min-h-screen bg-warm-50 pb-20 md:pb-0">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">举报仲裁</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-4 space-y-4">
        {/* 安全保障横幅 */}
        <div className="bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-10 h-10" />
            <div>
              <h2 className="text-xl font-bold">安全交易保障</h2>
              <p className="text-white/80 text-sm">平台为您的每一笔交易保驾护航</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/20 rounded-xl p-2 text-center">
              <p className="text-lg font-bold">100%</p>
              <p className="text-xs text-white/80">担保交易</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2 text-center">
              <p className="text-lg font-bold">24h</p>
              <p className="text-xs text-white/80">快速处理</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2 text-center">
              <p className="text-lg font-bold">免费</p>
              <p className="text-xs text-white/80">仲裁服务</p>
            </div>
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/report/submit?type=product')}
            className="bg-white rounded-2xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
              <Flag className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">举报商品</h3>
            <p className="text-xs text-gray-500">
              发现危险玩具、违规商品请举报
            </p>
          </button>

          <button
            onClick={() => navigate('/report/submit?type=order')}
            className="bg-white rounded-2xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <Scale className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">申请仲裁</h3>
            <p className="text-xs text-gray-500">
              交易纠纷申请平台介入
            </p>
          </button>
        </div>

        {/* 我的举报/仲裁 */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              处理进度
            </h3>
            <button
              onClick={() => navigate('/report/progress')}
              className="text-sm text-gray-500 flex items-center gap-1"
            >
              全部记录
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">暂无举报/仲裁记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 3).map((report) => (
                <div
                  key={report.id}
                  className="p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      {reportTypeLabels[report.type as ReportType]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${reportStatusColors[report.status]}`}>
                      {reportStatusLabels[report.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {report.description}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatRelativeTime(report.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 安全召回名单 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            安全召回名单
          </h3>
          <div className="space-y-2">
            {recallToys.slice(0, 3).map((toy) => (
              <div
                key={toy.id}
                className="p-3 bg-orange-50 border border-orange-100 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-700 text-sm">
                      {toy.name}
                    </p>
                    <p className="text-xs text-orange-600 mt-0.5">
                      {toy.reason}
                    </p>
                    <p className="text-xs text-orange-400 mt-1">
                      召回日期：{toy.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 text-sm text-orange-500 font-medium">
            查看全部召回名单 →
          </button>
        </div>

        {/* 附近面交点 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-500" />
            附近安全面交点
          </h3>
          <div className="space-y-3">
            {pickupPointsList.slice(0, 3).map((point) => (
              <div
                key={point.id}
                className="p-3 bg-green-50 border border-green-100 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {point.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {point.address}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {point.hours}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    {formatDistance(point.distance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 平台规则 */}
        <div className="bg-white rounded-2xl p-4 mb-8">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-secondary-500" />
            平台规则
          </h3>
          <div className="space-y-3">
            {rules.slice(0, 3).map((rule) => (
              <div key={rule.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <h4 className="font-medium text-gray-800 text-sm mb-1">
                  {rule.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {rule.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 举报提交页面
function ReportSubmitPage({
  onBack,
  targetType,
  targetId,
}: {
  onBack: () => void;
  targetType: ReportTargetType;
  targetId: string;
}) {
  const navigate = useNavigate();
  const { createReport } = useReportStore();
  const { getProductById } = useProductStore();

  const [type, setType] = useState<ReportType>('dangerous_toy');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const product = targetType === 'product' && targetId ? getProductById(targetId) : undefined;

  const reportTypes: { key: ReportType; label: string; icon: any; color: string }[] = [
    { key: 'dangerous_toy', label: '危险玩具', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
    { key: 'counterfeit', label: '假冒伪劣', icon: Package, color: 'bg-orange-100 text-orange-600' },
    { key: 'inappropriate_content', label: '不当内容', icon: FileText, color: 'bg-yellow-100 text-yellow-600' },
    { key: 'fraud', label: '欺诈行为', icon: UserIcon, color: 'bg-purple-100 text-purple-600' },
    { key: 'other', label: '其他问题', icon: Info, color: 'bg-gray-100 text-gray-600' },
  ];

  const handleSubmit = () => {
    if (!description.trim()) {
      alert('请填写详细描述');
      return;
    }

    createReport({
      targetType,
      targetId,
      targetTitle: product?.title,
      type,
      description,
      evidence,
    });

    setSubmitted(true);
    
    setTimeout(() => {
      navigate('/report/progress');
    }, 2000);
  };

  const addEvidence = () => {
    if (evidence.length < 6) {
      setEvidence([
        ...evidence,
        `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 100000}?w=200&h=200&fit=crop`,
      ]);
    }
  };

  const removeEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">提交成功！</h2>
          <p className="text-gray-500 mb-2">我们将在1-3个工作日内处理</p>
          <p className="text-gray-400 text-sm">正在跳转到处理进度...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* 顶部 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">
            {targetType === 'order' ? '申请仲裁' : '举报'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-4 space-y-4">
        {/* 关联商品/订单 */}
        {product && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="text-sm text-gray-500 mb-3">举报的商品</h3>
            <div className="flex gap-3">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 line-clamp-2">
                  {product.title}
                </p>
                <p className="text-primary-500 font-bold mt-1">
                  ¥{product.price}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 举报类型 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3">
            {targetType === 'order' ? '仲裁类型' : '举报类型'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {reportTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setType(item.key)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    type === item.key
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 详细描述 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3">详细描述</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请详细描述问题情况，以便我们更好地处理"
            rows={5}
            className="input-field resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {description.length}/500
          </p>
        </div>

        {/* 上传证据 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3">
            上传凭证
            <span className="text-xs text-gray-400 font-normal ml-2">
              (选填，最多6张)
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {evidence.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeEvidence(index)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {evidence.length < 6 && (
              <button
                onClick={addEvidence}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-xs">添加</span>
              </button>
            )}
          </div>
        </div>

        {/* 提示 */}
        <div className="bg-blue-50 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-600">
              <p className="font-medium mb-1">温馨提示</p>
              <ul className="space-y-0.5">
                <li>· 请如实填写信息，恶意举报将影响您的信用</li>
                <li>· 平台将在1-3个工作日内处理您的申请</li>
                <li>· 紧急情况请联系客服：400-xxx-xxxx</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 底部提交 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-bottom">
        <div className="container">
          <button
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-orange-400 text-white rounded-full font-bold text-lg shadow-lg disabled:opacity-50"
          >
            提交{targetType === 'order' ? '仲裁申请' : '举报'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 处理进度页面
function ProgressPage({ onBack }: { onBack: () => void }) {
  const { getReports } = useReportStore();
  const reports = getReports();

  return (
    <div className="min-h-screen bg-warm-50 pb-20">
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">处理进度</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-4">
        {reports.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-4"
              >
                {/* 头部 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      report.status === 'resolved'
                        ? 'bg-green-100'
                        : report.status === 'rejected'
                        ? 'bg-gray-100'
                        : 'bg-orange-100'
                    }`}>
                      {report.status === 'resolved' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : report.status === 'rejected' ? (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {reportTypeLabels[report.type as ReportType]}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(report.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${reportStatusColors[report.status]}`}>
                    {reportStatusLabels[report.status]}
                  </span>
                </div>

                {/* 内容 */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {report.description}
                  </p>
                </div>

                {/* 处理进度时间轴 */}
                <div className="pl-2">
                  <div className="relative pl-4 pb-3">
                    <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary-500" />
                    <p className="text-sm text-gray-700">提交申请</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatRelativeTime(report.createdAt)}
                    </p>
                  </div>

                  {(report.status === 'processing' || report.status === 'resolved' || report.status === 'rejected') && (
                    <div className="relative pl-4 pb-3">
                      <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary-500" />
                      <p className="text-sm text-gray-700">平台受理</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        工作人员正在核实中
                      </p>
                    </div>
                  )}

                  {(report.status === 'resolved' || report.status === 'rejected') && (
                    <div className="relative pl-4">
                      <div className={`absolute left-0 top-1 w-2 h-2 rounded-full ${
                        report.status === 'resolved'
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        report.status === 'resolved' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {report.status === 'resolved' ? '处理完成' : '申请驳回'}
                      </p>
                      {report.handlerReply && (
                        <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded-lg p-2">
                          {report.handlerReply}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
