import { FileDown } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { Button } from "./button";

interface DownloadButtonProps {
  targetId: string;
  fileName: string;
}

export function DownloadButton({ targetId, fileName }: DownloadButtonProps) {
  const handleDownload = async () => {
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
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.png`;
            a.click();
            URL.revokeObjectURL(url);
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
    <Button variant="default" size="icon" onClick={handleDownload} className="download-button button-icon hover:bg-black-500">
      <FileDown className="h-4 w-4 text-white" />
    </Button>
  );
}
