import { Copy } from "lucide-react";
import { Button } from "./button";
import * as htmlToImage from 'html-to-image';

export function CopyButton({ diagramID }: { diagramID: string }) {
  const handleCopy = async () => {
    console.log('📦 CopyButtonProps:', { diagramID });
    const element = document.getElementById(diagramID);
    if (element) {
      const originalStyle = element.style.cssText;

      // Ajuster la taille de l'élément pour garantir qu'il est entièrement visible
      element.style.width = 'auto';
      element.style.height = 'auto';
      element.style.transform = 'scale(1)';
      element.style.transformOrigin = 'top left';

      const promptElement = element.querySelector('.user-prompt') as HTMLElement;
      if (promptElement) promptElement.style.display = 'none';

      const buttonElements = element.querySelectorAll('.copy-button, .download-button, .delete-button, .publish-button') as NodeListOf<HTMLElement>;
      buttonElements.forEach(button => button.style.display = 'none');

      element.style.backgroundColor = 'white';

      try {
        // Augmenter la qualité de l'image
        const blob = await htmlToImage.toBlob(element, { quality: 1, pixelRatio: 2 });
        console.log('Blob généré:', blob);
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]);
        }
      } catch (error) {
        console.error('Erreur lors de la génération du blob:', error);
      } finally {
        if (promptElement) promptElement.style.display = 'block';
        buttonElements.forEach(button => button.style.display = 'flex');
        element.style.cssText = originalStyle;
      }
    } else {
      console.error(`Element with ID ${diagramID} not found.`);
    }
  };

  return (
    <Button variant="default" size="icon" onClick={handleCopy} className="copy-button button-icon hover:bg-gray-700">
      <Copy className="h-4 w-4 text-white" />
    </Button>
  );
}
