"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import {
  usePublishState,
  useConversionStoreClient,
} from "../../stores/conversionStoreClient";
import Button from "../button";
import styles from "./index.module.css";

export default function PublishResultDisplay() {
  const publishState = usePublishState();
  const { resetWorkflow } = useConversionStoreClient();
  const [isCopied, setIsCopied] = useState(false);

  const handleStartNew = () => {
    resetWorkflow();
  };

  const handleCopyUrl = async () => {
    if (publishState.publishResult?.publishedUrl) {
      try {
        await navigator.clipboard.writeText(
          publishState.publishResult.publishedUrl
        );
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Publication Result</h1>
        </div>

        <div className={styles.content}>
          {publishState.publishSuccess ? (
            <div className={styles.success_state}>
              <div className={styles.icon_wrapper}>
                <CheckCircle size={64} className={styles.success_icon} />
              </div>

              <h2 className={styles.status_title}>Published Successfully!</h2>
              <p className={styles.status_description}>
                Your document has been published to Storyblok.
              </p>

              {publishState.publishResult && (
                <>
                  <div className={styles.details_section}>
                    <h3 className={styles.section_title}>
                      Publication Details
                    </h3>

                    <Button
                      variant="primary"
                      icon={<ExternalLink size={16} />}
                      iconPosition="right"
                      onClick={() =>
                        window.open(
                          publishState.publishResult?.publishedUrl,
                          "_blank"
                        )
                      }
                      className={styles.dashboard_button}
                    >
                      View in Storyblok Dashboard
                    </Button>
                  </div>

                  <div className={styles.preview_section}>
                    <label className={styles.preview_label}>
                      Preview Link:
                    </label>
                    <div className={styles.url_container}>
                      <div className={styles.url_display}>
                        {publishState.publishResult?.publishedUrl}
                      </div>
                      <Button
                        variant="ghost"
                        size="small"
                        icon={
                          isCopied ? <Check size={14} /> : <Copy size={14} />
                        }
                        onClick={handleCopyUrl}
                        className={styles.copy_button}
                      >
                        {isCopied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : publishState.publishError ? (
            <div className={styles.error_state}>
              <div className={styles.icon_wrapper}>
                <XCircle size={64} className={styles.error_icon} />
              </div>

              <h2 className={styles.status_title}>Publication Failed</h2>
              <p className={styles.status_description}>
                There was an error publishing your document.
              </p>

              <div className={styles.error_section}>
                <h3 className={styles.section_title}>Error Details:</h3>
                <div className={styles.error_message}>
                  {publishState.publishError}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.default_state}>
              <p>No publish result available.</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Button
            variant="outline"
            icon={<RotateCcw size={16} />}
            iconPosition="left"
            onClick={handleStartNew}
            className={styles.start_new_button}
          >
            Start New Conversion
          </Button>
        </div>
      </div>
    </div>
  );
}
