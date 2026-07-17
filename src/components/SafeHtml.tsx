import React, { useRef, useEffect } from 'react';

export function SafeHtml({ html, className, interactive = true }: { html: string, className?: string, interactive?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Get all styles from the parent document to apply them to the iframe
    const stylesheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\n');

    const srcDocContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <base target="_parent">
          ${stylesheets}
          <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
          <style>
            body { 
              background: transparent !important; 
              margin: 0; 
              padding: 0; 
              overflow: hidden; /* Prevent scrollbars inside iframe */
            }
            #content {
              display: block;
              overflow-x: hidden;
            }
          </style>
        </head>
        <body>
          <div id="content" class="${className || ''}">${html || ''}</div>
          <script>
            function updateHeight() {
              const el = document.getElementById('content');
              if (el && window.frameElement) {
                window.frameElement.style.height = el.scrollHeight + 'px';
              }
            }
            window.onload = updateHeight;
            const resizeObserver = new ResizeObserver(updateHeight);
            resizeObserver.observe(document.body);
            
            // Also update height when images load
            const images = document.querySelectorAll('img');
            images.forEach(img => {
              img.addEventListener('load', updateHeight);
            });
            setTimeout(updateHeight, 50);
            setTimeout(updateHeight, 500);
            setTimeout(updateHeight, 2000);
          </script>
        </body>
      </html>
    `;
    
    // Assigning to srcdoc to safely render the HTML within the same origin restrictions
    iframe.srcdoc = srcDocContent;

  }, [html, className]);

  return (
    <iframe
      ref={iframeRef}
      style={{ 
        width: '100%', 
        border: 'none', 
        display: 'block', 
        transition: 'height 0.2s ease', 
        minHeight: '20px',
        pointerEvents: interactive ? 'auto' : 'none'
      }}
      scrolling="no"
      title="Content"
      sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
    />
  );
}
