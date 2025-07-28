"use client";

import { useEffect, useState } from 'react';
import { Tabs } from '@/components/ui/Tabs'; // Assume you have a Tabs component
import PortfolioGrid from '../components/PortfolioGrid'; // You may need to create this
import ModelHeader from '../components/ModelHeader'; // You may need to create this

interface Model {
  id: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

interface PortfolioItem {
  id: number | string;
  type: 'photo' | 'video';
  title?: string;
  url: string;
  thumbnailUrl?: string;
}

interface ModelPageClientProps {
  modelId: string;
}

export default function ModelPageClient({ modelId }: ModelPageClientProps) {
  const [model, setModel] = useState<Model | null>(null);
  const [portfolio, setPortfolio] = useState({ photos: [] as PortfolioItem[], videos: [] as PortfolioItem[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch model data
    const fetchModel = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/models/${modelId}`);
        const modelData = await response.json();
        setModel(modelData);
      } catch (error) {
        console.error('Error fetching model:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [modelId]);

  useEffect(() => {
    // Fetch portfolio data
    const fetchPortfolio = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/models/${modelId}/portfolio`);
        const portfolioData = await response.json();
        setPortfolio(portfolioData);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };

    fetchPortfolio();
  }, [modelId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!model) {
    return <div>Model not found</div>;
  }

  // Combine photos and videos for PortfolioGrid
  const portfolioItems = [...portfolio.photos, ...portfolio.videos];

  return (
    <div className="container mx-auto px-4 py-8">
      <ModelHeader model={model} />
      
      <Tabs>
        <Tabs.Tab label="Portfolio">
          <PortfolioGrid items={portfolioItems} />
        </Tabs.Tab>
        <Tabs.Tab label="About">
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">About {model.name}</h3>
            <p className="text-gray-600">{model.bio || 'No bio available.'}</p>
          </div>
        </Tabs.Tab>
        <Tabs.Tab label="Contact">
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <p className="text-gray-600">Contact details will be displayed here.</p>
          </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
} 