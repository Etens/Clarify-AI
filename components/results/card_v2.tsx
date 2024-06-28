import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Card = {
    id: string;
    name: string;
    content: React.ReactNode;
    buttons: React.ReactNode;
};

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

    useEffect(() => {
        setCards(items);
    }, [items]);

    const handleCardClick = (index: number) => {
        setCards((prevCards: Card[]) => {
            const newArray = [...prevCards];
            const [removedCard] = newArray.splice(index, 1);
            newArray.push(removedCard);
            return newArray;
        });
    };

    return (
        <div className="relative w-[60rem] h-full flex items-center justify-center scale-[0.8]">
            {cards.map((card, index) => {
                if (!card) {
                    console.error(`Card at index ${index} is undefined`);
                    return null;
                }
                if (!card.id) {
                    console.error(`Card at index ${index} has missing id:`, card);
                    return null;
                }
                if (!card.name) {
                    console.error(`Card at index ${index} has missing name:`, card);
                    return null;
                }
                if (!card.content) {
                    console.error(`Card at index ${index} has missing content:`, card);
                    return null;
                }
                if (!card.buttons) {
                    console.error(`Card at index ${index} has missing buttons:`, card);
                    return null;
                }

                return (
                    <motion.div
                        key={card.id}
                        className="absolute bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-xl border-2 border-gray-200 border-solid flex flex-col justify-between cursor-pointer overflow-hidden"
                        style={{ transformOrigin: "top center", paddingBottom: "5rem" }}  // Ajout de padding pour éviter le chevauchement
                        animate={{
                            top: index * -CARD_OFFSET,
                            scale: 1 - index * SCALE_FACTOR,
                            zIndex: cards.length - index,
                        }}
                        onClick={() => handleCardClick(index)} // Ajout du gestionnaire de clic
                    >
                        <div className="p-5 text-center">
                            <p className="text-neutral-500 font-medium dark:text-white">
                                {card.name}
                            </p>
                        </div>
                        <div className="font-normal text-neutral-700 dark:text-neutral-200 overflow-hidden text-ellipsis flex flex-wrap justify-between">
                            {card.content}
                        </div>
                        <div
                            className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t-gray-200 border-solid"
                            onClick={(e) => e.stopPropagation()} // Empêche la propagation du clic
                        >
                            {card.buttons}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
