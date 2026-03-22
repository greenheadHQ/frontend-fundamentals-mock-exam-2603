import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Spacing, Button, Text, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import type { Room, Reservation } from 'pages/remotes';
import { formatEquipmentLabels } from 'pages/utils';
import { Section, SectionHeader, EmptyState, ListContainer } from 'pages/styles';

interface MyReservationListProps {
  myReservations: Reservation[];
  rooms: Room[];
  onCancel: (id: string) => void;
}

export function MyReservationList({ myReservations, rooms, onCancel }: MyReservationListProps) {
  const roomNameMap = useMemo(() => new Map(rooms.map(r => [r.id, r.name])), [rooms]);
  const getRoomName = (roomId: string) => roomNameMap.get(roomId) ?? roomId;

  return (
    <Section>
      <SectionHeader>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          내 예약
        </Text>
        {myReservations.length > 0 && (
          <Text typography="t7" fontWeight="medium" color={colors.grey500}>
            {myReservations.length}건
          </Text>
        )}
      </SectionHeader>
      <Spacing size={16} />

      {myReservations.length === 0 ? (
        <EmptyState>
          <Text typography="t6" color={colors.grey500}>
            예약 내역이 없습니다.
          </Text>
        </EmptyState>
      ) : (
        <ListContainer>
          {myReservations.map(res => (
            <ReservationCard key={res.id}>
              <ListRow
                contents={
                  <ListRow.Text2Rows
                    top={getRoomName(res.roomId)}
                    topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                    bottom={`${res.date} ${res.start}~${res.end} · ${res.attendees}명 · ${
                      formatEquipmentLabels(res.equipment) || '장비 없음'
                    }`}
                    bottomProps={{ typography: 't7', color: colors.grey600 }}
                  />
                }
                right={
                  <Button
                    type="danger"
                    style="weak"
                    size="small"
                    onClick={e => {
                      e.stopPropagation();
                      if (window.confirm('정말 취소하시겠습니까?')) {
                        onCancel(res.id);
                      }
                    }}
                  >
                    취소
                  </Button>
                }
              />
            </ReservationCard>
          ))}
        </ListContainer>
      )}
    </Section>
  );
}

const ReservationCard = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  background: ${colors.grey50};
  border: 1px solid ${colors.grey200};
`;
