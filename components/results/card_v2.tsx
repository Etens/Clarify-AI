import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EditButton } from '../button/edit-button';
import { CopyButton } from '../button/copy-button';
import { DownloadButton } from '../button/download-button';
import DeleteButton from '../button/delete-button';
import { PublishButton } from '../button/publish-button';
import { Card, ElementData } from 'next-auth';

export const CardStack = ({
    items,
    offset,
    scaleFactor,
}: {
    items: Card[];
    offset?: number;
    scaleFactor?: number;
}) => {
    const CARD_OFFSET = offset || 10;
    const SCALE_FACTOR = scaleFactor || 0.06;
    const [cards, setCards] = useState<Card[]>(items);
    const [editingCard, setEditingCard] = useState<Card | null>(null);

    useEffect(() => {
        setCards(items);
    }, [items]);

    const handleCardClick = (index: number) => {
        if (editingCard) return;  // Désactiver le changement de carte en mode édition
        setCards((prevCards: Card[]) => {
            const newArray = [...prevCards];
            const [removedCard] = newArray.splice(index, 1);
            newArray.push(removedCard);
            return newArray;
        });
    };

    const handleSave = (updatedCard: Card) => {
        setCards((prevCards: Card[]) => {
            const index = prevCards.findIndex((card) => card.id === updatedCard.id);
            const newArray = [...prevCards];
            newArray[index] = updatedCard;
            return newArray;
        });
        setEditingCard(null);
        console.log('Diagram updated locally');
    };

    return (
        <div className="relative w-[60rem] h-full flex items-center justify-center scale-[0.8]">
            {cards.map((card, index) => {
                const isEditing = editingCard?.id === card.id;

                return (
                    <motion.div
                        id={`diagram-${card.id}`}
                        key={card.id}
                        className={`absolute bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-xl border-2 ${isEditing ? 'border-blue-500' : 'border-gray-200'} border-solid flex flex-col justify-between cursor-pointer overflow-hidden`}
                        style={{ transformOrigin: "top center", paddingBottom: "5rem" }}
                        animate={{
                            top: index * -CARD_OFFSET,
                            scale: 1 - index * SCALE_FACTOR,
                            zIndex: cards.length - index,
                        }}
                        onClick={() => handleCardClick(index)}
                    >
                        <div className="p-5 text-center">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={editingCard?.title || ""}
                                        onChange={(e) => setEditingCard({ ...editingCard!, title: e.target.value })}
                                        className="element-name text-sm font-bold mb-1 text-center w-full bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                                    />
                                    <div className="flex flex-wrap text-black">
                                        {editingCard?.elements.map((element, elementIndex) => (
                                            <div key={element.ElementName} className="w-1/2 p-2">
                                                <input
                                                    type="text"
                                                    value={element.ElementName}
                                                    onChange={(e) => {
                                                        const newArray = [...editingCard!.elements];
                                                        newArray[elementIndex].ElementName = e.target.value;
                                                        setEditingCard({ ...editingCard!, elements: newArray });
                                                    }}
                                                    className="element-name text-sm font-bold mb-1 text-center w-full bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                                                />
                                                <img
                                                    src={element.Illustration}
                                                    alt={element.ElementName}
                                                    className="element-illustration w-full h-56 object-contain rounded-md mb-1 p-2"
                                                />
                                                <textarea
                                                    value={element.Explanation}
                                                    onChange={(e) => {
                                                        const newArray = [...editingCard!.elements];
                                                        newArray[elementIndex].Explanation = e.target.value;
                                                        setEditingCard({ ...editingCard!, elements: newArray });
                                                    }}
                                                    className="element-explanation text-xs text-center w-full bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div
                                        className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t-gray-200 border-solid flex justify-center align-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="card-buttons flex justify-center items-center space-x-4 cursor-default">
                                            <EditButton
                                                isEditing={isEditing}
                                                setIsEditing={(isEditing) => {
                                                    if (!isEditing) {
                                                        setEditingCard(null);
                                                    } else {
                                                        setEditingCard(card);
                                                    }
                                                }}
                                                diagramData={editingCard || card}
                                                onSave={handleSave}
                                            />
                                        </div>
                                    </div>
                                </>

                            ) : (
                                <>
                                    <h1 className="text-neutral-500 font-medium dark:text-white text-lg mb-8">
                                        {card.title || "Title not available"}
                                    </h1>
                                    <div className="flex flex-wrap text-black">
                                        {card.elements.map((element) => (
                                            <div key={element.ElementName} className="w-1/2 p-2">
                                                <h3 className="element-name text-sm font-bold mb-1 text-center text-neutral-500 dark:text-white">
                                                    {element.ElementName || "Element name not available"}
                                                </h3>
                                                <img className="element-illustration w-full h-56 object-contain rounded-md mb-1 p-2" src={element.Illustration || ""} alt={element.ElementName} />
                                                <p className="element-explanation text-xs text-center text-neutral-500 dark:text-white">{element.Explanation || "Explanation not available"}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div
                                        className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t-gray-200 border-solid flex justify-center items-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="card-buttons flex justify-center items-center space-x-4 cursor-default">
                                            <EditButton
                                                isEditing={isEditing}
                                                setIsEditing={(isEditing) => {
                                                    if (!isEditing) {
                                                        setEditingCard(null);
                                                    } else {
                                                        setEditingCard(card);
                                                    }
                                                }}
                                                diagramData={editingCard || card}
                                                onSave={handleSave}
                                            />
                                            {isEditing ? null : (
                                                <>
                                                    <CopyButton diagramID={`diagram-${card.id}`} />
                                                    <PublishButton diagramID={card.id} />
                                                    <DownloadButton diagramID={`diagram-${card.id}`} fileName={`${card.title}.json`} />
                                                    <DeleteButton diagramID={card.id} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
