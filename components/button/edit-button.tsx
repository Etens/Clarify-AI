import { Edit, X } from 'lucide-react';
import { Button } from './button';
import React, { useState } from 'react';
import axios from 'axios';
import { Diagram } from 'next-auth';

interface EditButtonProps {
    diagramID: string;
    diagramData: Diagram;
    onSave: (updatedDiagram: Diagram) => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ diagramID, diagramData, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedDiagram, setEditedDiagram] = useState(diagramData);

    const handleEdit = async () => {
        setIsEditing(true);
        try {
            console.log('Saving edited diagram with ID:', diagramID);
            const response = await axios.patch(`/api/diagrams?id=${diagramID}`, editedDiagram);
            if (response.status === 200) {
                console.log('Diagram saved successfully');
                onSave(response.data);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving edited diagram:', error);
        }
    }

    const handleCancel = () => {
        setEditedDiagram(diagramData);
        setIsEditing(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setEditedDiagram((prevDiagram) => ({ ...prevDiagram, [name]: value }));
    };

    return (
        <div className="flex items-center space-x-4">
            {isEditing ? (
                <>
                    <input
                        type="text"
                        name="title"
                        value={editedDiagram.title}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md px-2 py-1"
                    />
                    <Button onClick={handleCancel}>
                        <X size={16} />
                    </Button>
                </>
            ) : (
                <>
                    <Button onClick={handleEdit}>
                        <Edit size={16} />
                    </Button>
                </>
            )}
        </div>
    );
};