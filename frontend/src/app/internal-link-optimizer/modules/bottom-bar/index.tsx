import TabBar from "@/components/tab-bar";
import styles from "./index.module.css";
import { useInternalLinkOptimizerStore } from "@/stores/internalLinkOptimizerStore";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const BottomBar = () => {
  const { currentStep, completedSteps, goBackToInput, goToStep } =
    useInternalLinkOptimizerStore();
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const othersBarRef = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(false);

  const handleTabClick = (stepId: string) => {
    if (stepId === "input") {
      goBackToInput();
    } else {
      goToStep(stepId as any);
    }
  };

  const btnNodeMap: Record<string, React.ReactElement> = {
    input: (
      <button
        className={`${styles.bottom_bar_btn} ${styles.button_fade_in}`}
        id="input-btn"
      >
        Confirm & Analyze
      </button>
    ),
    suggestions: (
      <button
        className={`${styles.bottom_bar_btn} ${styles.button_fade_in}`}
        id="suggestions-btn"
      >
        Proceed to Export
      </button>
    ),
    optimization: (
      <button
        className={`${styles.bottom_bar_btn} ${styles.button_fade_in}`}
        id="optimization-btn"
      >
        Continue Optimization
      </button>
    ),
    output: (
      <button
        className={`${styles.bottom_bar_btn} ${styles.button_fade_in}`}
        id="output-btn"
      >
        Publish
      </button>
    ),
  };

  // useEffect(() => {
  //   // 当步骤切换时，先隐藏按钮
  //   setShowButton(false);

  //   // 获取当前容器的宽度作为基础
  //   let currentWidth = 0;
  //   if (contentInnerRef.current) {
  //     const commonBarWidth =
  //       contentInnerRef.current
  //         .querySelector(`.${styles.common_bar}`)
  //         ?.getBoundingClientRect().width || 0;
  //     currentWidth = commonBarWidth;

  //     // 先设置为只有 TabBar 的宽度
  //     contentInnerRef.current.style.setProperty("--width", `${currentWidth}px`);
  //   }

  //   // 延迟 200ms 先扩展宽度
  //   const widthTimer = setTimeout(() => {
  //     if (contentInnerRef.current) {
  //       // 创建临时按钮来测量宽度
  //       const tempButton = document.createElement("button");
  //       tempButton.className = styles.bottom_bar_btn;
  //       tempButton.textContent = getCurrentStepButtonText();
  //       tempButton.style.visibility = "hidden";
  //       tempButton.style.position = "absolute";
  //       document.body.appendChild(tempButton);

  //       const buttonWidth = tempButton.getBoundingClientRect().width;
  //       document.body.removeChild(tempButton);

  //       const marginWidth = 18; // margin-left: 18px
  //       const newTotalWidth = currentWidth + buttonWidth + marginWidth;

  //       // 设置新的宽度，触发动画
  //       contentInnerRef.current.style.setProperty(
  //         "--width",
  //         `${newTotalWidth}px`
  //       );
  //     }
  //   }, 2000);

  //   // 延迟 800ms 后显示按钮（500ms 宽度扩展触发 + 300ms CSS transition 完成）
  //   const buttonTimer = setTimeout(() => {
  //     setShowButton(true);
  //   }, 2900);

  //   // 清理函数
  //   return () => {
  //     clearTimeout(widthTimer);
  //     clearTimeout(buttonTimer);
  //   };
  // }, [currentStep]);

  // 获取当前步骤对应的按钮文本
  const getCurrentStepButtonText = () => {
    const textMap = {
      input: "Confirm & Analyze",
      suggestions: "Proceed to Export",
      optimization: "Continue Optimization",
      output: "Publish",
    };
    return textMap[currentStep] || "";
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.content_inner} ref={contentInnerRef}>
          <div className={styles.common_bar}>
            <TabBar
              currentStep={currentStep}
              completedSteps={completedSteps}
              onTabClick={handleTabClick}
            />
          </div>
          {/* <div className={styles.others_bar} ref={othersBarRef}>
            {showButton && btnNodeMap[currentStep]}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
