import { Button } from "./button";
import { CircleArrowUp } from 'lucide-react';
import axios from 'axios';

interface PublishButtonProps {
  diagramID: string;
}

export function PublishButton({ diagramID }: PublishButtonProps) {

  const handlePublishDiagram = async () => {
    try {
      console.log('📤 Publishing diagram:', diagramID);
      const response = await axios.patch(`/api/diagrams/published?diagramID=${diagramID}`);
      console.log('✅ Diagram published:', response.data);
    } catch (error: any) {
      console.error('❌ Error publishing diagram:', error.message);
    }
  };

  return (
    <Button variant="default" size="icon" onClick={handlePublishDiagram} className="publish-button hover:bg-green-500">
      <CircleArrowUp className="h-4 w-4 text-white" />
    </Button>
  );
}

export default PublishButton;
