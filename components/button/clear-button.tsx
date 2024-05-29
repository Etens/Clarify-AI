import { Button } from "./button";
import { Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface ClearAllButtonProps {
  setDiagramHistory: (history: any[]) => void;
}

export function ClearAllButton({ setDiagramHistory }: ClearAllButtonProps) {
  const { data: session, update } = useSession();

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to delete all diagrams from the history?")) {
      setDiagramHistory([]);
      await saveDiagrams([]);
      update({
        ...session,
        trigger: "update",
        user: {
          ...(session?.user ?? {}),
          diagrams: [],
        },
      });
    }
  };

  const saveDiagrams = async (diagrams: any[]) => {
    try {
      const response = await axios.post('/api/auth/diagrams', { diagrams });
      if (response.status === 200) {
        console.log("Diagrams cleared successfully");
      } else {
        console.error("Failed to clear diagrams");
      }
    } catch (error) {
      console.error('An error occurred while clearing diagrams:', error);
    }
  };

  return (
    <Button variant="destructive" size="icon" onClick={handleClearHistory} className="hover:bg-red-900">
      <Trash2 className="h-4 w-10 text-white" />
    </Button>
  );
}

export default ClearAllButton;
