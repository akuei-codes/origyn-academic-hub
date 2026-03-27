import { useCallback, useRef, useState } from 'react';
import type {
  ProcessMetrics,
  SessionMetrics,
  InputMetrics,
  RevisionMetrics,
  CompositionMetrics,
  TimelineEvent,
  WritingEventType,
} from '@/lib/types';

interface TrackerState {
  typedChars: number;
  pastedChars: number;
  pasteEvents: number;
  pasteSizes: number[];
  cutCount: number;
  deleteCount: number;
  backspaceCount: number;
  focusBlurCount: number;
  autosaveCount: number;
  insertionBursts: number;
  deletionBursts: number;
  burstLengths: number[];
  pauseCount: number;
  editsToEarlier: number;
  returnEdits: number;
  paragraphRewrites: number;
  revisionSnapshots: number[];
  timeline: TimelineEvent[];
  sessionStart: number;
  activeStart: number;
  activeTotal: number;
  isActive: boolean;
  lastKeystroke: number;
  lastWordCount: number;
  compositionOrder: string[];
}

const PAUSE_THRESHOLD_MS = 3000;
const BURST_THRESHOLD_MS = 200;

function initialState(): TrackerState {
  const now = Date.now();
  return {
    typedChars: 0,
    pastedChars: 0,
    pasteEvents: 0,
    pasteSizes: [],
    cutCount: 0,
    deleteCount: 0,
    backspaceCount: 0,
    focusBlurCount: 0,
    autosaveCount: 0,
    insertionBursts: 0,
    deletionBursts: 0,
    burstLengths: [],
    pauseCount: 0,
    editsToEarlier: 0,
    returnEdits: 0,
    paragraphRewrites: 0,
    revisionSnapshots: [],
    timeline: [],
    sessionStart: now,
    activeStart: now,
    activeTotal: 0,
    isActive: true,
    lastKeystroke: now,
    lastWordCount: 0,
    compositionOrder: [],
  };
}

export function useWritingTracker(pasteAllowed: boolean) {
  const stateRef = useRef<TrackerState>(initialState());
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  const addTimelineEvent = useCallback(
    (type: WritingEventType, wordCount: number, label?: string) => {
      const evt: TimelineEvent = {
        timestamp: new Date().toISOString(),
        type,
        word_count: wordCount,
        label,
      };
      stateRef.current.timeline.push(evt);
      setTimeline([...stateRef.current.timeline]);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, wordCount: number) => {
      const s = stateRef.current;
      const now = Date.now();

      // Detect pauses
      if (now - s.lastKeystroke > PAUSE_THRESHOLD_MS && s.lastKeystroke > 0) {
        s.pauseCount++;
      }

      // Detect bursts
      if (now - s.lastKeystroke < BURST_THRESHOLD_MS) {
        s.burstLengths[s.burstLengths.length - 1] =
          (s.burstLengths[s.burstLengths.length - 1] || 0) + 1;
      } else {
        s.burstLengths.push(1);
        s.insertionBursts++;
      }

      if (e.key === 'Backspace') {
        s.backspaceCount++;
        s.deletionBursts++;
      } else if (e.key === 'Delete') {
        s.deleteCount++;
        s.deletionBursts++;
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        s.typedChars++;
      }

      // Track active time
      if (!s.isActive) {
        s.activeStart = now;
        s.isActive = true;
      }

      s.lastKeystroke = now;
      s.lastWordCount = wordCount;
    },
    [],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent, wordCount: number) => {
      if (!pasteAllowed) {
        e.preventDefault();
        return;
      }
      const text = e.clipboardData.getData('text/plain');
      const s = stateRef.current;
      s.pastedChars += text.length;
      s.pasteEvents++;
      s.pasteSizes.push(text.length);
      addTimelineEvent('paste', wordCount, `Pasted ${text.length} chars`);
    },
    [pasteAllowed, addTimelineEvent],
  );

  const handleCut = useCallback(
    (_e: React.ClipboardEvent, wordCount: number) => {
      stateRef.current.cutCount++;
      addTimelineEvent('cut', wordCount);
    },
    [addTimelineEvent],
  );

  const handleFocus = useCallback(
    (wordCount: number) => {
      const s = stateRef.current;
      s.isActive = true;
      s.activeStart = Date.now();
      addTimelineEvent('focus', wordCount);
    },
    [addTimelineEvent],
  );

  const handleBlur = useCallback(
    (wordCount: number) => {
      const s = stateRef.current;
      if (s.isActive) {
        s.activeTotal += Date.now() - s.activeStart;
        s.isActive = false;
      }
      s.focusBlurCount++;
      addTimelineEvent('blur', wordCount);
    },
    [addTimelineEvent],
  );

  const recordAutosave = useCallback(
    (wordCount: number) => {
      stateRef.current.autosaveCount++;
      stateRef.current.revisionSnapshots.push(wordCount);
      addTimelineEvent('autosave', wordCount);
    },
    [addTimelineEvent],
  );

  const computeMetrics = useCallback((): ProcessMetrics => {
    const s = stateRef.current;
    const now = Date.now();
    const totalElapsed = (now - s.sessionStart) / 1000;
    const activeWriting =
      (s.activeTotal + (s.isActive ? now - s.activeStart : 0)) / 1000;
    const idle = totalElapsed - activeWriting;
    const totalInput = s.typedChars + s.pastedChars;

    const session: SessionMetrics = {
      total_sessions: 1,
      total_elapsed_seconds: Math.round(totalElapsed),
      active_writing_seconds: Math.round(activeWriting),
      idle_seconds: Math.round(idle),
      focus_blur_count: s.focusBlurCount,
      exits_and_returns: Math.floor(s.focusBlurCount / 2),
      autosave_count: s.autosaveCount,
      session_continuity:
        s.focusBlurCount <= 2 ? 'high' : s.focusBlurCount <= 6 ? 'medium' : 'low',
    };

    const pasteRatio = totalInput > 0 ? s.pastedChars / totalInput : 0;
    const input: InputMetrics = {
      typed_characters: s.typedChars,
      pasted_characters: s.pastedChars,
      paste_event_count: s.pasteEvents,
      paste_sizes: s.pasteSizes,
      cut_count: s.cutCount,
      delete_count: s.deleteCount,
      backspace_count: s.backspaceCount,
      insertion_bursts: s.insertionBursts,
      deletion_bursts: s.deletionBursts,
      avg_burst_length:
        s.burstLengths.length > 0
          ? Math.round(s.burstLengths.reduce((a, b) => a + b, 0) / s.burstLengths.length)
          : 0,
      pause_count: s.pauseCount,
      typed_vs_pasted_ratio: totalInput > 0 ? s.typedChars / totalInput : 1,
      paste_dependence:
        pasteRatio < 0.1 ? 'low' : pasteRatio < 0.4 ? 'medium' : 'high',
    };

    const deletionRatio =
      totalInput > 0 ? (s.backspaceCount + s.deleteCount) / totalInput : 0;
    const revision: RevisionMetrics = {
      edits_to_earlier_sections: s.editsToEarlier,
      return_edits: s.returnEdits,
      paragraph_rewrites: s.paragraphRewrites,
      revision_depth:
        deletionRatio < 0.1 ? 'low' : deletionRatio < 0.3 ? 'medium' : 'high',
      revision_density_over_time: s.revisionSnapshots,
    };

    const composition: CompositionMetrics = {
      drafting_pattern:
        s.returnEdits < 3
          ? 'mostly_linear'
          : s.returnEdits < 10
          ? 'moderately_iterative'
          : 'highly_iterative',
      composition_order: s.compositionOrder,
      revisited_earlier_paragraphs: s.returnEdits > 0,
    };

    return { session, input, revision, composition };
  }, []);

  const getTimeline = useCallback(() => stateRef.current.timeline, []);

  return {
    handleKeyDown,
    handlePaste,
    handleCut,
    handleFocus,
    handleBlur,
    recordAutosave,
    computeMetrics,
    getTimeline,
    timeline,
  };
}
