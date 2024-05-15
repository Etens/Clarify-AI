import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/results/illustration-card";

interface ElementData {
  ElementName: string;
  Keywords: string;
  Explanation: string;
  ImageURL?: string;
}

interface ResultViewProps {
  elements: ElementData[];
  illustrationLinks: { [key: string]: string };
}

function ResultView({ elements, illustrationLinks }: ResultViewProps) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div
        className="relative p-10 bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{ transform: 'scale(0.8)' }}
      >
        <div className="grid grid-cols-2 gap-4 items-start justify-center">
          {elements.map((element, index) => (
            <Card key={index} className="w-full h-64 overflow-hidden">
              <CardHeader>
                <CardTitle>{element.ElementName}</CardTitle>
              </CardHeader>
              <CardContent>
                {illustrationLinks[element.ElementName] && (
                  <img
                    src={illustrationLinks[element.ElementName]}
                    alt={element.ElementName}
                    className="mb-2 h-20 w-full object-cover"
                  />
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
