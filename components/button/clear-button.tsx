import { Button } from "./button";
import { Trash2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface ClearAllButtonProps {
  setDiagramHistory: (history: any[]) => void;
}

export function ClearAllButton({ setDiagramHistory }: ClearAllButtonProps) {
  const handleClearHistory = () => {
    if (confirm("Are you sure you want to delete all diagrams from the history?")) {
      setDiagramHistory([]);
      Cookies.remove('diagramHistory');
    }
  };

  return (
    <Button variant="default" size="icon" onClick={handleClearHistory} className="hover:bg-red-500">
      <Trash2 className="h-4 w-4 text-white" />
    </Button>
  );
}

export default ClearAllButton;
