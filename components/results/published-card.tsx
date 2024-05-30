import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/results/card';
import { CopyButton } from '../button/copy-button';
import { DownloadButton } from '../button/download-button';

interface PublishedCardProps {
  diagram: any;
}

const PublishedCard = ({ diagram }: PublishedCardProps) => {
  console.log("🔍 Diagram data in PublishedCard:", diagram);

  return (
    <Card className="flex flex-col items-center bg-white p-4 rounded-lg shadow-lg scale-75">
      <CardHeader className="flex justify-between items-center w-full p-4 rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="flex w-full h-full items-center justify-between">
          <div className="flex flex-col space-y-2 items-center justify-center ml-9">
            {diagram.userImage ? (
              <img src={diagram.userImage} alt={diagram.userName} className="w-32 h-32 rounded-full" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl text-gray-500">{diagram.userName.charAt(0)}</span>
              </div>
            )}
            <h1 className='text-lg font-semibold text-white'>{diagram.userName}</h1>
          </div>
          <div className="flex flex-col w-3/4 justify-center items-start h-full space-y-4">
            <h1 className="text-xl font-semibold text-white">
              {diagram.title}
            </h1>
            <p className="text-sm text-white font-light w-3/4">
              {diagram.userPrompt}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="w-full p-4 bg-zinc-100 rounded-lg flex flex-col items-center justify-center scale-95 mt-2 h-full">
        <div className="grid grid-cols-2 gap-4">
          {diagram.elements.map((element: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="text-md font-semibold">{element.ElementName}</h3>
              {diagram.illustrationLinks[element.ElementName] && (
                <img src={diagram.illustrationLinks[element.ElementName]} alt={element.ElementName} className="mb-2" />
              )}
              <p className="text-sm text-gray-600">{element.Explanation}</p>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between w-full p-4 rounded-b-lg mt-2">
        <div className="flex items-center space-x-6">
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
