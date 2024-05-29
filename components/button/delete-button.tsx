import { Button } from "./button";
import { Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface DeleteButtonProps {
  diagramHistory: any[];
  setDiagramHistory: (history: any[]) => void;
  index: number;
}

export function DeleteButton({ diagramHistory, setDiagramHistory, index }: DeleteButtonProps) {
  const { data: session, update } = useSession();

  const handleDeleteDiagram = async () => {
    const updatedHistory = diagramHistory.filter((_, i) => i !== index);
    setDiagramHistory(updatedHistory);
    await saveDiagrams(updatedHistory);

    update({
      ...session,
      trigger: "update",
      user: {
        ...(session?.user ?? {}),
        diagrams: updatedHistory,
      },
    });
  };

  const saveDiagrams = async (diagrams: any[]) => {
    try {
      const response = await axios.post('/api/auth/diagrams', { diagrams });
      if (response.status === 200) {
        console.log("Diagrams updated successfully");
      } else {
        console.error("Failed to update diagrams");
      }
    } catch (error) {
      console.error('An error occurred while updating diagrams:', error);
    }
  };

  return (
    <Button variant="default" size="icon" onClick={handleDeleteDiagram} className="delete-button hover:bg-red-500">
      <Trash2 className="h-4 w-4 text-white" />
    </Button>
  );
}

export default DeleteButton;
