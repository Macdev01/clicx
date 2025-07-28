import React from 'react';
import Image from 'next/image';

interface PortfolioItem {
  id: number | string;
  type: 'photo' | 'video';
  title?: string;
  url: string;
  thumbnailUrl?: string;
}

interface PortfolioGridProps {
  items: PortfolioItem[];
  onEdit?: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
  onPreview?: (item: PortfolioItem) => void;
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ items, onEdit, onDelete, onPreview }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="border rounded-lg p-2 flex flex-col items-center bg-white shadow">
          <div className="w-full aspect-video mb-2">
            {item.type === 'photo' ? (
              <Image src={item.thumbnailUrl || item.url} alt={item.title || ''} fill className="object-cover rounded" />
            ) : (
              <video src={item.url} controls className="object-cover w-full h-full rounded" />
            )}
          </div>
          <div className="font-semibold text-sm truncate w-full text-center">{item.title || '(untitled)'}</div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => onPreview?.(item)} className="text-blue-600 hover:underline text-xs">Preview</button>
            <button onClick={() => onEdit?.(item)} className="text-yellow-600 hover:underline text-xs">Edit</button>
            <button onClick={() => onDelete?.(item)} className="text-red-600 hover:underline text-xs">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioGrid; 