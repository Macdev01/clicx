import React from 'react';
import Image from 'next/image';

function ModelHeader({ model }: { model: { id: string; name?: string; avatarUrl?: string; bio?: string } }) {
  return (
    <div className="flex items-center gap-6 mb-6 p-4 bg-white rounded shadow">
      <Image
        src={model.avatarUrl || '/placeholder-user.jpg'}
        alt={model.name || 'Model avatar'}
        width={80}
        height={80}
        className="rounded-full object-cover border"
      />
      <div>
        <div className="text-2xl font-bold">{model.name}</div>
        {model.bio && <div className="text-gray-600 mt-1">{model.bio}</div>}
        {/* Add more model info here if needed */}
      </div>
    </div>
  );
}

export default ModelHeader; 