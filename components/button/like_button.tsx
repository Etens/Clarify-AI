import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  diagramId: string;
}

const LikeButton = ({ diagramId }: LikeButtonProps) => {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await axios.get(`/api/diagrams/likes?diagramId=${diagramId}`);
        if (response.status === 200) {
          setLikes(response.data.likes);
          setHasLiked(response.data.hasLiked);
        }
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();
  }, [diagramId]);

  const handleLike = async () => {
    if (!session) {
      console.error('User not authenticated');
      return;
    }

    try {
      const response = await axios.post(`/api/diagrams/like`, { diagramId });
      if (response.status === 200) {
        setLikes(response.data.likes);
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Error liking diagram:', error);
    }
  };

  return (
    <button onClick={handleLike} className={`flex items-center ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}>
      <Heart className="w-5 h-5" />
      <span className="ml-1">{likes}</span>
    </button>
  );
};

export default LikeButton;
