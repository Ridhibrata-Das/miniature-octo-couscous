'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  timestamp: string;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: 1,
      title: 'Increase Watering Frequency',
      description: 'Soil moisture levels are below optimal. Consider increasing watering frequency to maintain proper moisture levels.',
      priority: 'high',
      category: 'Irrigation',
      timestamp: '2024-03-20 10:30 AM',
    },
    {
      id: 2,
      title: 'Optimal Temperature Range',
      description: 'Current temperature is within the optimal range for crop growth. Continue monitoring for any significant changes.',
      priority: 'low',
      category: 'Climate',
      timestamp: '2024-03-20 10:00 AM',
    },
    {
      id: 3,
      title: 'Humidity Alert',
      description: 'High humidity levels detected. Consider improving ventilation to prevent potential fungal growth.',
      priority: 'medium',
      category: 'Climate',
      timestamp: '2024-03-20 09:45 AM',
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">AI Recommendations</h1>
        <Button>Refresh Recommendations</Button>
      </div>

      <div className="grid gap-6">
        {recommendations.map(recommendation => (
          <Card key={recommendation.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{recommendation.title}</h3>
                  <Badge variant="outline" className={getPriorityColor(recommendation.priority)}>
                    {recommendation.priority}
                  </Badge>
                  <Badge variant="outline">{recommendation.category}</Badge>
                </div>
                <p className="text-gray-600">{recommendation.description}</p>
                <p className="text-sm text-gray-500">{recommendation.timestamp}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 