import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Plus, Minus, ZoomIn } from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import ScreenLayout from '../components/ScreenLayout';
import { MOCK_PRODUCTS, TRANSLATIONS } from '../constants';
import { useApp } from '../AppContext';
import Button from '../components/Button';

export default function BlueprintScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, addToCart } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const product = MOCK_PRODUCTS.find(p => p.id === id);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  if (!product) return <div>Product not found</div>;

  const handleZoom = (delta: number) => {
    setZoom(prev => {
      const next = Math.min(Math.max(prev + delta, 1), 4);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (zoom === 1) return;
    // Simple drag logic could be added here, but for now we focus on the visual zoom stability
  };

  const handleDownloadImage = async () => {
    try {
      const imageUrl = product.blueprintImage || "/blueprint_lounge_chair.jpg";
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const link = document.createElement('a');
        link.href = base64data;
        link.download = `Blueprint_Image_HS_${product.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Image download error:", error);
      // Last resort fallback
      const link = document.createElement('a');
      link.href = product.blueprintImage || "/blueprint_lounge_chair.jpg";
      link.target = "_blank";
      link.download = `Blueprint_Image_HS_${product.id}.jpg`;
      link.click();
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      
      const loadImageAsDataUrl = (url: string): Promise<string> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg"));
            } else {
              resolve("");
            }
          };
          img.onerror = () => resolve("");
          img.src = url;
        });
      };

      const originalImgData = await loadImageAsDataUrl(product.image);
      const blueprintImgData = await loadImageAsDataUrl(product.blueprintImage || "/blueprint_lounge_chair.jpg");

      // Header with "Blueprint" style
      doc.setFillColor(30, 58, 138); // blue-900
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text("HASTA-SHILPA: TECHNICAL BLUEPRINT", 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(`Product Code: HS-${product.id.padStart(4, '0')}`, 105, 30, { align: 'center' });
      
      // Border
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.rect(10, 10, 190, 277);
      
      // Original Product Image (Top)
      if (originalImgData) {
        try {
          doc.addImage(originalImgData, 'JPEG', 65, 45, 80, 60);
          doc.setDrawColor(229, 231, 235);
          doc.rect(65, 45, 80, 60); // Frame
        } catch (e) {
          console.error("Error adding original image to PDF", e);
        }
      }

      const startContentY = originalImgData ? 115 : 55;

      // Product Name
      doc.setFontSize(18);
      doc.setTextColor(30, 58, 138);
      doc.text(product.title[language] || product.title.en, 20, startContentY);
      
      // Horizontal Line
      doc.setDrawColor(229, 231, 235); // gray-200
      doc.line(20, startContentY + 5, 190, startContentY + 5);

      // Section 1: Specifications
      doc.setFontSize(14);
      doc.setTextColor(55, 65, 81); // gray-700
      doc.text("SPECIFICATIONS", 20, startContentY + 20);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Dimensions: ${product.measurements}`, 20, startContentY + 30);
      doc.text(`Estimated Time: ${product.timeRequired || 'N/A'}`, 20, startContentY + 37);
      
      // Section 2: Materials
      doc.setFontSize(14);
      doc.setTextColor(55, 65, 81);
      doc.text("MATERIALS REQUIRED", 20, startContentY + 55);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      product.materials.forEach((material, index) => {
        doc.text(`[ ] ${material}`, 25, startContentY + 65 + (index * 6));
      });
      
      // Section 3: Tools
      const toolsY = startContentY + 65 + (product.materials.length * 6) + 10;
      doc.setFontSize(14);
      doc.setTextColor(55, 65, 81);
      doc.text("TOOLS REQUIRED", 20, toolsY);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      product.tools.forEach((tool, index) => {
        doc.text(`- ${tool}`, 25, toolsY + 10 + (index * 6));
      });

      // Section 4: Procedures (Steps)
      let currentY = toolsY + 10 + (product.tools.length * 6) + 15;
      
      if (currentY > 230) {
        doc.addPage();
        doc.setDrawColor(30, 58, 138);
        doc.rect(10, 10, 190, 277);
        currentY = 30;
      }

      doc.setFontSize(14);
      doc.setTextColor(55, 65, 81);
      doc.text("CONSTRUCTION PROCEDURES", 20, currentY);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      currentY += 10;
      
      product.steps.forEach((step, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${step}`, 165);
        if (currentY + (lines.length * 5) > 275) {
          doc.addPage();
          currentY = 30;
          doc.setDrawColor(30, 58, 138);
          doc.rect(10, 10, 190, 277);
        }
        doc.text(lines, 20, currentY);
        currentY += (lines.length * 5) + 3;
      });

      // Add the Blueprint image on a new page
      doc.addPage();
      doc.setDrawColor(30, 58, 138);
      doc.rect(10, 10, 190, 277);
      
      doc.setFillColor(30, 58, 138);
      doc.rect(10, 10, 190, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("TECHNICAL DRAWING", 105, 23, { align: 'center' });
      
      if (blueprintImgData) {
        try {
          doc.addImage(blueprintImgData, 'JPEG', 20, 50, 170, 120);
        } catch (e) {
          console.error("Error adding blueprint image to PDF", e);
        }
      } else {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(12);
        doc.text("(Technical Diagram)", 105, 50, { align: 'center' });
      }
      
      // Grid lines
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      for(let i=20; i<=190; i+=10) doc.line(i, 50, i, 260); // vertical
      for(let i=50; i<=260; i+=10) doc.line(20, i, 190, i); // horizontal

      doc.setLineWidth(0.5);
      doc.setDrawColor(30, 58, 138);
      doc.text("NOTE: This document is for artisan training purposes.", 105, 275, { align: 'center' });

      // Robust save for mobile
      const fileName = `Blueprint_HS_${product.id}.pdf`;
      const blob = doc.output('blob');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const link = document.createElement('a');
        link.href = base64data;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mobile specific: if they are in a webview, sometimes window.location.href works better
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !base64data.includes('data:application/pdf')) {
           window.open(base64data, '_blank');
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("PDF Download error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ScreenLayout showNav={false} className="bg-white">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{product.title[language] || product.title.en}</h1>
      </div>

      <div className="relative aspect-[4/3] bg-[#f0f4f8] rounded-3xl overflow-hidden border border-blue-900/20 shadow-inner group">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{ 
            backgroundImage: 'radial-gradient(#1e3a8a 0.5px, transparent 0.5px), radial-gradient(#1e3a8a 0.5px, #f0f4f8 0.5px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />
        
        <motion.div 
          drag={zoom > 1}
          dragConstraints={{ left: -200 * zoom, right: 200 * zoom, top: -150 * zoom, bottom: 150 * zoom }}
          className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing relative z-10"
        >
          <motion.img 
            src={product.blueprintImage || "/blueprint_lounge_chair.jpg"} 
            alt="Technical Blueprint" 
            animate={{ scale: zoom }}
            className="max-w-[90%] max-h-[90%] object-contain drop-shadow-2xl"
            onError={(e) => {
              e.currentTarget.src = "/blueprint_lounge_chair.jpg";
            }}
          />
        </motion.div>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1.5 rounded-2xl shadow-2xl border border-blue-900/10 z-20">
          <button 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-bamboo-dark hover:bg-amber-50 hover:text-amber-600 transition-colors"
            onClick={() => handleZoom(-0.5)}
            title="Zoom Out"
          >
            <Minus size={20} />
          </button>
          <button 
            className="px-3 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-bamboo-dark hover:bg-amber-50 hover:text-amber-600 transition-colors min-w-[60px]"
            onClick={() => setZoom(1)}
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-bamboo-dark hover:bg-amber-50 hover:text-amber-600 transition-colors"
            onClick={() => handleZoom(0.5)}
            title="Zoom In"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
          <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
            <ZoomIn size={20} />
            {t.measurements}
          </h3>
          <p className="text-amber-800 text-lg font-medium">{product.measurements}</p>
        </div>

        {/* Materials Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-bamboo-gold/20 text-bamboo-dark rounded-lg flex items-center justify-center">
              <Plus size={18} />
            </span>
            {t.materials}
          </h3>
          <ul className="space-y-3">
            {product.materials.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-bamboo-gold mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tools Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Download size={18} className="rotate-180" />
            </span>
            {t.tools}
          </h3>
          <ul className="space-y-3">
            {product.tools.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Procedure Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-serif">
              !
            </span>
            {t.instructions}
          </h3>
          <div className="space-y-6">
            {product.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-bamboo-gold text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  {i < product.steps.length - 1 && (
                    <div className="w-0.5 h-full bg-bamboo-gold/20 my-1" />
                  )}
                </div>
                <p className="text-gray-600 pt-1 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button 
            variant="outline" 
            className="w-full gap-2 py-4 border-2 border-amber-700/20 text-amber-900 bg-amber-50/50" 
            onClick={handleDownloadImage}
          >
            <Download size={18} />
            Image
          </Button>
          <Button 
            variant="outline" 
            className="w-full gap-2 py-4 border-2 border-blue-900/20 text-blue-900 bg-blue-50/50" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
               <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
            ) : (
               <Download size={18} />
            )}
            PDF Docs
          </Button>
        </div>
        <Button 
          className="w-full py-4 text-lg bg-bamboo-rich"
          onClick={() => {
              addToCart(product);
              navigate('/cart');
            }}
          >
            {t.addToCart} (₹{product.price})
          </Button>
        </div>
      </ScreenLayout>
    );
  }
