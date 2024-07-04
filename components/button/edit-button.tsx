import { Edit, Check, X, FileDown } from 'lucide-react';
import { Button } from './button';
import React from 'react';
import axios from 'axios';
import { Card } from 'next-auth';

interface EditButtonProps {
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    diagramData: Card;
    onSave: (updatedCard: Card) => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ isEditing, setIsEditing, diagramData, onSave }) => {
    const handleSave = async () => {
        try {
            console.log('🔄 Updating diagram...', diagramData);
            const response = await axios.patch('/api/diagrams', {
                id: diagramData.id,
                title: diagramData.title,
                elements: diagramData.elements,
            });
            console.log('✅ Diagram updated successfully:', response.data);
            onSave(diagramData);
            setIsEditing(false);
        } catch (error) {
            console.error('❌ Error updating diagram:', error);
        }
    };

    return (
        <>
            <Button
                variant="default"
                size="icon"
                className="copy-button button-icon hover:bg-gray-700"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                {isEditing ? <Check className="h-4 w-4 text-white" /> : <Edit className="h-4 w-4 text-white" />}
            </Button>
            {isEditing && (
                <Button
                    variant="default"
                    size="icon"
                    className="copy-button button-icon hover:bg-gray-700"
                    onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 text-white" />
                </Button>
            )}
        </>
    );
};
