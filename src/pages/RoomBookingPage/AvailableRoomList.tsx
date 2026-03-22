import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { Spacing, Button, Text, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import type { Room, Reservation } from 'pages/remotes';
import { EQUIPMENT_LABELS } from 'pages/constants';
import { formatEquipmentLabels } from 'pages/utils';

function filterByCapacity(room: Room, attendees: number): boolean {
  return room.capacity >= attendees;
}

function filterByEquipment(room: Room, required: string[]): boolean {
  return required.every(eq => room.equipment.includes(eq as Room['equipment'][number]));
}

function filterByFloor(room: Room, floor: number | null): boolean {
  if (floor === null) {
    return true;
  }
  return room.floor === floor;
}

function hasTimeConflict(
  reservations: Reservation[],
  roomId: string,
  date: string,
  start: string,
  end: string
): boolean {
  return reservations.some(r => r.roomId === roomId && r.date === date && r.start < end && r.end > start);
}

interface AvailableRoomListProps {
  rooms: Room[];
  reservations: Reservation[];
  filters: {
    date: string;
    startTime: string;
    endTime: string;
    attendees: number;
    equipment: string[];
    preferredFloor: number | null;
  };
  onBook: (roomId: string) => void;
  isBooking: boolean;
}

export function AvailableRoomList({ rooms, reservations, filters, onBook, isBooking }: AvailableRoomListProps) {
  const { date, startTime, endTime, attendees, equipment, preferredFloor } = filters;

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 필터 변경 시 selectedRoomId 초기화
  useEffect(() => {
    setSelectedRoomId(null);
    setErrorMessage(null);
  }, [date, startTime, endTime, attendees, equipment, preferredFloor]);

  const availableRooms = rooms
    .filter(room => {
      if (!filterByCapacity(room, attendees)) {
        return false;
      }
      if (!filterByEquipment(room, equipment)) {
        return false;
      }
      if (!filterByFloor(room, preferredFloor)) {
        return false;
      }
      if (hasTimeConflict(reservations, room.id, date, startTime, endTime)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.floor !== b.floor) {
        return a.floor - b.floor;
      }
      return a.name.localeCompare(b.name);
    });

  const handleBook = () => {
    if (!selectedRoomId) {
      setErrorMessage('회의실을 선택해주세요.');
      return;
    }
    setErrorMessage(null);
    onBook(selectedRoomId);
  };

  return (
    <div
      css={css`
        padding: 0 24px;
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: baseline;
          gap: 6px;
        `}
      >
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 가능 회의실
        </Text>
        <Text typography="t7" fontWeight="medium" color={colors.grey500}>
          {availableRooms.length}개
        </Text>
      </div>
      <Spacing size={16} />

      {availableRooms.length === 0 ? (
        <div
          css={css`
            padding: 40px 0;
            text-align: center;
            background: ${colors.grey50};
            border-radius: 14px;
          `}
        >
          <Text typography="t6" color={colors.grey500}>
            조건에 맞는 회의실이 없습니다.
          </Text>
        </div>
      ) : (
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 10px;
          `}
        >
          {availableRooms.map(room => {
            const isSelected = selectedRoomId === room.id;
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                role="button"
                aria-pressed={isSelected}
                aria-label={room.name}
                css={css`
                  cursor: pointer;
                  padding: 14px 16px;
                  border-radius: 14px;
                  border: 2px solid ${isSelected ? colors.blue500 : colors.grey200};
                  background: ${isSelected ? colors.blue50 : colors.white};
                  transition: all 0.15s;
                  &:hover {
                    border-color: ${isSelected ? colors.blue500 : colors.grey300};
                  }
                `}
              >
                <ListRow
                  contents={
                    <ListRow.Text2Rows
                      top={room.name}
                      topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                      bottom={`${room.floor}층 · ${room.capacity}명 · ${formatEquipmentLabels(room.equipment)}`}
                      bottomProps={{ typography: 't7', color: colors.grey600 }}
                    />
                  }
                  right={
                    isSelected ? (
                      <Text typography="t7" fontWeight="bold" color={colors.blue500}>
                        선택됨
                      </Text>
                    ) : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {errorMessage && (
        <>
          <Spacing size={8} />
          <Text typography="t7" fontWeight="medium" color={colors.red500}>
            {errorMessage}
          </Text>
        </>
      )}

      <Spacing size={16} />
      <Button display="full" onClick={handleBook} disabled={isBooking}>
        {isBooking ? '예약 중...' : '확정'}
      </Button>
    </div>
  );
}
