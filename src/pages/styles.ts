import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { colors } from '_tosslib/constants/colors';

export const PageContainer = styled.div`
  background: ${colors.white};
  padding-bottom: 40px;
`;

export const Section = styled.div`
  padding: 0 24px;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FieldRow = styled.div<{ gap?: number }>`
  display: flex;
  gap: ${({ gap }) => gap ?? 12}px;
`;

export const FieldColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

export const EmptyState = styled.div`
  padding: 40px 0;
  text-align: center;
  background: ${colors.grey50};
  border-radius: 14px;
`;

export const headerPadding = css`
  padding-left: 24px;
  padding-right: 24px;
`;

export const inputStyle = css`
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  height: 48px;
  background-color: ${colors.grey50};
  border-radius: 12px;
  color: ${colors.grey800};
  width: 100%;
  border: 1px solid ${colors.grey200};
  padding: 0 16px;
  outline: none;
  transition: border-color 0.15s;
  &:focus {
    border-color: ${colors.blue500};
  }
`;
