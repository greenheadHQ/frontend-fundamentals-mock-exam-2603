import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { getRooms, getReservations, getMyReservations, cancelReservation } from 'pages/remotes';
import { formatDate } from 'pages/utils';
import { PageContainer, Section, FieldGroup, headerPadding, inputStyle } from 'pages/styles';
import { ReservationTimeline } from './ReservationTimeline';
import { MyReservationList } from './MyReservationList';
import { MessageBanner } from 'pages/components/MessageBanner';

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(formatDate(new Date()));

  const locationState = location.state as { message?: string } | null;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    locationState?.message ? { type: 'success', text: locationState.message } : null
  );

  useEffect(() => {
    if (locationState?.message) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  const { data: rooms = [] } = useQuery(['rooms'], getRooms);
  const { data: reservations = [] } = useQuery(['reservations', date], () => getReservations(date), {
    enabled: Boolean(date),
  });
  const { data: myReservationList = [] } = useQuery(['myReservations'], getMyReservations);

  const cancelMutation = useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['myReservations']);
    },
  });

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      setMessage({ type: 'success', text: '예약이 취소되었습니다.' });
    } catch {
      setMessage({ type: 'error', text: '취소에 실패했습니다.' });
    }
  };

  return (
    <PageContainer>
      <Top.Top03 css={headerPadding}>회의실 예약</Top.Top03>

      <Spacing size={24} />

      <Section>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          날짜 선택
        </Text>
        <Spacing size={16} />
        <FieldGroup>
          <input
            type="date"
            value={date}
            min={formatDate(new Date())}
            onChange={e => setDate(e.target.value)}
            aria-label="날짜"
            css={inputStyle}
          />
        </FieldGroup>
      </Section>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <ReservationTimeline rooms={rooms} reservations={reservations} />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {message && (
        <Section>
          <MessageBanner type={message.type} message={message.text} />
          <Spacing size={12} />
        </Section>
      )}

      <MyReservationList myReservations={myReservationList} rooms={rooms} onCancel={handleCancel} />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <Section>
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </Section>
      <Spacing size={24} />
    </PageContainer>
  );
}
