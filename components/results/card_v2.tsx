'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Card = {
    id: string;
    name: string;
    content: React.ReactNode;
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

    // Suppression de l'intervalle de défilement automatique
    useEffect(() => {
        setCards(items);
    }, [items]);

    // Gestionnaire de clic pour faire défiler les cartes
    const handleCardClick = (index: number) => {
        setCards((prevCards: Card[]) => {
            const newArray = [...prevCards];
            const [removedCard] = newArray.splice(index, 1); // Supprime la carte cliquée
            newArray.push(removedCard); // Ajoute la carte cliquée à la fin du tableau
            return newArray;
        });
    };

    return (
        <div className="relative w-96 md:h-112 md:w-[28rem] border-red-800"> {/* Taille fixe de la carte */}
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

                return (
                    <motion.div
                        key={card.id}
                        className="absolute bg-white dark:bg-gray-800 h-96 w-96 md:h-112 md:w-[28rem] rounded-3xl p-4 shadow-xl border border-red-500 flex flex-col justify-between cursor-pointer overflow-hidden"
                        style={{ transformOrigin: "top center" }}
                        animate={{
                            top: index * -CARD_OFFSET,
                            scale: 1 - index * SCALE_FACTOR,
                            zIndex: cards.length - index,
                        }}
                        onClick={() => handleCardClick(index)}
                    >
                        <div className="p-5 text-center">
                            <p className="text-neutral-500 font-medium dark:text-white mb-4">
                                {card.name}
                            </p>
                        </div>
                        <div className="font-normal text-neutral-700 dark:text-neutral-200 text-ellipsis flex flex-wrap justify-between">
                            {card.content}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

};
