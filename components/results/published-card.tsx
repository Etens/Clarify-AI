import React, { useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/results/card';
import { CopyButton } from '../button/copy-button';
import { DownloadButton } from '../button/download-button';
import LikeButton from '../button/like-button';
import { Eye } from 'lucide-react';
import axios from 'axios';
import { Button } from '../button/button';

interface PublishedCardProps {
  diagram: any;
}

const PublishedCard = ({ diagram }: PublishedCardProps) => {
  console.log("🔍 Diagram data in PublishedCard:", diagram);

  const userInitial = diagram.user.name ? diagram.user.name.charAt(0) : '?';

  useEffect(() => {
    const incrementViews = async () => {
      try {
        console.log('👀 Incrementing views for diagram with ID:', diagram.id);
        await axios.patch(`/api/diagrams/views?id=${diagram.id}`);
        console.log('✅ Views incremented successfully');
      } catch (error) {
        console.error('❌ Error incrementing views:', error);
      }
    };

    incrementViews();
  }, [diagram.id]);

  return (
    <Card className="flex flex-col items-center bg-white p-4 rounded-lg shadow-lg w-full scale-75">
      <CardHeader className="flex justify-between items-center w-full p-8 rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="flex w-full h-full items-center justify-between">
          <div className="flex flex-col space-y-2 items-center justify-center ml-9">
            {diagram.user.image ? (
              <img src={diagram.user.image} alt={diagram.user.name || 'Unknown'} className="w-32 h-32 rounded-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl text-gray-500">{userInitial}</span>
              </div>
            )}
            <h1 className='text-lg font-semibold text-white'>{diagram.user.name || 'Unknown User'}</h1>
          </div>
          <div className="flex flex-col w-3/4 justify-center items-start h-full space-y-4">
            <h1 className="text-xl font-semibold text-white">
              {diagram.content.title}
            </h1>
            <p className="text-sm text-white font-light w-3/4">
              {diagram.content.userPrompt}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="w-full p-4 bg-zinc-100 rounded-lg flex flex-col items-center justify-center mt-2 h-full">
        <div className="grid grid-cols-2 gap-4">
          {diagram.content.elements && diagram.content.elements.map((element: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="text-md font-semibold">{element.ElementName}</h3>
              {diagram.content.illustrationLinks && diagram.content.illustrationLinks[element.ElementName] && (
                <img src={diagram.content.illustrationLinks[element.ElementName]} alt={element.ElementName} className="mb-2" />
              )}
              <p className="text-sm text-gray-600">{element.Explanation}</p>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between w-full p-4 rounded-b-lg mt-2">
        <div className="flex items-center space-x-6">
          <LikeButton diagramID={diagram.id} initialLikes={diagram.likes} />
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-2">
              <Button variant="default" size="icon" className="text-white">
                <Eye className="h-4 w-4" />
              </Button>
              <span className="text-lg text-gray-600">
                {diagram.views}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <CopyButton targetId={`published-diagram-${diagram.userPrompt}`} />
          <DownloadButton targetId={`published-diagram-${diagram.userPrompt}`} fileName={diagram.userPrompt || 'diagram'} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default PublishedCard;
