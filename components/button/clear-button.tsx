import { Button } from "./button";
import { Trash } from 'lucide-react';
import axios from 'axios';

interface ClearButtonProps {
  setDiagrams: (diagrams: any[]) => void;
}

export function ClearButton({ setDiagrams }: ClearButtonProps) {
  const handleClearDiagrams = async () => {
    if (confirm("Are you sure you want to delete all diagrams? This action cannot be undone.")) {
      try {
        console.log("Clearing all diagrams");
        await axios.delete('/api/diagrams');
        setDiagrams([]);
        console.log("All diagrams deleted successfully");
      } catch (error) {
        console.error('An error occurred while deleting all diagrams:', error);
      }
    }
  };

  return (
    <Button variant="default" size="icon" onClick={handleClearDiagrams} className="clear-button hover:bg-red-500">
      <Trash className="h-4 w-4 text-white" />
    </Button>
  );
}

export default ClearButton;
