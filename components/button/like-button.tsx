import React, { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from './button';
import axios from 'axios';

interface LikeButtonProps {
  diagramID: string;
  initialLikes: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ diagramID, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const response = await axios.get(`/api/diagrams/like/check?id=${diagramID}`);
        setLiked(response.data.liked);
      } catch (error) {
        console.error('❌ Error checking like status:', error);
      }
    };

    checkIfLiked();
  }, [diagramID]);

  const handleLike = async () => {
    try {
      if (liked) {
        console.log("👎 Unliking diagram with ID:", diagramID);
        await axios.patch(`/api/diagrams/like?id=${diagramID}&action=unlike`);
        setLikes((prevLikes) => prevLikes - 1);
        setLiked(false);
        console.log("✅ Diagram unliked successfully");
      } else {
        console.log("👍 Liking diagram with ID:", diagramID);
        await axios.patch(`/api/diagrams/like?id=${diagramID}&action=like`);
        setLikes((prevLikes) => prevLikes + 1);
        setLiked(true);
        console.log("✅ Diagram liked successfully");
      }
    } catch (error) {
      console.error('❌ An error occurred while updating like status:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="default" size="icon" onClick={handleLike}
        className={`${liked ? 'bg-blue-600 hover:bg-blue-600' : 'bg-primary'}`}>
        <ThumbsUp className="h-4 w-4 text-white" />
      </Button>
      <span className="text-lg text-gray-600">
        {likes}
      </span>
    </div>
  );
};

export default LikeButton;
