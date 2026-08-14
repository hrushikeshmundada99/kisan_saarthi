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

    let selector = step.target;
    let el = document.querySelector(selector);

    if (step.target.includes('nav-')) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        const mobileSelector = step.target.replace('nav-', 'mobile-nav-');
        const mobileEl = document.querySelector(mobileSelector);
        if (mobileEl) {
          el = mobileEl;
        }
      }
    }

    if (el) {
      // Scroll target element into view smoothly if not visible (except fixed bottom nav)
      const isFixedBottom = el.closest('nav') && window.innerWidth < 1024;
      if (!isFixedBottom) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } catch {}
      }

      // Immediate & delayed rect calculation for smooth scroll animation
      const compute = () => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
        } else {
          setTargetRect(null);
        }
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

  // Update target rect whenever step or isOpen changes
  useEffect(() => {
    if (!isOpen) return;

    updateTargetRect();

    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        updateTargetRect();
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [isOpen, currentStepIndex, updateTargetRect]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('KISAN_SAARTHI_ONBOARDING_COMPLETED', 'true');
    } catch {}
    onClose();
  };

  const currentTitle = isMr ? step.title.mr : step.title.en;
  const currentDesc = isMr ? step.description.mr : step.description.en;

  const isCenteredModal = !step.target || step.placement === 'center' || !targetRect;

  // Calculate dynamic tooltip positioning to NEVER obscure target element and ALWAYS stay visible on screen
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCenteredModal || !targetRect) return {};

    const padding = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 768;
    const tooltipWidth = Math.min(400, vw - (padding * 2));
    const estimatedHeight = tooltipRef.current?.offsetHeight || 250;

    let left = padding;
    let top = padding;

    if (isMobile) {
      // On Mobile: Center horizontally
      left = Math.max(padding, (vw - tooltipWidth) / 2);

      // Check vertical placement:
      // If target is in the lower 50% of viewport or near bottom nav, place tooltip ABOVE target
      if (targetRect.top > vh * 0.45 || targetRect.bottom + estimatedHeight + 75 > vh) {
        // Place ABOVE
        top = Math.max(padding + 55, targetRect.top - estimatedHeight - 16);
      } else {
        // Place BELOW
        top = Math.min(vh - estimatedHeight - 75, targetRect.bottom + 16);
      }
    } else {
      // Desktop / Laptop positioning
      if (step.placement === 'right' || (targetRect.left < 280 && vw > 1024)) {
        left = targetRect.right + 16;
        top = Math.max(padding, Math.min(vh - estimatedHeight - padding, targetRect.top - 10));

        // If sidebar tooltip overflows right edge on narrow screen, place above or below
        if (left + tooltipWidth > vw - padding) {
          left = Math.max(padding, (vw - tooltipWidth) / 2);
          if (targetRect.bottom + estimatedHeight + padding > vh) {
            top = Math.max(padding, targetRect.top - estimatedHeight - 16);
          } else {
            top = targetRect.bottom + 16;
          }
        }
      } else if (targetRect.bottom + estimatedHeight + padding > vh) {
        // Target near bottom of viewport -> place ABOVE
        left = Math.max(padding, Math.min(vw - tooltipWidth - padding, targetRect.left));
        top = Math.max(padding, targetRect.top - estimatedHeight - 16);
      } else {
        // Default place BELOW
        left = Math.max(padding, Math.min(vw - tooltipWidth - padding, targetRect.left));
        top = targetRect.bottom + 16;
      }
    }

    // Hard boundary safeguard: Dialog box NEVER clips off screen or behind bottom nav bar
    const bottomClearance = isMobile ? 75 : padding;
    const topClearance = isMobile ? 60 : padding;

    if (top + estimatedHeight > vh - bottomClearance) {
      top = Math.max(topClearance, vh - estimatedHeight - bottomClearance);
    }
    if (top < topClearance) {
      top = topClearance;
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
      maxWidth: `${tooltipWidth}px`,
      width: `${tooltipWidth}px`
    };
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans pointer-events-none">
      
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
          fill="rgba(0, 0, 0, 0.68)"
          mask="url(#spotlight-mask-clear)"
        />
      </svg>

      {/* Target Element Bright Pulsing Gold Border Ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-[101] border-3 border-[#FFB300] rounded-2xl shadow-[0_0_35px_rgba(255,179,0,0.85)] animate-pulse transition-all duration-300"
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
        className={`fixed z-[102] transition-all duration-300 pointer-events-auto ${
          isCenteredModal
            ? 'inset-0 flex items-center justify-center p-4'
            : ''
        }`}
        style={getTooltipStyle()}
      >
        <div
          ref={tooltipRef}
          className="w-full bg-[#FFFFFF] rounded-3xl border-2 border-[#FFB300] p-4 sm:p-6 shadow-2xl shadow-emerald-950/40 animate-in zoom-in-95 duration-200 space-y-3 sm:space-y-4"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-[#E2ECE2] pb-2 sm:pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-[#FFB300] text-[#0F291E] flex items-center justify-center font-black text-xs shadow-xs">
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
          <div className="space-y-1.5 sm:space-y-2">
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
            <p className="text-xs sm:text-sm text-[#526058] font-semibold leading-relaxed whitespace-pre-line">
              {currentDesc}
            </p>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-[#E2ECE2] gap-2">
            
            {/* Skip Link */}
            {!isLastStep ? (
              <button
                onClick={handleSkip}
                className="text-xs font-bold text-[#526058] hover:text-[#0F291E] underline cursor-pointer"
              >
                {isMr ? 'मार्गदर्शन सोडा' : 'Skip'}
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              {/* Back Button */}
              {!isFirstStep && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBack}
                  className="rounded-xl min-h-[36px] sm:min-h-[38px] px-3 font-bold border-2 text-xs cursor-pointer"
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
                className="rounded-xl min-h-[36px] sm:min-h-[38px] px-4 font-black text-xs shadow-md cursor-pointer"
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
