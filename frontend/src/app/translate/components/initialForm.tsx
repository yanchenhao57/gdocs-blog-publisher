"use client";

import React, { useState } from "react";
import { Rocket, AlertTriangle, CheckCircle } from "lucide-react";
import Input from "../../../components/input";
import FormItem from "../../../components/form-item";
import Button from "../../../components/button";
import MultiSelectDropdown from "../../../components/multi-select-dropdown";
import { AVAILABLE_LANGUAGES, INITIAL_LANGUAGES } from "../../../constants/languages";

interface TranslateInitialFormProps {
  onSubmit: (data: { link: string; targetLanguages: string[] }) => void;
}

const TranslateInitialForm: React.FC<TranslateInitialFormProps> = ({
  onSubmit,
}) => {
  const [link, setLink] = useState("en/tools/audio-to-text-converter");
  const [targetLanguages, setTargetLanguages] = useState<string[]>(INITIAL_LANGUAGES);
  const [linkError, setLinkError] = useState("");
  const [languagesError, setLanguagesError] = useState("");
  const [isLinkValid, setIsLinkValid] = useState(false);

  // 验证 Storyblok 链接
  const validateLink = (value: string): boolean => {
    if (!value.trim()) {
      setLinkError("");
      setIsLinkValid(false);
      return false;
    }

    setLinkError("");
    setIsLinkValid(true);
    return true;
  };

  // 处理链接输入变化
  const handleLinkChange = (value: string) => {
    setLink(value);
    validateLink(value);
  };

  // 处理语言选择变化
  const handleLanguagesChange = (values: string[]) => {
    setTargetLanguages(values);
    if (values.length > 0) {
      setLanguagesError("");
    }
  };

  // 验证表单
  const validateForm = (): boolean => {
    let isValid = true;

    if (!link.trim()) {
      setLinkError("请输入 Storyblok 页面链接");
      isValid = false;
    } else if (!validateLink(link)) {
      isValid = false;
    }

    if (targetLanguages.length === 0) {
      setLanguagesError("请至少选择一种目标语言");
      isValid = false;
    } else {
      setLanguagesError("");
    }

    return isValid;
  };

  // 处理表单提交
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({ link, targetLanguages });
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "42rem",
        padding: "0 16px",
      }}
    >
      <h1
        style={{
          fontSize: "2.25rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "0.5rem",
          color: "#000000",
        }}
      >
        Storyblok 多语言翻译工具
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "1rem",
          color: "#6b7280",
          marginBottom: "2rem",
        }}
      >
        轻松将 Storyblok 页面翻译成多种语言
      </p>

      <div style={{ marginBottom: "1.5rem" }}>
        {/* Storyblok 链接输入 */}
        <FormItem label="Storyblok 页面链接" required>
          <Input
            type="url"
            value={link}
            onChange={handleLinkChange}
            onKeyDown={handleKeyDown}
            placeholder=""
            error={!!linkError}
            valid={isLinkValid}
          />

          {/* 错误提示 */}
          {linkError && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={16} />
              {linkError}
            </div>
          )}

          {/* 成功提示 */}
          {isLinkValid && !linkError && (
            <div
              style={{
                color: "#10b981",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <CheckCircle size={16} />
              有效的 Storyblok 链接
            </div>
          )}
        </FormItem>

        {/* 目标语言多选 */}
        <div style={{ marginTop: "1.5rem" }}>
          <FormItem label="目标语言" required>
            <MultiSelectDropdown
              options={AVAILABLE_LANGUAGES}
              value={targetLanguages}
              onChange={handleLanguagesChange}
              placeholder="选择要翻译的目标语言"
              searchable={true}
            />

          {/* 错误提示 */}
          {languagesError && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={16} />
              {languagesError}
            </div>
          )}

          {/* 已选语言提示 */}
          {targetLanguages.length > 0 && (
            <div
              style={{
                color: "#6b7280",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              已选择 {targetLanguages.length} 种语言
            </div>
          )}
          </FormItem>
        </div>

        {/* 提交按钮 */}
        <div style={{ marginTop: "2rem" }}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={!isLinkValid || targetLanguages.length === 0}
            icon={<Rocket size={20} />}
          >
            开始翻译
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TranslateInitialForm;

