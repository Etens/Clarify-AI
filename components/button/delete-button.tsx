import { Button } from "./button";
import { Trash2 } from 'lucide-react';
import axios from 'axios';

interface DeleteButtonProps {
  diagramID: string;
}

export function DeleteButton({ diagramID }: DeleteButtonProps) {

  const handleDeleteDiagram = async () => {
    if (confirm("Are you sure you want to delete this diagram? This action cannot be undone.")) {
      try {
        console.log("Deleting diagram with ID:", diagramID);
        await axios.delete(`/api/diagrams?id=${diagramID}`);
        console.log("Diagram deleted successfully");
        window.location.reload();
      } catch (error) {
        console.error('An error occurred while deleting diagram:', error);
      }
    }
  };

  return (
    <Button variant="default" size="icon" onClick={handleDeleteDiagram} className="delete-button hover:bg-red-500">
      <Trash2 className="h-4 w-4 text-white" />
    </Button>
  );
}

export default DeleteButton;
