import { Copy } from "lucide-react";
import { Button } from "./button";
import * as htmlToImage from 'html-to-image';

export function CopyButton({ targetId }: { targetId: string }) {
  const handleCopy = async () => {
    const element = document.getElementById(targetId);
    if (element) {
      const originalStyle = element.style.cssText;
      
      element.style.width = '800px';
      element.style.height = 'auto';
      element.style.transform = 'scale(1)';
      element.style.transformOrigin = 'top left';

      const promptElement = element.querySelector('.user-prompt') as HTMLElement;
      if (promptElement) promptElement.style.display = 'none';

      const buttonElements = element.querySelectorAll('.copy-button, .download-button, .delete-button, .publish-button') as NodeListOf<HTMLElement>;
      buttonElements.forEach(button => button.style.display = 'none');

      element.style.backgroundColor = 'white';

      htmlToImage.toBlob(element)
        .then((blob) => {
          console.log('Blob généré:', blob); 
          if (blob) {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]);
          }

          if (promptElement) promptElement.style.display = 'block';
          buttonElements.forEach(button => button.style.display = 'flex');

          element.style.cssText = originalStyle;
        })
        .catch((error) => {
          console.error('Erreur lors de la génération du blob:', error);

          if (promptElement) promptElement.style.display = 'block';
          buttonElements.forEach(button => button.style.display = 'flex');

          element.style.cssText = originalStyle;
        });
    }
  };

  return (
    <Button variant="default" size="icon" onClick={handleCopy} className="copy-button button-icon hover:bg-black-500">
      <Copy className="h-4 w-4 text-white" />
    </Button>
  );
}
