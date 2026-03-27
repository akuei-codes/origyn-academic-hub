import { useEffect, useRef, useState, useCallback } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions {
  data: string;
  onSave: (data: string) => Promise<void>;
  interval?: number;
  debounce?: number;
}

export function useAutosave({
  data,
  onSave,
  interval = 30000,
  debounce = 2000,
}: UseAutosaveOptions) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const lastSaved = useRef(data);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const intervalTimer = useRef<ReturnType<typeof setInterval>>();

  const save = useCallback(async () => {
    if (data === lastSaved.current) return;
    setStatus('saving');
    try {
      await onSave(data);
      lastSaved.current = data;
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, [data, onSave]);

  // Debounced save on change
  useEffect(() => {
    if (data === lastSaved.current) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(save, debounce);
    return () => clearTimeout(debounceTimer.current);
  }, [data, debounce, save]);

  // Periodic interval save
  useEffect(() => {
    intervalTimer.current = setInterval(save, interval);
    return () => clearInterval(intervalTimer.current);
  }, [save, interval]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (data !== lastSaved.current) {
        onSave(data).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, save };
}
