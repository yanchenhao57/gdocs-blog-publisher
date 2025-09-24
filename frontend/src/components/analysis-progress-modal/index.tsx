import React from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Brain,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import styles from "./index.module.css";
import { useInternalLinkOptimizerStore } from "@/stores/internalLinkOptimizerStore";
import Button from "../button";

interface AnalysisProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalysisProgressModal({
  isOpen,
  onClose,
}: AnalysisProgressModalProps) {
  const {
    isFetchStoryblokLoading,
    isFetchStoryblokError,
    isAnalyzing,
    isAnalyzingError,
    storyData,
    optimizationChanges,
    retryStoryblokFetch,
    retryAIAnalysis,
  } = useInternalLinkOptimizerStore();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={styles.dialogContent}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Content Analysis in Progress</DialogTitle>
        </DialogHeader>
        <div className={styles.content}>
           {/* Storyblok 状态 */}
           <div className={styles.item_status}>
             <div className={styles.icon_wrapper}>
               <Database size={20} className={styles.function_icon} />
             </div>
             <div className={styles.item_status_content}>
               <p className={styles.item_status_content_title}>
                 Fetch Storyblok Data
               </p>
               <p className={styles.item_status_content_description}>
                 Retrieving blog content from Storyblok CMS
               </p>
             </div>
             <div className={styles.action_wrapper}>
               {isFetchStoryblokLoading && (
                 <div className={styles.loading}>
                   <Loader2 className={styles.iconSpin} size={24} />
                 </div>
               )}
               {isFetchStoryblokError && (
                 <div className={styles.retry}>
                   <Button size="small" onClick={retryStoryblokFetch}>
                     Retry
                   </Button>
                 </div>
               )}
               {storyData && !isFetchStoryblokLoading && !isFetchStoryblokError && (
                 <div className={styles.success}>
                   <Check size={24} />
                 </div>
               )}
             </div>
           </div>

           {/* AI Analysis 状态 */}
           <div className={styles.item_status}>
             <div className={styles.icon_wrapper}>
               <Brain size={20} className={styles.function_icon} />
             </div>
             <div className={styles.item_status_content}>
               <p className={styles.item_status_content_title}>
                 AI Content Analysis
               </p>
               <p className={styles.item_status_content_description}>
                 Analyzing content for internal link optimization opportunities
               </p>
             </div>
             <div className={styles.action_wrapper}>
               {isAnalyzing && (
                 <div className={styles.loading}>
                   <Loader2 className={styles.iconSpin} size={24} />
                 </div>
               )}
               {isAnalyzingError && (
                 <div className={styles.retry}>
                   <Button size="small" onClick={retryAIAnalysis}>
                     Retry
                   </Button>
                 </div>
               )}
               {optimizationChanges.length > 0 && !isAnalyzing && !isAnalyzingError && (
                 <div className={styles.success}>
                   <Check size={24} />
                 </div>
               )}
             </div>
           </div>
         </div>
       </DialogContent>
     </Dialog>
  );
}
