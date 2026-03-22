import { css } from '@emotion/react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';

interface MessageBannerProps {
  type: 'success' | 'error';
  message: string;
}

const STYLE_MAP = {
  success: {
    background: colors.blue50,
    color: colors.blue600,
  },
  error: {
    background: colors.red50,
    color: colors.red500,
  },
} as const;

export function MessageBanner({ type, message }: MessageBannerProps) {
  const style = STYLE_MAP[type];

  return (
    <div
      css={css`
        padding: 10px 14px;
        border-radius: 10px;
        background: ${style.background};
        display: flex;
        align-items: center;
        gap: 8px;
      `}
    >
      <Text typography="t7" fontWeight="medium" color={style.color}>
        {message}
      </Text>
    </div>
  );
}
