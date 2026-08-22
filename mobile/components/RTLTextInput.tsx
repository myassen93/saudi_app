import React from 'react';
import { I18nManager, TextInput, TextInputProps } from 'react-native';
import { store } from '../store';

/**
 * Drop-in replacement for RN's TextInput that aligns text to the reading
 * direction of the current language (adapted from trophyApp/components/RTLTextInput.tsx).
 */
const RTLTextInput = React.forwardRef<TextInput, TextInputProps>(
  ({ style, textAlign: textAlignProp, ...props }, ref) => {
    const isRTL = store.getState().app.isRTL || I18nManager.isRTL;
    const textAlign = textAlignProp ?? (isRTL ? 'right' : 'left');
    const styleArray = Array.isArray(style) ? style : [style];

    return (
      <TextInput
        ref={ref}
        textAlign={textAlign}
        style={[...styleArray, { textAlign }]}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    );
  }
);

RTLTextInput.displayName = 'RTLTextInput';

export default RTLTextInput;
