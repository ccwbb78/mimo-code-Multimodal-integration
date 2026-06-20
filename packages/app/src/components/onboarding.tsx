import { createSignal, Show, For, onMount, onCleanup, createEffect } from "solid-js"
import { Button } from "@mimo-ai/ui/button"
import { IconButton } from "@mimo-ai/ui/icon-button"
import { Icon } from "@mimo-ai/ui/icon"
import { useLanguage } from "@/context/language"
import { useDialog } from "@mimo-ai/ui/context/dialog"

type OnboardingStep = {
  title: string
  description: string
  icon: string
  target?: string
}

function getSteps(language: ReturnType<typeof useLanguage>): OnboardingStep[] {
  return [
    {
      title: language.t("onboarding.step1.title"),
      description: language.t("onboarding.step1.description"),
      icon: "folder-add-left",
    },
    {
      title: language.t("onboarding.step2.title"),
      description: language.t("onboarding.step2.description"),
      icon: "bubble-5",
    },
    {
      title: language.t("onboarding.step3.title"),
      description: language.t("onboarding.step3.description"),
      icon: "checklist",
    },
    {
      title: language.t("onboarding.step4.title"),
      description: language.t("onboarding.step4.description"),
      icon: "terminal",
    },
    {
      title: language.t("onboarding.step5.title"),
      description: language.t("onboarding.step5.description"),
      icon: "settings",
    },
  ]
}

export function DialogOnboardingAsk() {
  const language = useLanguage()
  const dialog = useDialog()

  const handleYes = () => {
    localStorage.setItem("mimo-onboarding-done", "true")
    dialog.close()
  }

  const handleNo = () => {
    dialog.close()
    setTimeout(() => {
      dialog.show(() => <DialogOnboardingGuide />)
    }, 200)
  }

  return (
    <div class="flex flex-col items-center gap-6 p-6 max-w-md">
      <div class="flex flex-col items-center gap-3">
        <div class="w-16 h-16 rounded-2xl bg-surface-raised-base flex items-center justify-center">
          <Icon name="bubble-5" size="large" />
        </div>
        <h2 class="text-18-medium text-text-strong">{language.t("onboarding.ask.title")}</h2>
        <p class="text-14-regular text-text-base text-center" style={{ "line-height": "var(--line-height-normal)" }}>
          {language.t("onboarding.ask.description")}
        </p>
      </div>
      <div class="flex gap-3 w-full">
        <Button size="large" variant="ghost" class="flex-1" onClick={handleNo}>
          {language.t("onboarding.ask.no")}
        </Button>
        <Button size="large" variant="primary" class="flex-1" onClick={handleYes}>
          {language.t("onboarding.ask.yes")}
        </Button>
      </div>
    </div>
  )
}

export function DialogOnboardingGuide() {
  const language = useLanguage()
  const dialog = useDialog()
  const [currentStep, setCurrentStep] = createSignal(0)
  const steps = () => getSteps(language)

  const handleNext = () => {
    if (currentStep() < steps().length - 1) {
      setCurrentStep(currentStep() + 1)
    } else {
      finishOnboarding()
    }
  }

  const handlePrev = () => {
    if (currentStep() > 0) {
      setCurrentStep(currentStep() - 1)
    }
  }

  const finishOnboarding = () => {
    localStorage.setItem("mimo-onboarding-done", "true")
    dialog.close()
  }

  const handleSkip = () => {
    finishOnboarding()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      handleSkip()
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown, true)
  })

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown, true)
  })

  return (
    <div class="flex flex-col w-[480px] max-w-[90vw]">
      {/* Header */}
      <div class="flex items-center justify-between px-6 pt-5 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-14-medium text-text-strong">{language.t("onboarding.guide.title")}</span>
          <span class="text-12-regular text-text-weak">
            {currentStep() + 1} / {steps().length}
          </span>
        </div>
        <Button variant="ghost" size="small" onClick={handleSkip}>
          {language.t("onboarding.guide.skip")}
        </Button>
      </div>

      {/* Progress bar */}
      <div class="px-6 pb-4">
        <div class="h-1 rounded-full bg-surface-base overflow-hidden">
          <div
            class="h-full rounded-full bg-icon-strong-base transition-all duration-300"
            style={{ width: `${((currentStep() + 1) / steps().length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div class="px-6 pb-6 flex flex-col items-center gap-5">
        <div class="w-20 h-20 rounded-2xl bg-surface-raised-base flex items-center justify-center">
          <Icon name={steps()[currentStep()].icon} size="large" />
        </div>
        <div class="flex flex-col items-center gap-2 text-center">
          <h3 class="text-16-medium text-text-strong">{steps()[currentStep()].title}</h3>
          <p
            class="text-14-regular text-text-base"
            style={{ "line-height": "var(--line-height-normal)" }}
          >
            {steps()[currentStep()].description}
          </p>
        </div>

        {/* Pointer illustration */}
        <div class="w-full flex justify-center py-2">
          <div class="relative">
            <svg width="200" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Pointer hand */}
              <path
                d="M100 10 L100 50 L85 40 L100 60 L115 40 L100 50 Z"
                fill="var(--icon-strong-base)"
                opacity="0.6"
              />
              {/* Dashed line to target */}
              <line
                x1="100"
                y1="60"
                x2="100"
                y2="75"
                stroke="var(--icon-base)"
                stroke-width="1.5"
                stroke-dasharray="4 4"
              />
              {/* Target dot */}
              <circle cx="100" cy="77" r="3" fill="var(--icon-strong-base)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Footer navigation */}
      <div class="flex items-center justify-between px-6 pb-5 pt-2 border-t border-border-weaker-base">
        <Button
          variant="ghost"
          size="normal"
          onClick={handlePrev}
          classList={{ invisible: currentStep() === 0 }}
        >
          {language.t("onboarding.guide.prev")}
        </Button>
        <div class="flex gap-1.5">
          <For each={steps()}>
            {(_, i) => (
              <div
                class="w-2 h-2 rounded-full transition-all duration-200"
                classList={{
                  "bg-icon-strong-base": i() === currentStep(),
                  "bg-border-weak-base": i() !== currentStep(),
                }}
              />
            )}
          </For>
        </div>
        <Button variant="primary" size="normal" onClick={handleNext}>
          {currentStep() < steps().length - 1
            ? language.t("onboarding.guide.next")
            : language.t("onboarding.guide.finish")}
        </Button>
      </div>
    </div>
  )
}

export function shouldShowOnboarding(): boolean {
  if (typeof localStorage === "undefined") return false
  return localStorage.getItem("mimo-onboarding-done") !== "true"
}
