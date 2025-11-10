"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Check,
  Database,
  Cog,
  XCircle,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Eye,
  Upload,
} from "lucide-react";
import Button from "../../../components/button";
import styles from "./work.module.css";
import { apiService } from "@/services";
import { SCHEMA_MAP } from "@/constants/schema";
import { StoryblokStory, TranslateStoryResponse } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IframeComponent } from "./IframePreview";

// 工作流阶段枚举（按执行顺序）
enum WorkflowStage {
  FETCHING_STORY = 0, // 拉取 story
  WORKING = 1, // 工作状态
  CONFIRMATION = 2, // 确认状态
  UPLOADING = 3, // 上传状态
  DONE = 4, // 完成状态
  FAILED = -1, // 失败状态
}

// 阶段状态
enum StageStatus {
  PENDING = "pending", // 等待中
  LOADING = "loading", // 进行中
  SUCCESS = "success", // 成功
  ERROR = "error", // 失败
}

const SCHEMA_KEYS = Object.keys(SCHEMA_MAP);

const statusMap = {
  0: {
    icon: <div className={styles.iconPending}>•</div>,
    text: "等待中",
    badgeClass: styles.statusBadgePending,
  },
  1: {
    icon: <Loader2 className={styles.iconSpin} size={20} />,
    text: "上传中",
    badgeClass: styles.statusBadgeLoading,
  },
  2: {
    icon: <Check size={20} className={styles.iconSuccess} />,
    text: "已上传",
    badgeClass: styles.statusBadgeSuccess,
  },
  3: {
    icon: <Check size={20} className={styles.iconSuccess} />,
    text: "已发布",
    badgeClass: styles.statusBadgeSuccess,
  },
  4: {
    icon: <XCircle size={20} className={styles.iconError} />,
    text: "上传失败",
    badgeClass: styles.statusBadgeError,
  },
  5: {
    icon: <XCircle size={20} className={styles.iconError} />,
    text: "发布失败",
    badgeClass: styles.statusBadgeError,
  },
};

interface ConfirmingData {
  type: number; // 0: 不使用，1: 使用, 2: 直接发布
  lng: string;
  status: number; // 0: 未开始，1: 进行中，2: 已上传，3. 已发布，4. 上传失败，5. 发布失败
}

interface WorkProps {
  formData: {
    link: string;
    targetLanguages: string[];
  };
  onBack: () => void; // 返回上一页的回调
}

export default function Work({ formData, onBack }: WorkProps) {
  // 只用一个 state 管理当前执行到哪个阶段
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(
    WorkflowStage.FETCHING_STORY
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isStagesCollapsed, setIsStagesCollapsed] = useState<boolean>(false);

  // 原始 story 数据
  const [storyData, setStoryData] = useState<StoryblokStory | null>(null);
  // 翻译后的 story 数据
  const [translatedStoryData, setTranslatedStoryData] = useState<
    TranslateStoryResponse["data"] | null
  >(null);
  /** 用户选择的语言 */
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  /** 用户确认的数据 */
  const [confirmingData, setConfirmingData] = useState<Array<ConfirmingData>>(
    formData.targetLanguages.map((lng) => ({ type: 0, lng, status: 0 }))
  );

  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const selectRef = useRef<HTMLDivElement>(null);

  const confirmData = confirmingData.find(
    (item) => item.lng === selectedLanguage
  );

  // 根据当前阶段计算每个阶段的状态
  const getStageStatus = (stage: WorkflowStage): StageStatus => {
    // 如果是失败状态
    if (currentStage === WorkflowStage.FAILED) {
      // 只有失败的那个阶段显示错误，其他已完成的显示成功
      if (stage < WorkflowStage.FETCHING_STORY) {
        return StageStatus.ERROR;
      }
      return StageStatus.SUCCESS;
    }

    // 正常流程
    if (stage < currentStage) {
      return StageStatus.SUCCESS; // 已完成的阶段
    } else if (stage === currentStage) {
      return StageStatus.LOADING; // 当前正在执行的阶段
    } else {
      return StageStatus.PENDING; // 还未开始的阶段
    }
  };

  // 拉取 story
  const fetchStory = async () => {
    try {
      const data = await apiService.getStoryblokStory(formData.link);
      console.log("🚀 ~ fetchStory ~ storyData:", data);

      if (SCHEMA_KEYS.includes(data?.content?.component)) {
        setStoryData(data);
        setCurrentStage(WorkflowStage.WORKING);
      } else {
        setCurrentStage(WorkflowStage.FAILED);
        setErrorMessage("不支持的 Story 类型");
      }
    } catch (error: unknown) {
      console.error("拉取 Story 失败:", error);
      setCurrentStage(WorkflowStage.FAILED);
      setErrorMessage("拉取 Story 失败，请检查链接是否正确");
    }
  };

  // 开始工作流程
  const startWork = async () => {
    try {
      if (!storyData) {
        setCurrentStage(WorkflowStage.FAILED);
        setErrorMessage("story 数据丢失");
        return;
      }
      const translatedStory = await apiService.translateStory(
        storyData,
        formData.targetLanguages
      );
      setTranslatedStoryData(translatedStory.data);
      setCurrentStage(WorkflowStage.CONFIRMATION);
    } catch (error: unknown) {
      console.error("翻译工作执行失败:", error);
      setCurrentStage(WorkflowStage.FAILED);
      setErrorMessage("翻译工作执行失败");
    }
  };

  // 上传翻译后的 story 到 Storyblok
  const uploadStory = async () => {
    let done = 0;
    const totalCount = confirmingData.length;

    const updateStatus = () => {
      done++;
      if (done === totalCount) {
        setCurrentStage(WorkflowStage.DONE);
      }
    };

    const updateConfirmingData = (index: number, status: number) => {
      setConfirmingData((pre) => {
        const newData = [...pre];
        newData[index].status = status;
        updateStatus();
        return newData;
      });
    };

    for (let i = 0; i < confirmingData.length; i++) {
      const confirmingItem = confirmingData[i];
      const story = translatedStoryData?.find(
        (item) => item.lng === confirmingItem.lng
      )?.story;

      if (!story) {
        updateStatus();
        continue;
      }

      if (confirmingItem.type > 0) {
        let storyId = null;
        try {
          const { success, data } = await apiService.uploadStoryToStoryblok({
            story,
          });
          if (success) storyId = data?.story.id;
        } catch (error) {
          console.error("上传 story 失败:", error);
        } finally {
          updateConfirmingData(i, storyId ? 2 : 4);
        }

        if (confirmingItem.type === 2 && storyId) {
          try {
            const { success } = await apiService.publishStoryToStoryblok(
              storyId
            );
            updateConfirmingData(i, success ? 3 : 5);
          } catch (error) {
            console.error("发布 story 失败:", error);
            updateConfirmingData(i, 5);
          }
        }
      }
    }
  };

  // 选择语言后，预览对应的语言
  const handleSelectChange = (value: string) => {
    setSelectedLanguage(value);
    if (iframeRef.current) {
      const selectedStory = translatedStoryData?.find(
        (item) => item.lng === value
      );
      iframeRef.current.contentWindow?.postMessage(
        {
          type: "preview",
          story: selectedStory?.story,
        },
        "*"
      );
    }
  };

  // 点击确认使用
  const handleConfirmType = (type: number) => {
    setConfirmingData((prev) => {
      const newData = prev.map((item) => {
        if (item.lng === selectedLanguage) {
          return { ...item, type };
        }
        return item;
      });
      return newData;
    });
  };

  // 当阶段变化时，自动执行对应的操作
  useEffect(() => {
    if (currentStage === WorkflowStage.FETCHING_STORY) {
      fetchStory();
    } else if (currentStage === WorkflowStage.WORKING) {
      startWork();
    } else if (currentStage === WorkflowStage.UPLOADING) {
      uploadStory();
    }
  }, [currentStage]);

  // 监听 iframe 消息，如果 iframe 准备好，则发送故事数据
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data.type === "preview-ready" &&
        event.data.action === "ready" &&
        selectRef.current
      ) {
        selectRef.current.classList.add(styles.selectContainerReady);
        iframeRef.current.contentWindow?.postMessage(
          {
            type: "preview",
            story: storyData,
          },
          "*"
        );
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [storyData]);

  // 渲染阶段状态图标
  const renderStageIcon = (status: StageStatus) => {
    switch (status) {
      case StageStatus.LOADING:
        return <Loader2 className={styles.iconSpin} size={24} />;
      case StageStatus.SUCCESS:
        return <Check size={24} className={styles.iconSuccess} />;
      case StageStatus.ERROR:
        return <XCircle size={24} className={styles.iconError} />;
      default:
        return <div className={styles.iconPending}>•</div>;
    }
  };

  // 如果是失败状态，显示错误页面
  if (currentStage === WorkflowStage.FAILED) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <XCircle size={48} />
          </div>
          <h2 className={styles.errorTitle}>翻译流程失败</h2>
          <p className={styles.errorMessage}>{errorMessage}</p>
          <div className={styles.errorActions}>
            <Button
              variant="primary"
              size="large"
              onClick={onBack}
              icon={<ArrowLeft size={20} />}
            >
              返回上一页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 主内容区域 */}
      <div className={styles.mainContent}>
        <h1 className={styles.title}>翻译进度</h1>
        <p className={styles.subtitle}>
          正在处理 {formData.targetLanguages.length} 种语言的翻译
        </p>

        {/* 工作状态的额外内容区域 */}
        {currentStage === WorkflowStage.WORKING && (
          <div className={styles.workingContent}>
            {/* TODO: 这里后续实现工作状态的具体内容 */}
            <div className={styles.workingPlaceholder}>
              <p>翻译工作进行中...</p>
              <p className={styles.workingHint}>具体内容将在后续版本中实现</p>
            </div>
          </div>
        )}

        {currentStage === WorkflowStage.CONFIRMATION && (
          <div className={styles.resultContainer}>
            <div className={styles.confirmationContainer}>
              <div ref={selectRef} className={styles.selectContainer}>
                <Select
                  value={selectedLanguage}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择要预览的语言" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.targetLanguages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedLanguage && (
                <div style={{ width: "200px" }}>
                  <Select
                    value={confirmData?.type?.toString() || "0"}
                    onValueChange={(value) => handleConfirmType(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择是否使用" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">不使用</SelectItem>
                      <SelectItem value="1">采用</SelectItem>
                      <SelectItem value="2">直接发布</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                variant="primary"
                size="medium"
                onClick={() => setCurrentStage(WorkflowStage.UPLOADING)}
                style={{ marginLeft: "auto" }}
              >
                全部确认完毕，开始上传
              </Button>
            </div>
            <IframeComponent ref={iframeRef} />
          </div>
        )}
        {currentStage >= WorkflowStage.UPLOADING && (
          <div className={styles.uploadingContent}>
            <h2 className={styles.uploadingTitle}>上传进度</h2>
            <div className={styles.uploadingList}>
              {confirmingData
                .filter((item) => item.type > 0) // 只显示 type > 0 的项（采用或直接发布）
                .map((item, index) => {
                  const currentStatus =
                    statusMap[item.status as keyof typeof statusMap] ||
                    statusMap[0];

                  return (
                    <div key={index} className={styles.uploadingItem}>
                      <div className={styles.uploadingItemIcon}>
                        {currentStatus.icon}
                      </div>
                      <div className={styles.uploadingItemContent}>
                        <div className={styles.uploadingItemLanguage}>
                          {item.lng}
                        </div>
                        <div className={styles.uploadingItemDetails}>
                          <span className={currentStatus.badgeClass}>
                            {currentStatus.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        {currentStage === WorkflowStage.DONE && (
          <div className={styles.doneContainer}>
            <div className={styles.doneIcon}>
              <Check size={48} />
            </div>
            <h2 className={styles.doneTitle}>翻译上传完成</h2>
            <p className={styles.doneMessage}>
              已成功完成{" "}
              {
                confirmingData.filter(
                  (item) => item.type > 0 && item.status >= 2
                ).length
              }{" "}
              / {confirmingData.filter((item) => item.type > 0).length}{" "}
              个语言的上传
            </p>
            <div className={styles.doneSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>已上传</span>
                <span className={styles.summaryValue}>
                  {confirmingData.filter((item) => item.status === 2).length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>已发布</span>
                <span className={styles.summaryValue}>
                  {confirmingData.filter((item) => item.status === 3).length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>上传失败</span>
                <span
                  className={`${styles.summaryValue} ${styles.summaryValueError}`}
                >
                  {
                    confirmingData.filter(
                      (item) => item.type > 0 && item.status === 4
                    ).length
                  }
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>发布失败</span>
                <span
                  className={`${styles.summaryValue} ${styles.summaryValueError}`}
                >
                  {confirmingData.filter((item) => item.status === 5).length}
                </span>
              </div>
            </div>
            <div className={styles.doneActions}>
              <Button variant="primary" size="large" onClick={onBack}>
                返回上一页
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 浮动在左下角的状态列表 */}
      <div className={styles.floatingStages}>
        {/* 折叠/展开按钮 */}
        <button
          className={styles.collapseToggle}
          onClick={() => setIsStagesCollapsed(!isStagesCollapsed)}
        >
          <span className={styles.collapseToggleText}>进度状态</span>
          {isStagesCollapsed ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {/* 状态列表 */}
        {!isStagesCollapsed && (
          <div className={styles.stagesList}>
            {/* 阶段 1: 拉取 Story */}
            <div className={styles.stageItem}>
              <div className={styles.iconWrapper}>
                <Database size={20} className={styles.functionIcon} />
              </div>
              <div className={styles.stageContent}>
                <p className={styles.stageTitle}>拉取 Story 数据</p>
                <p className={styles.stageDescription}>
                  从 Storyblok 获取页面内容
                </p>
              </div>
              <div className={styles.statusWrapper}>
                {renderStageIcon(getStageStatus(WorkflowStage.FETCHING_STORY))}
              </div>
            </div>

            {/* 阶段 2: 工作状态 */}
            <div className={styles.stageItem}>
              <div className={styles.iconWrapper}>
                <Cog size={20} className={styles.functionIcon} />
              </div>
              <div className={styles.stageContent}>
                <p className={styles.stageTitle}>执行翻译</p>
                <p className={styles.stageDescription}>
                  翻译内容并准备上传到 Storyblok
                </p>
              </div>
              <div className={styles.statusWrapper}>
                {renderStageIcon(getStageStatus(WorkflowStage.WORKING))}
              </div>
            </div>

            <div className={styles.stageItem}>
              <div className={styles.iconWrapper}>
                <Eye size={20} className={styles.functionIcon} />
              </div>
              <div className={styles.stageContent}>
                <p className={styles.stageTitle}>预览 & 确认</p>
                <p className={styles.stageDescription}>
                  预览翻译内容并确认是否使用
                </p>
              </div>
              <div className={styles.statusWrapper}>
                {renderStageIcon(getStageStatus(WorkflowStage.CONFIRMATION))}
              </div>
            </div>

            <div className={styles.stageItem}>
              <div className={styles.iconWrapper}>
                <Upload size={20} className={styles.functionIcon} />
              </div>
              <div className={styles.stageContent}>
                <p className={styles.stageTitle}>上传</p>
                <p className={styles.stageDescription}>
                  上传翻译后的 story 到 Storyblok
                </p>
              </div>
              <div className={styles.statusWrapper}>
                {renderStageIcon(getStageStatus(WorkflowStage.UPLOADING))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
