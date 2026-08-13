import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ONBOARDING_STEPS, type OnboardingStep } from '../data/onboardingSteps';
import { Button } from './Button';
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  initialStepIndex?: number;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  initialStepIndex = 0
}) => {
  const { i18n } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const isMr = i18n.language === 'mr';
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Reset to initial step index whenever tour is freshly opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(initialStepIndex);
    }
  }, [isOpen, initialStepIndex]);

  const step: OnboardingStep = ONBOARDING_STEPS[currentStepIndex] || ONBOARDING_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  // Function to calculate target element bounding rect & scroll it into view
  const updateTargetRect = useCallback(() => {
    if (!step || !step.target || step.placement === 'center') {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.target);
    if (el) {
      // Scroll target element into view smoothly if not visible
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

      // Immediate & delayed rect calculation for smooth scroll animation
      const compute = () => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      };

      compute();
      const timer1 = setTimeout(compute, 150);
      const timer2 = setTimeout(compute, 350);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setTargetRect(null);
    }
  }, [step]);

  // Update target rect whenever step or isOpen changes (smooth and lightweight)
  useEffect(() => {
    if (!isOpen) return;

    updateTargetRect();

    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (step && step.target) {
          const el = document.querySelector(step.target);
          if (el) {
            setTargetRect(el.getBoundingClientRect());
          }
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [isOpen, currentStepIndex, updateTargetRect, step]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('KISAN_SAARTHI_ONBOARDING_COMPLETED', 'true');
    } catch {
      // Ignore storage errors
    }
    onClose();
  };

  const currentTitle = isMr ? step.title.mr : step.title.en;
  const currentDesc = isMr ? step.description.mr : step.description.en;

  const isCenteredModal = !step.target || step.placement === 'center' || !targetRect;

  // Calculate dynamic tooltip positioning to NEVER obscure target element
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCenteredModal || !targetRect) return {};

    const tooltipWidth = 400;
    const tooltipHeight = 220;
    const padding = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = targetRect.left;
    let top = targetRect.bottom + 20;

    // Sidebar navigation steps (place to right of sidebar)
    if (step.placement === 'right' || targetRect.left < 280) {
      left = targetRect.right + 20;
      top = Math.max(padding, Math.min(vh - tooltipHeight - padding, targetRect.top));
    } 
    // Elements near bottom of viewport (place tooltip above target)
    else if (targetRect.bottom + tooltipHeight + 40 > vh) {
      top = Math.max(padding, targetRect.top - tooltipHeight - 20);
    }

    // Keep horizontal bounds within screen
    if (left + tooltipWidth > vw - padding) {
      left = Math.max(padding, vw - tooltipWidth - padding);
    }
    if (left < padding) left = padding;

    return {
      left: `${left}px`,
      top: `${top}px`
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans pointer-events-none">
      
      {/* Transparent SVG Mask Overlay: 100% Clear Cutout Over Target Element */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask-clear">
            {/* White canvas = dark overlay fill */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black rectangle cutout = 100% transparent clear view of target element */}
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="18"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Backdrop dark overlay */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.65)"
          mask="url(#spotlight-mask-clear)"
        />
      </svg>

      {/* Target Element Bright Pulsing Gold Border Ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-50 border-3 border-[#FFB300] rounded-2xl shadow-[0_0_35px_rgba(255,179,0,0.85)] animate-pulse transition-all duration-300"
          style={{
            left: `${targetRect.left - 8}px`,
            top: `${targetRect.top - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`
          }}
        />
      )}

      {/* Tour Step Dialog Box */}
      <div
        className={`fixed z-50 transition-all duration-300 pointer-events-auto ${
          isCenteredModal
            ? 'inset-0 flex items-center justify-center p-4'
            : 'p-2 sm:p-4'
        }`}
        style={getTooltipStyle()}
      >
        <div
          ref={tooltipRef}
          className="w-full max-w-md bg-[#FFFFFF] rounded-3xl border-2 border-[#FFB300] p-5 sm:p-6 shadow-2xl shadow-emerald-950/40 animate-in zoom-in-95 duration-200 space-y-4"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-[#E2ECE2] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#FFB300] text-[#0F291E] flex items-center justify-center font-black text-xs shadow-xs">
                {currentStepIndex + 1}
              </span>
              <span className="text-xs font-black text-[#526058] tracking-wide uppercase">
                {isMr ? `टप्पा ${currentStepIndex + 1} पैकी ${ONBOARDING_STEPS.length}` : `Step ${currentStepIndex + 1} of ${ONBOARDING_STEPS.length}`}
              </span>
            </div>

            {/* Skip / Close Button */}
            <button
              onClick={handleSkip}
              className="text-[#526058] hover:text-[#0F291E] p-1 rounded-xl hover:bg-[#F4F9F4] transition-colors cursor-pointer"
              title={isMr ? 'मार्गदर्शन बंद करा' : 'Close Tour'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isLastStep ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#FFB300] shrink-0" />
              )}
              <h3 className="text-base sm:text-lg font-black text-[#0F291E] leading-snug">
                {currentTitle}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#526058] font-medium leading-relaxed whitespace-pre-line">
              {currentDesc}
            </p>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E2ECE2] gap-2">
            
            {/* Skip Link */}
            {!isLastStep ? (
              <button
                onClick={handleSkip}
                className="text-xs font-bold text-[#526058] hover:text-[#0F291E] underline cursor-pointer"
              >
                {isMr ? 'मार्गदर्शन सोडा' : 'Skip Tour'}
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              {/* Back Button */}
              {!isFirstStep && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBack}
                  className="rounded-xl min-h-[38px] px-3 font-bold border-2 text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isMr ? 'मागे' : 'Back'}</span>
                </Button>
              )}

              {/* Next / Finish Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="rounded-xl min-h-[38px] px-4 font-black text-xs shadow-md"
              >
                <span>
                  {isLastStep
                    ? (isMr ? 'पूर्ण करा' : 'Finish')
                    : (isMr ? 'पुढे' : 'Next')}
                </span>
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
