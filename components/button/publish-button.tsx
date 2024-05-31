import { Button } from "./button";
import { CircleArrowUp } from 'lucide-react';
import axios from 'axios';

interface PublishButtonProps {
  diagramID: string;
}

export function PublishButton({ diagramID }: PublishButtonProps) {
  const handlePublishDiagram = async () => {
    try {
      console.log("Publishing diagram with ID:", diagramID);
      await axios.patch(`/api/diagrams?id=${diagramID}&isPublished=true`);
      console.log("Diagram published successfully");
    } catch (error) {
      console.error('An error occurred while publishing diagram:', error);
    }
  };

  return (
    <Button variant="default" size="icon" onClick={handlePublishDiagram} className="publish-button hover:bg-green-500">
      <CircleArrowUp className="h-4 w-4 text-white" />
    </Button>
  );
}

export default PublishButton;
