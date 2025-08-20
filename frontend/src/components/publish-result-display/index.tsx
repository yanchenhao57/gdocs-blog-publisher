"use client";

import React from "react";
import { CheckCircle, XCircle, ExternalLink, RotateCcw } from "lucide-react";
import { 
  usePublishState,
  useConversionStoreClient
} from "../../stores/conversionStoreClient";
import Button from "../button";
import styles from "./index.module.css";

export default function PublishResultDisplay() {
  const publishState = usePublishState();
  const { resetWorkflow } = useConversionStoreClient();

  const handleStartNew = () => {
    resetWorkflow();
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        Publication Result
      </h1>
      
      <div className={styles.content}>
        <div className={styles.result_container}>
          {publishState.publishSuccess ? (
            // 发布成功
            <div className={styles.success_card}>
              <div className={styles.status_header}>
                <CheckCircle size={48} className={styles.success_icon} />
                <h2 className={styles.status_title}>Published Successfully!</h2>
                <p className={styles.status_description}>
                  Your document has been published to Storyblok.
                </p>
              </div>

              {/* 发布结果详情 */}
              {publishState.publishResult && (
                <div className={styles.details_section}>
                  <h3 className={styles.details_title}>Publication Details</h3>
                  
                  <div className={styles.link_section}>
                    <Button
                      variant="primary"
                      icon={<ExternalLink />}
                      iconPosition="right"
                      onClick={() => window.open(publishState.publishResult?.publishedUrl, '_blank')}
                    >
                      View in Storyblok Dashboard
                    </Button>
                  </div>
                  
                  <div className={styles.url_info}>
                    <strong>Preview Link:</strong>
                    <p className={styles.url_text}>
                      {publishState.publishResult?.publishedUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : publishState.publishError ? (
            // 发布失败
            <div className={styles.error_card}>
              <div className={styles.status_header}>
                <XCircle size={48} className={styles.error_icon} />
                <h2 className={styles.status_title}>Publication Failed</h2>
                <p className={styles.status_description}>
                  There was an error publishing your document.
                </p>
              </div>
              
              {/* 错误详情 */}
              <div className={styles.error_details}>
                <h4 className={styles.error_details_title}>Error Details:</h4>
                <div className={styles.error_message}>
                  {publishState.publishError}
                </div>
              </div>
            </div>
          ) : (
            // 默认状态（不应该出现）
            <div className={styles.default_card}>
              <p>No publish result available.</p>
            </div>
          )}
        </div>

        <div className={styles.actions_container}>
          <div className={styles.actions_content}>
            <div className={styles.actions_item}>
              <Button
                variant="primary"
                icon={<RotateCcw />}
                iconPosition="left"
                onClick={handleStartNew}
                className={styles.action_button}
              >
                Start New Conversion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
