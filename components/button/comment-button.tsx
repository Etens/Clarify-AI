import React, { useState } from 'react';
import { Button } from './button';
import axios from 'axios';

interface CommentFormProps {
    diagramID: string;
    onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ diagramID, onCommentAdded }) => {
    const [comment, setComment] = useState('');

    const handleCommentSubmit = async () => {
        try {
            console.log('💬 Adding new comment to diagram with ID:', diagramID);
            await axios.post(`/api/diagrams/comments?id=${diagramID}`, {
                content: comment,
            });
            setComment('');
            onCommentAdded();
            console.log('✅ Comment added successfully');
        } catch (error) {
            console.error('❌ Error adding comment:', error);
        }
    };

    return (
        <div className="flex mt-4">
            <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment"
                className="w-full p-2 border rounded-lg mr-2"
            />
            <Button onClick={handleCommentSubmit} variant="secondary">Comment</Button>
        </div>
    );
};

export default CommentForm;
