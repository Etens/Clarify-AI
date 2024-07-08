import { FileDown } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { Button } from "./button";

interface DownloadButtonProps {
  diagramID: string;
  fileName: string;
}

export function DownloadButton({ diagramID, fileName }: DownloadButtonProps) {
  const handleDownload = async () => {
    console.log('📦 DownloadButtonProps:', { diagramID, fileName });
    const element = document.getElementById(diagramID);
    if (element) {
      console.log(`Element with ID ${diagramID} found.`);
      const originalStyle = element.style.cssText;
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
        const blob = await htmlToImage.toBlob(element, { quality: 1, pixelRatio: 2 });
        console.log('Blob généré:', blob);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.png`;
          a.click();
          URL.revokeObjectURL(url);
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
    <Button variant="default" size="icon" onClick={handleDownload} className="download-button button-icon hover:bg-gray-700">
      <FileDown className="h-4 w-4 text-white" />
    </Button>
  );
}
