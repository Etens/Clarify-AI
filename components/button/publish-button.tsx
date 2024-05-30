import { Upload } from 'lucide-react';
import { Button } from "./button";
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { nanoid } from 'nanoid';

interface PublishButtonProps {
  diagramIndex: number; 
}

export function PublishButton({ diagramIndex }: PublishButtonProps) {
  const { data: session, update } = useSession();

  const handlePublish = async () => {
    if (!session) {
      console.error('User not authenticated');
      return;
    }

    const diagram = session.user?.diagrams?.[diagramIndex];
    if (!diagram) {
      console.error('Diagram not found');
      return;
    }

    const userPrompt = diagram.userPrompt || ""; 

    try {
      const newDiagram = {
        ...diagram,
        userName: session.user?.name,
        userEmail: session.user?.email,
        userImage: session.user?.image, 
        userPrompt, 
        id: nanoid(), 
      };

      const updatedDiagramsPublished = [...(session.user?.diagramsPublished || []), newDiagram];

      const response = await axios.post('/api/auth/diagrams/publish', {
        diagramsPublished: updatedDiagramsPublished,
      });

      if (response.status === 200) {
        console.log("📤 Diagram published successfully:", response.data);
        const updatedUser = response.data;

        await update({
          ...session,
          trigger: "update",
          user: {
            ...session.user,
            diagramsPublished: updatedUser.diagramsPublished,
          },
        });
      }
    } catch (error) {
      console.error('Error publishing diagram:', error);
    }
  };

  return (
    <Button variant="default" size="icon" onClick={handlePublish} className="publish-button hover:bg-blue-500">
      <Upload className="h-4 w-4 text-white" />
    </Button>
  );
}
