import { Link } from 'react-router-dom';
import { Heart, MapPin, Sparkles } from 'lucide-react';
import { useProductStore } from '@/stores/useProductStore';
import { conditionLabels, conditionColors } from '@/types';
import { formatPrice, formatDistance } from '@/utils/format';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  size?: 'normal' | 'small';
}

export default function ProductCard({ product, size = 'normal' }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useProductStore();
  const favorite = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="card overflow-hidden group block"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {product.sterilized && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-secondary-500 text-white text-xs rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>已消毒</span>
          </div>
        )}

        {product.hasRecallRisk && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
            召回风险
          </div>
        )}

        <button
          onClick={handleFavoriteClick}
          className={`absolute bottom-2 right-2 p-2 rounded-full transition-all ${
            favorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
        </button>

        <div className={`absolute top-2 ${product.sterilized ? 'left-14' : 'left-2'}`}>
          <span className={`tag ${conditionColors[product.condition]} text-xs`}>
            {conditionLabels[product.condition]}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className={`font-medium text-gray-800 line-clamp-2 mb-2 ${
          size === 'small' ? 'text-sm' : 'text-base'
        }`}>
          {product.title}
        </h3>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-xl font-bold text-primary-500">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > 0 && (
              <span className="ml-2 text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {product.distance !== undefined && size === 'normal' && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>距您 {formatDistance(product.distance)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
