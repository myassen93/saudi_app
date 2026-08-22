import { I18nManager } from 'react-native';
import { useAppSelector } from '../store/hooks';

/**
 * Central hook for RTL/LTR-aware UI values (adapted from trophyApp/utils/rtl.ts).
 */
export function useRTL() {
  const storeRTL = useAppSelector((s) => s.app.isRTL);
  // I18nManager.isRTL reflects the actual native layout direction. The Redux
  // flag may lag behind it right after a language change (pre-restart), so
  // treat either source as authoritative.
  const isRTL = storeRTL || I18nManager.isRTL;

  return {
    isRTL,
    backIcon: (isRTL ? 'arrow-forward' : 'arrow-back') as 'arrow-forward' | 'arrow-back',
    textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left',
    flexStart: (isRTL ? 'flex-end' : 'flex-start') as 'flex-end' | 'flex-start',
    flexEnd: (isRTL ? 'flex-start' : 'flex-end') as 'flex-start' | 'flex-end',
    rowDir: (isRTL ? 'row-reverse' : 'row') as 'row-reverse' | 'row',
    writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
  } as const;
}
