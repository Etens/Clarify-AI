import { CopyButton } from '../button/copy-button';
import { DownloadButton } from '../button/download-button';
import DeleteButton from '../button/delete-button';
import { PublishButton } from '../button/publish-button';

interface ElementData {
  ElementName: string;
  Keywords: string;
  Explanation: string;
  ImageURL?: string;
}

interface ResultViewProps {
  id: string;
  elements: ElementData[];
  illustrationLinks: { [key: string]: string };
  userPrompt?: string;
  onDelete?: () => void;
  onCopy?: () => void;
  diagramHistory?: any[];
  setDiagramHistory?: (history: any[]) => void;
  index?: number;
}

const ResultView = ({ id, elements, illustrationLinks, userPrompt, onDelete, diagramHistory, setDiagramHistory, index }: ResultViewProps) => {
  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-lg relative scale-75">
      <div id={id} className='w-full p-4 rounded-lg'>
        <div className="flex justify-end absolute top-2 right-2 space-x-2">
          <CopyButton targetId={id} />
          <DownloadButton targetId={id} fileName={userPrompt || 'diagram'} />
          {onDelete && diagramHistory && setDiagramHistory !== undefined && index !== undefined && (
            <DeleteButton diagramHistory={diagramHistory} setDiagramHistory={setDiagramHistory} index={index} />
          )}
          {index !== undefined && (
            <PublishButton diagramIndex={index} />
          )}
        </div>
        {userPrompt && (
          <h2 className="text-lg font-semibold mb-4 user-prompt">{userPrompt}</h2>
        )}
        <div className="grid grid-cols-2 gap-4">
          {elements.map((element, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="text-md font-semibold">{element.ElementName}</h3>
              {illustrationLinks[element.ElementName] && (
                <img src={illustrationLinks[element.ElementName]} alt={element.ElementName} className="mb-2" />
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
