"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useEditableFields,
  usePublishState,
  useCanPublish,
  useConversionStoreClient,
  useAiAnalysisStatus,
} from "../../stores/conversionStoreClient";
import Input from "../input";
import Tab, { TabItem } from "../tab";
import FormItem from "../form-item";
import Modal from "../modal";
import styles from "./index.module.css";
import {
  Bot,
  FileText,
  Edit3,
  ArrowLeft,
  ArrowRight,
  Rss,
  SquarePen,
  AlertTriangle,
} from "lucide-react";
import Dropdown, { DropdownOption } from "../dropdown";
import NumberStepper from "../number-stepper";
import {
  NOTTA_HOST,
  JP_BLOG_PATH,
  EN_BLOG_PATH,
  JP_AUTHOR_MAP,
  EN_AUTHOR_MAP,
} from "../../constants";
import ImagePreview from "../image-preview";
import Button from "../button";
import BlogCard from "../blog-card";
import SeoMetaCard from "../seo-meta-card";
import PrePublishCheck from "../pre-publish-check";
import StoryblokBlogDisplay from "../storyblok-blog-display";
import { usePrePublishCheck } from "../../hooks/usePrePublishCheck";
import type { IBlogStory } from "../../types/storyblok";

export default function EditFieldsForm() {
  const editableFields = useEditableFields();
  const publishState = usePublishState();
  const canPublish = useCanPublish();
  const aiAnalysis = useAiAnalysisStatus();
  const {
    checkSlug,
    isChecking: isCheckingUrl,
    lastCheckResult,
  } = usePrePublishCheck();
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showBackConfirmModal, setShowBackConfirmModal] =
    useState<boolean>(false);

  // 本地状态管理
  const [currentTabId, setCurrentTabId] = useState<string>("document");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [isCanonicalManuallyEdited, setIsCanonicalManuallyEdited] =
    useState<boolean>(false);

  const {
    updateEditableField,
    publishToStoryblok,
    regenerateAiData,
    resetWorkflow,
    currentDocId,
    result,
  } = useConversionStoreClient();

  // 初始化时设置默认的标题来源
  useEffect(() => {
    if (result?.firstH1Title) {
      setCurrentTabId("ai");
      updateEditableField("heading_h1", result.firstH1Title);
    } else if (result?.aiMeta?.heading_h1) {
      setCurrentTabId("document");
      updateEditableField("heading_h1", result.aiMeta.heading_h1);
    }
  }, [result, updateEditableField]);

  // 单独的 useEffect 处理作者初始化和语言变化
  useEffect(() => {
    const currentLanguage = editableFields.language || "en";

    // 如果没有设置作者，或者当前作者不在新语言的作者列表中，则随机选择一个
    const authorMap = currentLanguage === "ja" ? JP_AUTHOR_MAP : EN_AUTHOR_MAP;
    const currentAuthorExists =
      editableFields.author_id &&
      (editableFields.author_id as keyof typeof authorMap) in authorMap;

    if (!editableFields.author_id || !currentAuthorExists) {
      const randomAuthor = getRandomAuthor(currentLanguage);
      updateEditableField("author_id", randomAuthor);
    }
  }, [editableFields.language, editableFields.author_id, updateEditableField]);

  const titleTabItems: TabItem[] = [
    {
      id: "ai",
      label: "AI Generated",
      icon: <Bot size={16} />,
    },
    {
      id: "document",
      label: "Document First H1",
      icon: <FileText size={16} />,
    },
    {
      id: "custom",
      label: "Custom",
      icon: <Edit3 size={16} />,
    },
  ];

  // 语言选项配置
  const languageOptions: DropdownOption[] = [
    {
      id: "en",
      label: "English",
      icon: <span style={{ fontSize: "18px" }}>🇺🇸</span>,
    },
    {
      id: "ja",
      label: "日本語",
      icon: <span style={{ fontSize: "18px" }}>🇯🇵</span>,
    },
  ];

  // 创建首字母图标组件
  const createInitialIcon = (name: string) => {
    const initial = name.charAt(0).toUpperCase();
    return (
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#3b82f6",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: "600",
        }}
      >
        {initial}
      </div>
    );
  };

  // 根据语言获取作者选项
  const getAuthorOptions = (language: string): DropdownOption[] => {
    const authorMap = language === "ja" ? JP_AUTHOR_MAP : EN_AUTHOR_MAP;
    return Object.entries(authorMap).map(([id, name]) => ({
      id,
      label: name,
      icon: createInitialIcon(name),
    }));
  };

  // 获取当前语言的作者选项（使用useMemo确保在语言变化时重新计算）
  const authorOptions = useMemo(() => {
    return getAuthorOptions(editableFields.language || "en");
  }, [editableFields.language]);

  // 随机选择一个作者
  const getRandomAuthor = (language: string) => {
    const authorMap = language === "ja" ? JP_AUTHOR_MAP : EN_AUTHOR_MAP;
    const authorIds = Object.keys(authorMap);
    const randomIndex = Math.floor(Math.random() * authorIds.length);
    return authorIds[randomIndex];
  };

  // 获取默认作者ID，如果没有设置则随机选择一个
  const getDefaultAuthorId = () => {
    if (editableFields.author_id) {
      return editableFields.author_id;
    }
    return getRandomAuthor(editableFields.language || "en");
  };

  const handleTitleTabChange = (tabId: string) => {
    // 如果当前是custom模式，保存用户输入
    if (currentTabId === "custom") {
      setCustomTitle(editableFields.heading_h1);
    }

    setCurrentTabId(tabId);

    switch (tabId) {
      case "ai":
        updateEditableField("heading_h1", result?.aiMeta?.heading_h1 || "");
        break;
      case "document":
        updateEditableField("heading_h1", result?.firstH1Title || "");
        break;
      case "custom":
        // 恢复之前保存的自定义标题
        updateEditableField("heading_h1", customTitle);
        break;
    }
  };

  const handleTitleInputChange = (value: string) => {
    updateEditableField("heading_h1", value);
    // 如果当前是custom模式，实时更新customTitle
    if (currentTabId === "custom") {
      setCustomTitle(value);
    }
  };

  const handleLanguageChange = (languageId: string, option: DropdownOption) => {
    // 更新语言，useEffect会自动处理作者的更新
    updateEditableField("language", languageId);
    // 当 language 改变时，重置手动编辑标志，允许自动更新 canonical URL
    setIsCanonicalManuallyEdited(false);
  };

  const handleAuthorChange = (authorId: string, option: DropdownOption) => {
    updateEditableField("author_id", authorId);
  };

  const handleSeoTitleInputChange = (value: string) => {
    updateEditableField("seo_title", value);
  };

  const handleSeoDescriptionInputChange = (value: string) => {
    updateEditableField("seo_description", value);
  };

  const handlePublish = async () => {
    if (!canPublish) return;

    try {
      // 调用Zustand中的publishToStoryblok action
      // 这个action会处理所有的API调用、状态更新和工作流转换
      await publishToStoryblok();
    } catch (error) {
      // 错误已经在publishToStoryblok action中处理了
      console.error("Publication failed:", error);
    }
  };

  const handleRegenerateAi = async () => {
    if (!currentDocId || !result?.markdown) {
      console.warn("Cannot regenerate AI: missing docId or markdown");
      return;
    }

    try {
      // 调用Zustand中的regenerateAiData action
      await regenerateAiData(
        currentDocId,
        result.markdown,
        editableFields.language
      );
    } catch (error) {
      // 错误已经在regenerateAiData action中处理了
      console.error("AI regeneration failed:", error);
    }
  };

  const handleNextStep = () => {
    if (!previewMode) {
      setPreviewMode(true);
    } else {
      handlePublish();
    }
  };

  const handleReadingTimeChange = (value: number) => {
    updateEditableField("reading_time", value);
  };

  const handleArticleSlugChange = (value: string) => {
    updateEditableField("slug", value);
    // 当 slug 改变时，重置手动编辑标志，允许自动更新 canonical URL
    setIsCanonicalManuallyEdited(false);
  };

  const handleCanonicalUrlChange = (value: string) => {
    updateEditableField("canonical", value);
    // 标记 canonical URL 已被用户手动修改
    setIsCanonicalManuallyEdited(true);
  };

  // 根据 lastCheckResult 计算 slugConflict
  const slugConflict = useMemo(() => {
    if (!lastCheckResult) return null;
    return {
      exists: lastCheckResult.exists,
      fullSlug: lastCheckResult.full_slug,
    };
  }, [lastCheckResult]);

  // 构造预览用的 Storyblok story 数据
  const previewStoryData = useMemo<IBlogStory | null>(() => {
    if (!result?.richtext) return null;

    return {
      id: 0, // 预览用临时ID
      name: editableFields.heading_h1 || "Preview",
      slug: editableFields.slug || "preview",
      full_slug: `blog/${editableFields.slug || "preview"}`,
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      uuid: "preview-uuid",
      content: {
        author_id: editableFields.author_id || "",
        body: result.richtext,
        canonical: editableFields.canonical || "",
        cover: {
          id: 0,
          alt: editableFields.coverAlt || "",
          name: "",
          focus: "",
          title: "",
          source: "",
          filename: editableFields.coverUrl || "",
          copyright: "",
          fieldtype: "asset",
          meta_data: {},
          is_external_url: false,
        },
        cta: [],
        date: editableFields.date || new Date().toISOString().split("T")[0],
        title: editableFields.heading_h1 || "",
        description: editableFields.seo_description || "",
        feature_and_summary: [],
        heading_h1: editableFields.heading_h1 || "",
        reading_time: editableFields.reading_time.toString() + " min",
        is_show_newsletter_dialog: editableFields.is_show_newsletter_dialog,
      },
    };
  }, [result?.richtext, editableFields]);

  // 计算默认Canonical URL（纯计算，不包含副作用）
  const defaultCanonicalUrl = useMemo(() => {
    const blogPath =
      editableFields.language === "ja" ? JP_BLOG_PATH : EN_BLOG_PATH;
    const slug = editableFields.slug;
    if (slug) {
      return `${NOTTA_HOST}${blogPath}/${slug}`;
    }
    return "";
  }, [editableFields.language, editableFields.slug]);

  // 当 slug 或 language 改变时，自动更新 canonical URL
  useEffect(() => {
    // 只有当用户没有手动修改 canonical URL，且计算出的 canonical URL 与当前值不同时才更新
    if (
      !isCanonicalManuallyEdited &&
      defaultCanonicalUrl &&
      editableFields.canonical !== defaultCanonicalUrl
    ) {
      updateEditableField("canonical", defaultCanonicalUrl);
    }
  }, [
    defaultCanonicalUrl,
    editableFields.canonical,
    updateEditableField,
    isCanonicalManuallyEdited,
  ]);

  const handleCoverImageChange = (value: string) => {
    updateEditableField("coverUrl", value);
  };

  const handleCoverImageAltChange = (value: string) => {
    updateEditableField("coverAlt", value);
  };

  const handleBack = () => {
    if (previewMode) {
      setPreviewMode(false);
    } else {
      setShowBackConfirmModal(true);
    }
  };

  const handleConfirmBack = () => {
    setShowBackConfirmModal(false);
    resetWorkflow();
  };

  const handleCancelBack = () => {
    setShowBackConfirmModal(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Configuring Content Fields
          {result?.firstH1Title && (
            <span className={styles.document_name}>
              for "{result.firstH1Title}"
            </span>
          )}
        </h1>
      </div>
      <div className={styles.content}>
        <div className={styles.form_container_wrapper_outer}>
          <div className={styles.form_container_wrapper}>
            {previewMode ? (
              <>
                {/* 预览模式 */}
                <div className={styles.preview_container}>
                  {/* <div className={styles.preview_card}>
                    <BlogCard
                      title={editableFields.heading_h1}
                      description={editableFields.seo_description}
                      author={
                        editableFields.language === "ja"
                          ? JP_AUTHOR_MAP[
                              editableFields.author_id as keyof typeof JP_AUTHOR_MAP
                            ]
                          : EN_AUTHOR_MAP[
                              editableFields.author_id as keyof typeof EN_AUTHOR_MAP
                            ]
                      }
                      readingTime={
                        editableFields.reading_time.toString() +
                        " " +
                        (editableFields.reading_time <= 1
                          ? "minute"
                          : "minutes")
                      }
                      publishDate={new Date().toISOString().split("T")[0]}
                      coverImage={editableFields.coverUrl}
                      showExternalIcon={true}
                    />
                  </div> */}
                  {/* Pre-publish Check */}
                  <div className={styles.pre_publish_container}>
                    <PrePublishCheck
                      slug={editableFields.slug}
                      language={editableFields.language as "en" | "ja"}
                      onCheckSlug={checkSlug}
                      isChecking={isCheckingUrl}
                      lastCheckResult={lastCheckResult}
                    />
                  </div>
                  {/* SEO meta */}
                  <div className={styles.seo_meta_container}>
                    <SeoMetaCard
                      title={editableFields.seo_title}
                      description={editableFields.seo_description}
                      canonical={editableFields.canonical}
                      editable={false}
                    />
                  </div>

                  {/* Blog Content Preview */}
                  {previewStoryData && (
                    <div className={styles.blog_content_preview}>
                      <StoryblokBlogDisplay storyData={previewStoryData} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 编辑模式 */}
                <div className={styles.form_container}>
                  {/* 文章标题 */}
                  <FormItem label="Article Title" required>
                    <Input
                      id="title"
                      value={editableFields.heading_h1}
                      onChange={handleTitleInputChange}
                      placeholder="Enter your article title"
                    />
                    <Tab
                      items={titleTabItems}
                      defaultActiveId={currentTabId}
                      onChange={handleTitleTabChange}
                      className={styles.article_title_tab}
                    />
                  </FormItem>

                  {/* 语言选择 */}
                  <FormItem label="Language / 言語" required>
                    <Dropdown
                      options={languageOptions}
                      value={editableFields.language}
                      defaultValue={result?.aiMeta?.language || "en"}
                      placeholder="Select language"
                      searchable={false}
                      onChange={handleLanguageChange}
                    />
                  </FormItem>

                  {/* SEO title */}
                  <FormItem label="SEO Title" required>
                    <Input
                      id="seo-title"
                      value={editableFields.seo_title}
                      onChange={handleSeoTitleInputChange}
                      placeholder="Enter your SEO title"
                    />
                  </FormItem>

                  {/* SEO description */}
                  <FormItem label="SEO Description" required>
                    <Input
                      id="seo-description"
                      value={editableFields.seo_description}
                      onChange={handleSeoDescriptionInputChange}
                      placeholder="Enter your SEO description"
                    />
                  </FormItem>

                  {/* 文章 Slug */}
                  <FormItem label="Article Slug" required>
                    <Input
                      id="article-slug"
                      value={editableFields.slug}
                      onChange={handleArticleSlugChange}
                      placeholder="Enter your article slug"
                    />
                  </FormItem>

                  {/* Canonical URL */}
                  <FormItem label="Canonical URL" required>
                    <Input
                      id="canonical-url"
                      value={editableFields.canonical || defaultCanonicalUrl}
                      onChange={handleCanonicalUrlChange}
                      placeholder="Will be auto-generated based on language and slug"
                    />
                  </FormItem>

                  {/* 文章阅读时间 */}
                  <FormItem label="Reading Time" required>
                    <div className={styles.reading_time_container}>
                      <NumberStepper
                        min={1}
                        value={editableFields.reading_time}
                        onChange={handleReadingTimeChange}
                      />
                      <span className={styles.reading_time_unit}>
                        {editableFields.reading_time <= 1
                          ? "minute"
                          : "minutes"}
                      </span>
                    </div>
                  </FormItem>

                  {/* 文章封面 */}
                  <FormItem label="Article Cover" required>
                    <ImagePreview
                      fullWidth={true}
                      aspectRatio={16 / 9}
                      imageUrl={editableFields.coverUrl}
                      altText={editableFields.coverAlt}
                      onImageUrlChange={handleCoverImageChange}
                      onAltTextChange={handleCoverImageAltChange}
                    />
                  </FormItem>

                  {/* 文章作者 */}
                  <FormItem label="Article Author" required>
                    <Dropdown
                      options={authorOptions}
                      value={editableFields.author_id}
                      defaultValue={getDefaultAuthorId()}
                      placeholder="Select author"
                      searchable={true}
                      onChange={handleAuthorChange}
                    />
                  </FormItem>
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.actions_container}>
          <div className={styles.actions_content}>
            {/* AI Fallback Warning */}
            {!previewMode && aiAnalysis.usedFallback && (
              <div className={styles.fallback_warning}>
                <div className={styles.fallback_warning_header}>
                  <AlertTriangle size={16} />
                  <strong>AI Analysis Failed</strong>
                </div>
                <p className={styles.fallback_warning_text}>
                  The AI request failed, and fallback data is being used. You
                  can manually edit the fields or click the "Regenerate AI"
                  button below to try again.
                </p>
              </div>
            )}

            {/* 发布 */}
            <div className={styles.actions_item}>
              <Button
                className={`${styles.actions_button}`}
                onClick={handleNextStep}
                disabled={
                  publishState.isPublishing || (previewMode && isCheckingUrl)
                }
              >
                <div className={styles.actions_button_container}>
                  {previewMode ? (
                    <>
                      {isCheckingUrl ? (
                        <>
                          <div className={styles.spinner}></div>
                          Checking...
                        </>
                      ) : slugConflict?.exists ? (
                        <>
                          <SquarePen size={16} /> Update Story
                        </>
                      ) : (
                        <>
                          <Rss size={16} /> Publish
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight size={16} />
                    </>
                  )}
                </div>
              </Button>

              {/* URL 冲突警告提示 */}
              {previewMode && slugConflict?.exists && !isCheckingUrl && (
                <div className={styles.conflict_warning}>
                  <strong>Warning:</strong> This URL already exists in
                  Storyblok. Publishing will overwrite the existing content.
                </div>
              )}
            </div>
            {/* 重新生成AI */}
            {!previewMode && (
              <div className={styles.actions_item}>
                <Button
                  className={styles.actions_button}
                  onClick={handleRegenerateAi}
                  variant="secondary"
                  disabled={aiAnalysis.isAnalyzing}
                >
                  <div className={styles.actions_button_container}>
                    {aiAnalysis.isAnalyzing ? (
                      <>
                        <div className={styles.spinner}></div>
                        Regenerating...
                      </>
                    ) : (
                      <>Regenerate AI</>
                    )}
                  </div>
                </Button>
                <span className={styles.regenerate_ai_description}>
                  If you are not satisfied with the AI generated content, you
                  can regenerate it.{" "}
                  <strong>
                    If language is not correct, please change the language
                    first.
                  </strong>
                </span>
              </div>
            )}
            {/* cancel 回到上一步 */}
            <div className={styles.actions_item}>
              <Button variant="outline" onClick={handleBack}>
                <div className={styles.actions_button_container}>
                  <ArrowLeft size={16} />
                  Back
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showBackConfirmModal}
        onClose={handleCancelBack}
        title="Confirm Go Back"
        primaryAction={{
          label: "Confirm",
          onClick: handleConfirmBack,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: handleCancelBack,
          variant: "outline",
        }}
      >
        <p>
          If you go back to the previous step, your current editing progress
          will not be saved. Are you sure you want to continue?
        </p>
      </Modal>
    </div>
  );
}
