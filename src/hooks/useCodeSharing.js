import { useState } from 'react';

export const useCodeSharing = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleShare = async (editorRef, svgRef, language = 'javascript') => {
    if (!editorRef.current || !svgRef.current) return;
    
    const code = editorRef.current.getValue();
    const fileName = `code-snippet.${language}`;
    
    try {
      // Convert SVG to image
      const svgElement = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set canvas size to match SVG dimensions
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;
      
      // Create a promise to handle image loading
      const imgLoadPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      await imgLoadPromise;
      
      // Draw the image on canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      // Create share text
      const shareText = `Check out this code snippet and visualization (${language.toUpperCase()}):\n\n${code}`;
      
      // Try Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Shared Code and Visualization",
            text: shareText,
            files: [new File([blob], 'visualization.png', { type: 'image/png' })]
          });
          showToast('Code and visualization shared successfully!', 'success');
          return;
        } catch (shareError) {
          console.log('Web Share API failed, falling back to clipboard:', shareError);
        }
      }

      // Try clipboard API silently
      try {
        await navigator.clipboard.writeText(shareText);
      } catch (clipboardError) {
        console.log('Clipboard API failed, falling back to download:', clipboardError);
        
        // Fallback to download both files
        const codeFile = new Blob([code], { type: "text/plain" });
        const codeLink = document.createElement("a");
        codeLink.href = URL.createObjectURL(codeFile);
        codeLink.download = fileName;
        document.body.appendChild(codeLink);
        codeLink.click();
        document.body.removeChild(codeLink);
        
        const imageLink = document.createElement("a");
        imageLink.href = URL.createObjectURL(blob);
        imageLink.download = 'visualization.png';
        document.body.appendChild(imageLink);
        imageLink.click();
        document.body.removeChild(imageLink);
        
        showToast('Code and visualization downloaded as files!', 'success');
      }
    } catch (error) {
      console.error("Error sharing code and visualization:", error);
      showToast('Failed to share code and visualization. Please try again.', 'error');
    }
  };

  return {
    toast,
    handleShare
  };
}; 