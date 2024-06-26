import { CopyButton } from '../button/copy-button';
import { DownloadButton } from '../button/download-button';
import DeleteButton from '../button/delete-button';
import { PublishButton } from '../button/publish-button';

interface ElementData {
  ElementName: string;
  Illustration: string;
  Explanation: string;
}

interface ResultViewProps {
  id: string;
  elements: ElementData[];
  userPrompt?: string;
  diagrams?: any[];
  setDiagrams?: (history: any[]) => void;
  index?: number;
}

const ResultView = ({ id, elements, userPrompt }: ResultViewProps) => {
  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-lg relative scale-75">
      <div id={id} className='w-full p-4 rounded-lg'>
        <div className="flex justify-end absolute top-2 right-2 space-x-2">
          <CopyButton targetId={id} />
          <DownloadButton targetId={id} fileName={userPrompt || 'diagram'} />
          <DeleteButton diagramID={id} />
          <PublishButton diagramID={id} />
        </div>
        {userPrompt && (
          <h2 className="text-lg font-semibold mb-4 user-prompt">{userPrompt}</h2>
        )}
        <div className="grid grid-cols-2 gap-4">
          {elements.map((element, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="text-md font-semibold">{element.ElementName}</h3>
              {element.Illustration && (
                <img src={element.Illustration} alt={element.ElementName} className="mb-2" />
              )}
              <p className="text-sm text-gray-600">{element.Explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default ResultView;
