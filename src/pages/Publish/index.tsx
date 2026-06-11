import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  X,
  Image as ImageIcon,
  AlertTriangle,
  Sparkles,
  Shield,
  Check,
  Info,
} from 'lucide-react';
import { useProductStore } from '@/stores/useProductStore';
import {
  conditionLabels,
  ageRanges,
  type ProductCondition,
  recallToys,
} from '@/types';
import { categories } from '@/data/categories';

export default function Publish() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addProduct, updateProduct, getProductById, checkRecallRisk } = useProductStore();

  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    categoryName: '',
    price: '',
    originalPrice: '',
    condition: 'good' as ProductCondition,
    ageRange: '',
    description: '',
    location: '北京市朝阳区',
    sterilized: false,
    sterilizationMethod: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [accessories, setAccessories] = useState<string[]>([]);
  const [defects, setDefects] = useState<string[]>([]);
  const [newAccessory, setNewAccessory] = useState('');
  const [newDefect, setNewDefect] = useState('');
  const [showRecallWarning, setShowRecallWarning] = useState(false);
  const [recallMatches, setRecallMatches] = useState<typeof recallToys>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const product = getProductById(id);
      if (product) {
        setFormData({
          title: product.title,
          categoryId: product.categoryId,
          categoryName: product.categoryName,
          price: product.price.toString(),
          originalPrice: product.originalPrice.toString(),
          condition: product.condition,
          ageRange: product.ageRange,
          description: product.description,
          location: product.location,
          sterilized: product.sterilized,
          sterilizationMethod: product.sterilizationMethod,
        });
        setImages(product.images);
        setAccessories(product.accessories);
        setDefects(product.defects);
      }
    }
  }, [isEdit, id, getProductById]);

  useEffect(() => {
    const hasRisk = checkRecallRisk(formData.title, formData.description);
    setShowRecallWarning(hasRisk);
    
    if (hasRisk) {
      const matches = recallToys.filter(
        (toy) =>
          formData.title.includes(toy.name) ||
          formData.description.includes(toy.name)
      );
      setRecallMatches(matches);
    } else {
      setRecallMatches([]);
    }
  }, [formData.title, formData.description, checkRecallRisk]);

  const handleImageUpload = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600&h=600&fit=crop',
    ];
    if (images.length < 9) {
      const newImage = sampleImages[images.length % sampleImages.length];
      setImages([...images, newImage]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addAccessory = () => {
    if (newAccessory.trim()) {
      setAccessories([...accessories, newAccessory.trim()]);
      setNewAccessory('');
    }
  };

  const removeAccessory = (index: number) => {
    setAccessories(accessories.filter((_, i) => i !== index));
  };

  const addDefect = () => {
    if (newDefect.trim()) {
      setDefects([...defects, newDefect.trim()]);
      setNewDefect('');
    }
  };

  const removeDefect = (index: number) => {
    setDefects(defects.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('请填写商品标题');
      return;
    }
    if (!formData.categoryId) {
      alert('请选择商品分类');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert('请填写正确的价格');
      return;
    }
    if (images.length === 0) {
      alert('请至少上传一张商品图片');
      return;
    }
    if (!formData.ageRange) {
      alert('请选择适用年龄');
      return;
    }

    const productData = {
      title: formData.title,
      categoryId: formData.categoryId,
      categoryName: formData.categoryName,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || 0,
      condition: formData.condition,
      ageRange: formData.ageRange,
      description: formData.description,
      images,
      accessories,
      defects,
      sterilized: formData.sterilized,
      sterilizationMethod: formData.sterilizationMethod,
      hasRecallRisk: showRecallWarning,
      recallInfo: recallMatches.length > 0 ? recallMatches[0].reason : undefined,
      location: formData.location,
      sellerId: 'user-current',
      status: 'active' as const,
    };

    if (isEdit && id) {
      updateProduct(id, productData);
    } else {
      addProduct(productData);
    }

    setSubmitted(true);
    
    setTimeout(() => {
      navigate('/profile/listings');
    }, 1500);
  };

  const handleCategorySelect = (cat: typeof categories[0]) => {
    setFormData({
      ...formData,
      categoryId: cat.id,
      categoryName: cat.name,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {isEdit ? '修改成功！' : '发布成功！'}
          </h2>
          <p className="text-gray-500">正在跳转到我的发布...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">
            {isEdit ? '编辑商品' : '发布闲置'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-4 space-y-4">
        {/* 图片上传 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary-500" />
            商品图片
            <span className="text-xs text-gray-400">(最多9张)</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary-500 text-white text-xs rounded">
                    主图
                  </span>
                )}
              </div>
            ))}
            {images.length < 9 && (
              <button
                onClick={handleImageUpload}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
              >
                <Plus className="w-8 h-8 mb-1" />
                <span className="text-xs">添加图片</span>
              </button>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-white rounded-2xl p-4 space-y-4">
          <h3 className="font-medium text-gray-800">基本信息</h3>

          {/* 标题 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">商品标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入商品标题，如：乐高城市系列消防站"
              className="input-field"
              maxLength={50}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {formData.title.length}/50
            </p>
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">商品分类</label>
            <div className="grid grid-cols-5 gap-2">
              {categories.slice(0, 10).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all ${
                    formData.categoryId === cat.id
                      ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-300'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}>
                    <span className="text-sm">🎮</span>
                  </div>
                  <span className="truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 价格 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                售价 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="input-field pl-8"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">原价</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="选填"
                  className="input-field pl-8"
                />
              </div>
            </div>
          </div>

          {/* 成色 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">成色</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(conditionLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() =>
                    setFormData({ ...formData, condition: key as ProductCondition })
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.condition === key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 适用年龄 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">适用年龄</label>
            <div className="flex flex-wrap gap-2">
              {ageRanges.map((age) => (
                <button
                  key={age.id}
                  onClick={() => setFormData({ ...formData, ageRange: age.id })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.ageRange === age.id
                      ? 'bg-secondary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>

          {/* 所在地 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">所在地</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* 商品描述 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3">商品描述</h3>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="请详细描述商品情况，包括使用时长、购买渠道等"
            rows={4}
            className="input-field resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {formData.description.length}/500
          </p>
        </div>

        {/* 配件清单 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            配件清单
            <span className="text-xs text-gray-400 font-normal">(选填)</span>
          </h3>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newAccessory}
              onChange={(e) => setNewAccessory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAccessory()}
              placeholder="添加配件，如：说明书、包装盒"
              className="input-field flex-1"
            />
            <button
              onClick={addAccessory}
              className="px-4 py-2 bg-secondary-500 text-white rounded-xl font-medium"
            >
              添加
            </button>
          </div>

          {accessories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {accessories.map((acc, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  {acc}
                  <button
                    onClick={() => removeAccessory(index)}
                    className="ml-1 hover:text-green-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 瑕疵标注 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            瑕疵标注
            <span className="text-xs text-gray-400 font-normal">(如实填写，避免纠纷)</span>
          </h3>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newDefect}
              onChange={(e) => setNewDefect(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDefect()}
              placeholder="添加瑕疵，如：包装盒破损"
              className="input-field flex-1"
            />
            <button
              onClick={addDefect}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium"
            >
              添加
            </button>
          </div>

          {defects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {defects.map((def, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {def}
                  <button
                    onClick={() => removeDefect(index)}
                    className="ml-1 hover:text-orange-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {defects.length === 0 && (
            <p className="text-xs text-gray-400">
              没有瑕疵可不填写，如实描述更易获得信任
            </p>
          )}
        </div>

        {/* 安全检查 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary-500" />
            安全承诺
          </h3>

          {/* 消毒情况 */}
          <div className="mb-4">
            <label className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                checked={formData.sterilized}
                onChange={(e) =>
                  setFormData({ ...formData, sterilized: e.target.checked })
                }
                className="w-5 h-5 rounded text-primary-500"
              />
              <span className="text-gray-700">我已对玩具进行消毒处理</span>
            </label>
            {formData.sterilized && (
              <input
                type="text"
                value={formData.sterilizationMethod}
                onChange={(e) =>
                  setFormData({ ...formData, sterilizationMethod: e.target.value })
                }
                placeholder="请说明消毒方式，如：酒精擦拭、阳光暴晒等"
                className="input-field mt-2"
              />
            )}
          </div>

          {/* 安全声明 */}
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>
                我承诺所发布的玩具符合国家玩具安全标准，不存在已知的安全隐患。
                如因玩具质量问题造成损害，我将承担相应责任。
              </span>
            </p>
          </div>
        </div>

        {/* 安全召回提示 */}
        {showRecallWarning && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-red-700 mb-2">安全召回风险提示</h3>
                <p className="text-sm text-red-600 mb-2">
                  检测到您发布的商品可能包含以下召回风险品类：
                </p>
                {recallMatches.map((toy) => (
                  <div key={toy.id} className="bg-white rounded-lg p-3 mb-2">
                    <p className="font-medium text-red-700 text-sm">{toy.name}</p>
                    <p className="text-xs text-red-500 mt-1">{toy.reason}</p>
                  </div>
                ))}
                <p className="text-xs text-red-500 mt-2">
                  为保障儿童安全，此类商品可能无法通过审核。请确认您的玩具是安全的。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部提交按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-bottom md:static md:border-t-0 md:pt-0">
        <div className="container">
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-orange-400 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            {isEdit ? '保存修改' : '立即发布'}
          </button>
        </div>
      </div>
    </div>
  );
}
