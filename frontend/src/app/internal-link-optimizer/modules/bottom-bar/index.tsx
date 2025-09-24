import TabBar from "@/components/tab-bar";
import styles from "./index.module.css";
import { useInternalLinkOptimizerStore } from "@/stores/internalLinkOptimizerStore";

const BottomBar = () => {
  const { currentStep, completedSteps, goBackToInput, goToStep } =
    useInternalLinkOptimizerStore();

  const handleTabClick = (stepId: string) => {
    if (stepId === "input") {
      goBackToInput();
    } else {
      goToStep(stepId as any);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <TabBar
          currentStep={currentStep}
          completedSteps={completedSteps}
          onTabClick={handleTabClick}
        />
      </div>
    </div>
  );
};

export default BottomBar;
