import React from 'react';
import { FileText, ExternalLink, Download, RotateCcw } from 'lucide-react';

interface OutputStepProps {
  optimizedContent: string;
  onStartOver: () => void;
}

export default function OutputStep({ optimizedContent, onStartOver }: OutputStepProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-12">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Final Optimized Article
          </h2>
          <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Your content has been optimized with the accepted internal links
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                Optimized Content
              </span>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="text-sm text-gray-900 leading-relaxed" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              <style jsx>{`
                .internal-link-new {
                  background-color: #f0f9ff;
                  color: #1d4ed8;
                  padding: 2px 4px;
                  border-radius: 4px;
                  text-decoration: none;
                  border: 1px solid #dbeafe;
                }
              `}</style>
              <div dangerouslySetInnerHTML={{ 
                __html: optimizedContent
                  .replace(/\n/g, '<br>')
                  .replace(/class="internal-link-new"/g, 'style="background-color: #f0f9ff; color: #1d4ed8; padding: 2px 4px; border-radius: 4px; text-decoration: none; border: 1px solid #dbeafe;"')
              }} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-6" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Export Options
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center px-6 py-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              <ExternalLink className="w-4 h-4 mr-3 text-gray-400" />
              Upload to CMS
            </button>
            <button className="flex items-center justify-center px-6 py-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              <Download className="w-4 h-4 mr-3 text-gray-400" />
              Download HTML
            </button>
            <button className="flex items-center justify-center px-6 py-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              <Download className="w-4 h-4 mr-3 text-gray-400" />
              Download Markdown
            </button>
            <button className="flex items-center justify-center px-6 py-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              <Download className="w-4 h-4 mr-3 text-gray-400" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <button 
            onClick={onStartOver}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}