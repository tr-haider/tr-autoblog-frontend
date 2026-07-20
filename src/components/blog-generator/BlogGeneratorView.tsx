import React, { useMemo } from 'react';
import { Box, Step, StepLabel, Stepper, useMediaQuery, useTheme } from '@mui/material';
import type {
  ContentTrackerRow,
  ManualLink,
  PortfolioItem,
  TechnologyRiversLink,
  Testimonial,
  VideoTestimonial,
} from '../../types';
import { WORKFLOW_STEPS } from './constants';
import { combineKeywords } from './utils';
import { buildResearchQuestionsPrompt } from './prompts';
import { TopicBanner } from './shared/TopicBanner';
import { WorkflowFooter } from './shared/WorkflowFooter';
import { ConfigurationStep } from './steps/ConfigurationStep';
import { ExternalAssetsStep } from './steps/ExternalAssetsStep';
import { GenerateStep } from './steps/GenerateStep';
import { InternalLinkingStep } from './steps/InternalLinkingStep';
import { PortfolioStep } from './steps/PortfolioStep';
import { ResearchStep } from './steps/ResearchStep';
import { TestimonialsServicesStep } from './steps/TestimonialsServicesStep';
import { TopicMetadataStep } from './steps/TopicMetadataStep';

export interface BlogGeneratorViewProps {
  workflowStep: number;
  sheetTopics: ContentTrackerRow[];
  loadingTopics: boolean;
  selectedTopic: string;
  selectedRow: ContentTrackerRow | null;
  customTopic: string;
  primaryKeywords: string[];
  primaryKeywordInput: string;
  secondaryKeywords: string[];
  secondaryKeywordInput: string;
  tone: string;
  authorStyle: string;
  targetWordCount: number;
  includeRegulatoryInfo: boolean;
  researchQuestionsText: string;
  generatingQuestions: boolean;
  selectedLinks: string[];
  suggestedLinks: string[];
  manualLinks: ManualLink[];
  portfolioItems: PortfolioItem[];
  selectedPortfolioIds: string[];
  portfolioSummaries: Record<string, string>;
  testimonials: Testimonial[];
  videoTestimonials: VideoTestimonial[];
  selectedVideoIds: string[];
  selectedServices: string[];
  podcastLinks: string[];
  selectedPodcasts: string[];
  bookLink: string;
  externalLinks: string[];
  introInstructions: string;
  summaryInstructions: string;
  resourceLinks: TechnologyRiversLink[];
  blogLinks: TechnologyRiversLink[];
  dismissedLinks: string[];
  loadingLinks: boolean;
  loading: boolean;
  onStepChange: (step: number) => void;
  onRefreshTopics: () => void;
  onTopicSelect: (row: ContentTrackerRow) => void;
  onClearTopic: () => void;
  onCustomTopicChange: (value: string) => void;
  onPrimaryKeywordInputChange: (value: string) => void;
  onAddPrimaryKeyword: () => void;
  onRemovePrimaryKeyword: (keyword: string) => void;
  onSecondaryKeywordInputChange: (value: string) => void;
  onAddSecondaryKeyword: () => void;
  onRemoveSecondaryKeyword: (keyword: string) => void;
  onMetadataChange: (field: keyof ContentTrackerRow, value: string) => void;
  onToneChange: (value: string) => void;
  onAuthorStyleChange: (value: string) => void;
  onTargetWordCountChange: (n: number) => void;
  onIncludeRegulatoryChange: (v: boolean) => void;
  onGenerateQuestions: () => void;
  onResearchQuestionsTextChange: (text: string) => void;
  onToggleLink: (url: string) => void;
  onAddManualLink: (link: ManualLink) => void;
  onRemoveManualLink: (id: string) => void;
  onDismissLink: (url: string) => void;
  onRefreshLinks: () => void;
  onTogglePortfolio: (id: string) => void;
  onGeneratePortfolioSummary: (id: string) => void;
  onAddTestimonial: (t: Testimonial) => void;
  onRemoveTestimonial: (id: string) => void;
  onToggleVideo: (id: string) => void;
  onToggleService: (service: string) => void;
  onTogglePodcast: (url: string) => void;
  onBookLinkChange: (url: string) => void;
  onAddExternalLink: (url: string) => void;
  onRemoveExternalLink: (url: string) => void;
  onIntroChange: (v: string) => void;
  onSummaryChange: (v: string) => void;
  onGenerate: () => void;
}

function canContinueStep(
  step: number,
  props: Pick<
    BlogGeneratorViewProps,
    'selectedTopic' | 'customTopic' | 'primaryKeywords' | 'tone'
  >,
): boolean {
  const topic = props.selectedTopic || props.customTopic;
  switch (step) {
    case 0:
      return Boolean(topic) && props.primaryKeywords.length > 0;
    case 1:
      return Boolean(props.tone);
    default:
      return true;
  }
}

export function BlogGeneratorView(props: BlogGeneratorViewProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    workflowStep,
    selectedTopic,
    selectedRow,
    customTopic,
    primaryKeywords,
    secondaryKeywords,
    loading,
    onStepChange,
    onGenerate,
  } = props;

  const activeTopic = selectedTopic || customTopic;
  const isLastStep = workflowStep === WORKFLOW_STEPS.length - 1;
  const canContinue = canContinueStep(workflowStep, props);
  const canGenerate = !loading && Boolean(activeTopic) && primaryKeywords.length > 0;

  const researchPrompt = useMemo(
    () =>
      buildResearchQuestionsPrompt({
        topic: activeTopic || '[topic]',
        primaryKeywords,
        secondaryKeywords,
      }),
    [activeTopic, primaryKeywords, secondaryKeywords],
  );

  const handleBack = () => onStepChange(Math.max(0, workflowStep - 1));
  const handleContinue = () => onStepChange(Math.min(WORKFLOW_STEPS.length - 1, workflowStep + 1));

  const renderStep = () => {
    switch (workflowStep) {
      case 0:
        return (
          <TopicMetadataStep
            sheetTopics={props.sheetTopics}
            loadingTopics={props.loadingTopics}
            selectedTopic={props.selectedTopic}
            selectedRow={props.selectedRow}
            customTopic={props.customTopic}
            primaryKeywords={props.primaryKeywords}
            primaryKeywordInput={props.primaryKeywordInput}
            secondaryKeywords={props.secondaryKeywords}
            secondaryKeywordInput={props.secondaryKeywordInput}
            onRefreshTopics={props.onRefreshTopics}
            onTopicSelect={props.onTopicSelect}
            onCustomTopicChange={props.onCustomTopicChange}
            onPrimaryKeywordInputChange={props.onPrimaryKeywordInputChange}
            onAddPrimaryKeyword={props.onAddPrimaryKeyword}
            onRemovePrimaryKeyword={props.onRemovePrimaryKeyword}
            onSecondaryKeywordInputChange={props.onSecondaryKeywordInputChange}
            onAddSecondaryKeyword={props.onAddSecondaryKeyword}
            onRemoveSecondaryKeyword={props.onRemoveSecondaryKeyword}
            onMetadataChange={props.onMetadataChange}
          />
        );
      case 1:
        return (
          <ConfigurationStep
            tone={props.tone}
            authorStyle={props.authorStyle}
            targetWordCount={props.targetWordCount}
            includeRegulatoryInfo={props.includeRegulatoryInfo}
            onToneChange={props.onToneChange}
            onAuthorStyleChange={props.onAuthorStyleChange}
            onTargetWordCountChange={props.onTargetWordCountChange}
            onIncludeRegulatoryChange={props.onIncludeRegulatoryChange}
          />
        );
      case 2:
        return (
          <ResearchStep
            questionsText={props.researchQuestionsText}
            generationPrompt={researchPrompt}
            generating={props.generatingQuestions}
            onGenerateQuestions={props.onGenerateQuestions}
            onQuestionsTextChange={props.onResearchQuestionsTextChange}
          />
        );
      case 3:
        return (
          <InternalLinkingStep
            topic={props.selectedTopic || props.customTopic}
            keywords={combineKeywords(props.primaryKeywords, props.secondaryKeywords)}
            selectedLinks={props.selectedLinks}
            suggestedLinks={props.suggestedLinks}
            manualLinks={props.manualLinks}
            resourceLinks={props.resourceLinks}
            blogLinks={props.blogLinks}
            dismissedLinks={props.dismissedLinks}
            loadingLinks={props.loadingLinks}
            onToggleLink={props.onToggleLink}
            onAddManualLink={props.onAddManualLink}
            onRemoveManualLink={props.onRemoveManualLink}
            onDismissLink={props.onDismissLink}
            onRefreshLinks={props.onRefreshLinks}
          />
        );
      case 4:
        return (
          <PortfolioStep
            items={props.portfolioItems}
            selectedIds={props.selectedPortfolioIds}
            summaries={props.portfolioSummaries}
            onToggle={props.onTogglePortfolio}
            onGenerateSummary={props.onGeneratePortfolioSummary}
          />
        );
      case 5:
        return (
          <TestimonialsServicesStep
            testimonials={props.testimonials}
            videoTestimonials={props.videoTestimonials}
            selectedVideoIds={props.selectedVideoIds}
            selectedServices={props.selectedServices}
            onAddTestimonial={props.onAddTestimonial}
            onRemoveTestimonial={props.onRemoveTestimonial}
            onToggleVideo={props.onToggleVideo}
            onToggleService={props.onToggleService}
          />
        );
      case 6:
        return (
          <ExternalAssetsStep
            podcastLinks={props.podcastLinks}
            selectedPodcasts={props.selectedPodcasts}
            bookLink={props.bookLink}
            externalLinks={props.externalLinks}
            onTogglePodcast={props.onTogglePodcast}
            onBookLinkChange={props.onBookLinkChange}
            onAddExternalLink={props.onAddExternalLink}
            onRemoveExternalLink={props.onRemoveExternalLink}
          />
        );
      case 7:
        return (
          <GenerateStep
            topic={activeTopic}
            tone={props.tone}
            authorStyle={props.authorStyle}
            primaryKeywords={props.primaryKeywords}
            secondaryKeywords={props.secondaryKeywords}
            researchQuestionsText={props.researchQuestionsText}
            selectedLinkCount={props.selectedLinks.length}
            selectedPortfolioCount={props.selectedPortfolioIds.length}
            testimonialCount={props.testimonials.length}
            selectedServiceCount={props.selectedServices.length}
            selectedPodcastCount={props.selectedPodcasts.length}
            externalLinkCount={props.externalLinks.length + (props.bookLink ? 1 : 0)}
            introInstructions={props.introInstructions}
            summaryInstructions={props.summaryInstructions}
            onIntroChange={props.onIntroChange}
            onSummaryChange={props.onSummaryChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 2 }}>
      <TopicBanner
        activeTopic={activeTopic}
        selectedRow={selectedRow}
        customTopic={customTopic}
        primaryKeywords={primaryKeywords}
        secondaryKeywords={secondaryKeywords}
        onClear={props.onClearTopic}
      />

      <Stepper activeStep={workflowStep} alternativeLabel={!isMobile} orientation={isMobile ? 'vertical' : 'horizontal'}>
        {WORKFLOW_STEPS.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 320 }}>{renderStep()}</Box>

      <WorkflowFooter
        step={workflowStep}
        totalSteps={WORKFLOW_STEPS.length}
        canContinue={isLastStep ? canGenerate : canContinue}
        isLastStep={isLastStep}
        loading={loading}
        onBack={handleBack}
        onContinue={handleContinue}
        onGenerate={onGenerate}
      />
    </Box>
  );
}
