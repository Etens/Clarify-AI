import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/results/illustration-card";

interface ElementData {
  ElementName: string;
  Keywords: string;
  Explanation: string;
  ImageURL?: string;
}

interface ResultViewProps {
  userPrompt: string;
  elements: ElementData[];
  illustrationLinks: { [key: string]: string };
}

function ResultView({ userPrompt, elements, illustrationLinks }: ResultViewProps) {
  return (
    <div className="flex justify-center items-center">
      <div className="relative p-3 bg-white shadow-2xl rounded-lg overflow-hidden" style={{ transform: 'scale(0.8)' }}>
        <div className="grid grid-cols-2 gap-4 items-start justify-center mb-6">
          <Card className="col-span-2 w-full overflow-hidden">
            <CardHeader>
              <CardTitle>User Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400 font-light mb-2">
                {userPrompt}
              </CardDescription>
            </CardContent>
          </Card>
          {elements.map((element, index) => (
            <Card key={index} className="w-full h-64 overflow-hidden">
              <CardHeader>
                <CardTitle>{element.ElementName}</CardTitle>
              </CardHeader>
              <CardContent>
                {illustrationLinks[element.ElementName] && (
                  <img src={illustrationLinks[element.ElementName]} alt={element.ElementName} className="mb-2 h-20 w-full object-cover" />
                )}
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400 font-light mb-2 overflow-hidden text-ellipsis">
                  {element.Explanation}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResultView;
