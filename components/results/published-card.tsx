import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/results/card';
import { CopyButton } from '../button/copy-button';
import { DownloadButton } from '../button/download-button';
import LikeButton from '../button/like-button';
import CommentForm from '../button/comment-button';
import { Eye } from 'lucide-react';
import axios from 'axios';
import { Button } from '../button/button';
import { formatDistanceToNow } from 'date-fns';
import { useI18n } from '@/locales/client';

interface PublishedCardProps {
  diagram: any;
}

const PublishedCard = ({ diagram }: PublishedCardProps) => {
  console.log("🔍 Diagram data in PublishedCard:", diagram);
  const [comments, setComments] = useState([]);
  const t = useI18n();

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

    const fetchComments = async () => {
      try {
        console.log('💬 Fetching comments for diagram with ID:', diagram.id);
        const response = await axios.get(`/api/diagrams/comments?id=${diagram.id}`);
        setComments(response.data);
        console.log('✅ Comments fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching comments:', error);
      }
    };

    incrementViews();
    fetchComments();
  }, [diagram.id]);

  const handleCommentAdded = () => {
    const fetchComments = async () => {
      try {
        console.log('💬 Fetching comments for diagram with ID:', diagram.id);
        const response = await axios.get(`/api/diagrams/comments?id=${diagram.id}`);
        setComments(response.data);
        console.log('✅ Comments fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching comments:', error);
      }
    };

    fetchComments();
  };

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
            <div className="flex flex-wrap">
              {diagram.content.tags && (
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-lg">
                      {diagram.content.tags.general}
                    </span>
                    <span className="text-xs text-white bg-purple-500 px-2 py-1 rounded-lg">
                      {diagram.content.tags.specific}
                    </span>
                  </div>
                  <h1 className="font-semibold text-white mt-4 text-2xl mb-2 bg-black p-2 rounded-lg">
                    {diagram.content.title}
                  </h1>
                  <p className="text-sm text-white font-light">
                    {diagram.content.userPrompt}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="w-full p-4 bg-zinc-100 rounded-lg flex flex-col items-center justify-center mt-2 h-full">
        <div className="grid grid-cols-2 gap-4">
          {diagram.content.elements && diagram.content.elements.map((element: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="text-md font-semibold">{element.ElementName}</h3>
              {element.Illustration && (
                <img src={element.Illustration} alt={element.ElementName} className="mb-2" />
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

      <div className="w-full p-4">
        <h3 className="text-lg font-semibold">
          {t('discover.comments')} ({comments.length})
        </h3>
        <div className="space-y-2">
          {comments.map((comment: any, index: number) => (
            <div key={index} className="p-2 border rounded-lg flex items-start space-x-2">
              {comment.user.image ? (
                <img src={comment.user.image} alt={comment.user.name || 'Unknown'} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">{comment.user.name ? comment.user.name.charAt(0) : '?'}</span>
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-md font-semibold">{comment.user.name || 'Unknown User'}</h4>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-gray-400"></p>
                </div>
                <p className="text-sm text-gray-800">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
        <CommentForm diagramID={diagram.id} onCommentAdded={handleCommentAdded} />
      </div>
    </Card >
  );
};

export default PublishedCard;
