import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text, Select } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { getRooms, getReservations, createReservation } from 'pages/remotes';
import { EQUIPMENT_LABELS, ALL_EQUIPMENT, START_TIME_SLOTS, END_TIME_SLOTS } from 'pages/constants';
import { formatDate } from 'pages/utils';
import { PageContainer, Section, FieldGroup, FieldRow, FieldColumn, headerPadding, inputStyle } from 'pages/styles';
import { AvailableRoomList } from './AvailableRoomList';
import { MessageBanner } from 'pages/components/MessageBanner';
import axios from 'axios';

export function RoomBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [date, setDate] = useState(searchParams.get('date') || formatDate(new Date()));
  const [startTime, setStartTime] = useState(searchParams.get('startTime') || '');
  const [endTime, setEndTime] = useState(searchParams.get('endTime') || '');
  const [attendees, setAttendees] = useState(Number(searchParams.get('attendees')) || 1);
  const [equipment, setEquipment] = useState<string[]>(
    searchParams.get('equipment') ? searchParams.get('equipment')!.split(',').filter(Boolean) : []
  );
  const [preferredFloor, setPreferredFloor] = useState<number | null>(
    searchParams.get('floor') ? Number(searchParams.get('floor')) : null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    if (attendees > 1) params.attendees = String(attendees);
    if (equipment.length > 0) params.equipment = equipment.join(',');
    if (preferredFloor !== null) params.floor = String(preferredFloor);
    setSearchParams(params, { replace: true });
  }, [date, startTime, endTime, attendees, equipment, preferredFloor, setSearchParams]);

  const { data: rooms = [] } = useQuery(['rooms'], getRooms);
  const { data: reservations = [] } = useQuery(['reservations', date], () => getReservations(date), {
    enabled: Boolean(date),
  });

  const createMutation = useMutation(
    (data: { roomId: string; date: string; start: string; end: string; attendees: number; equipment: string[] }) =>
      createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['reservations', variables.date]);
        queryClient.invalidateQueries(['myReservations']);
      },
    }
  );

  const hasTimeInputs = startTime !== '' && endTime !== '';
  let validationError: string | null = null;
  if (hasTimeInputs) {
    if (endTime <= startTime) {
      validationError = '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (attendees < 1) {
      validationError = '참석 인원은 1명 이상이어야 합니다.';
    }
  }
  const isFilterComplete = hasTimeInputs && !validationError;

  const floors = useMemo(() => [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b), [rooms]);

  const handleBook = async (roomId: string) => {
    if (!startTime || !endTime) {
      setErrorMessage('시작 시간과 종료 시간을 선택해주세요.');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        roomId,
        date,
        start: startTime,
        end: endTime,
        attendees,
        equipment,
      });

      if ('ok' in result && result.ok) {
        navigate('/', { state: { message: '예약이 완료되었습니다!' } });
        return;
      }

      const errResult = result as { message?: string };
      setErrorMessage(errResult.message ?? '예약에 실패했습니다.');
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      setErrorMessage(serverMessage);
    }
  };

  return (
    <PageContainer>
      <BackButtonArea>
        <BackButton type="button" onClick={() => navigate('/')} aria-label="뒤로가기">
          ← 예약 현황으로
        </BackButton>
      </BackButtonArea>
      <Top.Top03 css={headerPadding}>예약하기</Top.Top03>

      {errorMessage && (
        <Section>
          <Spacing size={12} />
          <MessageBanner type="error" message={errorMessage} />
        </Section>
      )}

      <Spacing size={24} />

      <Section>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 조건
        </Text>
        <Spacing size={16} />

        <FieldGroup>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
            날짜
          </Text>
          <input
            type="date"
            value={date}
            min={formatDate(new Date())}
            onChange={e => {
              setDate(e.target.value);
              setErrorMessage(null);
            }}
            aria-label="날짜"
            css={inputStyle}
          />
        </FieldGroup>
        <Spacing size={14} />

        <FieldRow>
          <FieldColumn>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              시작 시간
            </Text>
            <Select
              value={startTime}
              onChange={e => {
                setStartTime(e.target.value);
                setErrorMessage(null);
              }}
              aria-label="시작 시간"
            >
              <option value="">선택</option>
              {START_TIME_SLOTS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FieldColumn>
          <FieldColumn>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              종료 시간
            </Text>
            <Select
              value={endTime}
              onChange={e => {
                setEndTime(e.target.value);
                setErrorMessage(null);
              }}
              aria-label="종료 시간"
            >
              <option value="">선택</option>
              {END_TIME_SLOTS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FieldColumn>
        </FieldRow>
        <Spacing size={14} />

        <FieldRow>
          <FieldColumn>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              참석 인원
            </Text>
            <input
              type="number"
              min={1}
              value={attendees}
              onChange={e => {
                setAttendees(Math.max(1, Number(e.target.value)));
                setErrorMessage(null);
              }}
              aria-label="참석 인원"
              css={inputStyle}
            />
          </FieldColumn>
          <FieldColumn>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              선호 층
            </Text>
            <Select
              value={preferredFloor ?? ''}
              onChange={e => {
                const val = e.target.value;
                setPreferredFloor(val === '' ? null : Number(val));
                setErrorMessage(null);
              }}
              aria-label="선호 층"
            >
              <option value="">전체</option>
              {floors.map((f: number) => (
                <option key={f} value={f}>
                  {f}층
                </option>
              ))}
            </Select>
          </FieldColumn>
        </FieldRow>
        <Spacing size={14} />

        <div>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
            필요 장비
          </Text>
          <Spacing size={8} />
          <EquipmentList>
            {ALL_EQUIPMENT.map(eq => {
              const selected = equipment.includes(eq);
              return (
                <EquipmentChip
                  key={eq}
                  type="button"
                  onClick={() => {
                    const next = selected ? equipment.filter(e => e !== eq) : [...equipment, eq];
                    setEquipment(next);
                    setErrorMessage(null);
                  }}
                  aria-label={EQUIPMENT_LABELS[eq]}
                  aria-pressed={selected}
                  isSelected={selected}
                >
                  {EQUIPMENT_LABELS[eq]}
                </EquipmentChip>
              );
            })}
          </EquipmentList>
        </div>
      </Section>

      {validationError && (
        <Section>
          <Spacing size={8} />
          <span
            css={css`
              color: ${colors.red500};
              font-size: 14px;
            `}
            role="alert"
          >
            {validationError}
          </span>
        </Section>
      )}

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {isFilterComplete && (
        <AvailableRoomList
          rooms={rooms}
          reservations={reservations}
          filters={{ date, startTime, endTime, attendees, equipment, preferredFloor }}
          onBook={handleBook}
          isBooking={createMutation.isLoading}
        />
      )}

      <Spacing size={24} />
    </PageContainer>
  );
}

const BackButtonArea = styled.div`
  padding: 12px 24px 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  color: ${colors.grey600};
  &:hover {
    color: ${colors.grey900};
  }
`;

const EquipmentList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EquipmentChip = styled.button<{ isSelected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${({ isSelected }) => (isSelected ? colors.blue500 : colors.grey200)};
  background: ${({ isSelected }) => (isSelected ? colors.blue50 : colors.grey50)};
  color: ${({ isSelected }) => (isSelected ? colors.blue600 : colors.grey700)};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ isSelected }) => (isSelected ? colors.blue500 : colors.grey400)};
  }
`;
