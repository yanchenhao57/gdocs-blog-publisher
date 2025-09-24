import { useState, useEffect } from 'react';
import { LinkRow } from '../app/internal-link-optimizer/modules/types';

interface InputHistory {
  id: string;
  linkRows: LinkRow[];
  timestamp: number;
  title?: string; // 从链接配置生成的简短标题
}

const STORAGE_KEY = 'internal-link-optimizer-link-configs';
const MAX_HISTORY_COUNT = 3;

// 预设的历史记录数据
const DEFAULT_HISTORY: InputHistory[] = [
  {
    id: 'preset-1',
    linkRows: [
      {
        id: '1',
        targetUrl: 'https://www.notta.ai/en/tools/audio-to-text-converter',
        anchorTexts: ['Audio to Text', 'convert audio to text', 'transcribe audio to text']
      },
      {
        id: '2',
        targetUrl: 'https://www.notta.ai/en',
        anchorTexts: ['ai transcription', 'ai note taker']
      },
      {
        id: '3',
        targetUrl: 'https://www.notta.ai/en/blog/best-ai-note-taking-app',
        anchorTexts: ['ai note taker']
      },
      {
        id: '4',
        targetUrl: 'https://www.notta.ai/en/blog/best-free-transcription-software',
        anchorTexts: ['free audio transcription', 'free transcription software', 'free transcription app']
      },
      {
        id: '5',
        targetUrl: 'https://www.notta.ai/en/blog/app-to-record-lectures-and-convert-to-text',
        anchorTexts: ['record lectures', 'best lecture recording app', 'lecture recorder']
      },
      {
        id: '6',
        targetUrl: 'https://www.notta.ai/en/tools/transcribe-voice-memo-to-text',
        anchorTexts: ['voice memo to text', 'transcribe voice memos', 'voice memo transcription']
      },
      {
        id: '7',
        targetUrl: 'https://www.notta.ai/en/spanish-audio-to-text',
        anchorTexts: ['transcribe in spanish']
      },
      {
        id: '8',
        targetUrl: 'https://www.notta.ai/en/tools/mp4-to-text',
        anchorTexts: ['mp4 to text', 'mp4 to transcript', 'mp4 to text converter']
      },
      {
        id: '9',
        targetUrl: 'https://www.notta.ai/en/tools/youtube-video-summarizer',
        anchorTexts: ['youtube video summa', 'summarize youtube video', 'youtube summarizer']
      },
      {
        id: '10',
        targetUrl: 'https://www.notta.ai/en/tools/m4a-to-text',
        anchorTexts: ['m4a to text', 'transcribe m4a to text', 'convert m4a to text']
      }
    ],
    timestamp: Date.now() - 86400000, // 1 day ago
    title: 'Notta AI Tools + 9 more'
  }
];

export function useInputHistory() {
  const [history, setHistory] = useState<InputHistory[]>(DEFAULT_HISTORY);

  // 从 localStorage 加载历史记录，如果有保存的数据则覆盖默认预设
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 如果解析出来是空数组，保持预设数据不变
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 过滤掉无效的历史记录项
          const validHistory = parsed.filter((item: InputHistory) => 
            item.linkRows && 
            item.linkRows.length > 0 && 
            item.linkRows.some((row: LinkRow) => 
              row.targetUrl && row.targetUrl.trim() && 
              row.anchorTexts && row.anchorTexts.some((text: string) => text.trim())
            )
          );
          
          if (validHistory.length > 0) {
            setHistory(validHistory);
            // 如果清理后的数据与原数据不同，更新 localStorage
            if (validHistory.length !== parsed.length) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(validHistory));
            }
          }
          // 如果所有历史记录都无效，保持预设数据
        }
      }
      // 如果没有保存的历史记录，保持初始的预设数据，无需再次设置
    } catch (error) {
      console.error('Failed to load input history:', error);
      // 如果读取失败，保持预设数据不变
    }
  }, []);

  // 生成简短标题（基于链接配置）
  const generateTitle = (linkRows: LinkRow[]): string => {
    const validLinks = linkRows.filter(row => row.targetUrl.trim());
    const linkCount = validLinks.length;
    
    if (linkCount === 0) {
      return 'Empty configuration';
    }
    
    // 获取第一个链接的域名或路径作为标识
    try {
      const firstLink = validLinks[0].targetUrl;
      let identifier = '';
      
      if (firstLink.startsWith('http')) {
        const url = new URL(firstLink);
        const pathname = url.pathname;
        const segments = pathname.split('/').filter(Boolean);
        identifier = segments[segments.length - 1] || url.hostname;
      } else {
        // 处理相对路径
        const segments = firstLink.split('/').filter(Boolean);
        identifier = segments[segments.length - 1] || firstLink;
      }
      
      // 清理和格式化标识符
      identifier = identifier
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .substring(0, 20);
      
      if (linkCount === 1) {
        return `${identifier}`;
      } else {
        return `${identifier} + ${linkCount - 1} more`;
      }
    } catch {
      return `${linkCount} link${linkCount > 1 ? 's' : ''} configuration`;
    }
  };

  // 保存新的链接配置
  const saveToHistory = (linkRows: LinkRow[]) => {
    // 过滤出有效的链接行（有URL和至少一个非空的锚文本）
    const validRows = linkRows.filter(row => 
      row.targetUrl.trim() && 
      row.anchorTexts.some(text => text.trim())
    );
    
    if (validRows.length === 0) {
      return; // 不保存空的配置
    }

    const newEntry: InputHistory = {
      id: Date.now().toString(),
      linkRows: JSON.parse(JSON.stringify(validRows)), // 深拷贝有效的数据
      timestamp: Date.now(),
      title: generateTitle(validRows)
    };

    setHistory(prevHistory => {
      // 检查是否已存在相同的链接配置
      const existingIndex = prevHistory.findIndex(
        item => JSON.stringify(item.linkRows) === JSON.stringify(validRows)
      );

      let newHistory: InputHistory[];
      if (existingIndex >= 0) {
        // 如果存在相同配置，更新时间戳并移到前面
        newHistory = [
          { ...prevHistory[existingIndex], timestamp: Date.now() },
          ...prevHistory.filter((_, index) => index !== existingIndex)
        ];
      } else {
        // 添加新配置到前面
        newHistory = [newEntry, ...prevHistory];
      }

      // 只保留最近的 MAX_HISTORY_COUNT 个
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_COUNT);

      // 保存到 localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
      } catch (error) {
        console.error('Failed to save input history:', error);
      }

      return limitedHistory;
    });
  };

  // 从历史记录中删除项目
  const removeFromHistory = (id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to update input history:', error);
      }
      
      return newHistory;
    });
  };

  // 清空历史记录
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear input history:', error);
    }
  };

  // 重置为默认历史记录
  const resetToDefault = () => {
    setHistory(DEFAULT_HISTORY);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HISTORY));
    } catch (error) {
      console.error('Failed to reset to default history:', error);
    }
  };

  return {
    history,
    saveToHistory,
    removeFromHistory,
    clearHistory,
    resetToDefault
  };
}
