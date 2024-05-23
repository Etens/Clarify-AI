import { Button } from "./button";
import { Trash2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface DeleteButtonProps {
  diagramHistory: any[];
  setDiagramHistory: (history: any[]) => void;
  index: number;
}

export function DeleteButton({ diagramHistory, setDiagramHistory, index }: DeleteButtonProps) {
  const handleDeleteDiagram = () => {
    const updatedHistory = diagramHistory.filter((_, i) => i !== index);
    setDiagramHistory(updatedHistory);
    Cookies.set('diagramHistory', JSON.stringify(updatedHistory));
  };

  return (
    <Button variant="default" size="icon" onClick={handleDeleteDiagram} className="delete-button hover:bg-red-500">
      <Trash2 className="h-4 w-4 text-white" />
    </Button>
  );
}

export default DeleteButton;
