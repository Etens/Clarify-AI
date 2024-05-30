// components/button/view-count.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react';

interface ViewCountProps {
  diagramId: string;
}

const ViewCount = ({ diagramId }: ViewCountProps) => {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await axios.get(`/api/diagrams/${diagramId}/views`);
        if (response.status === 200) {
          setViews(response.data.views);
        }
      } catch (error) {
        console.error('Error fetching views:', error);
      }
    };

    fetchViews();
  }, [diagramId]);

  return (
    <div className="flex items-center text-gray-500">
      <Eye className="w-5 h-5" />
      <span className="ml-1">{views}</span>
    </div>
  );
};

export default ViewCount;
