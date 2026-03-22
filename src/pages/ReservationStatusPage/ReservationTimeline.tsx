import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { Spacing, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { HOUR_LABELS, TIMELINE_START, TIMELINE_END } from 'pages/constants';
import { formatEquipmentLabels } from 'pages/utils';
import { Section } from 'pages/styles';
import type { Room, Reservation } from 'pages/remotes';

const TOTAL_MINUTES = (TIMELINE_END - TIMELINE_START) * 60;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - TIMELINE_START) * 60 + m;
}

interface ReservationTimelineProps {
  rooms: Room[];
  reservations: Reservation[];
}

export function ReservationTimeline({ rooms, reservations }: ReservationTimelineProps) {
  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  const reservationsByRoom = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of reservations) {
      const list = map.get(r.roomId);
      if (list) list.push(r);
      else map.set(r.roomId, [r]);
    }
    return map;
  }, [reservations]);

  return (
    <Section>
      <Text typography="t5" fontWeight="bold" color={colors.grey900}>
        예약 현황
      </Text>
      <Spacing size={16} />

      <TimelineContainer>
        <TimelineHeader>
          <RoomLabel />
          <TimeAxis>
            {HOUR_LABELS.map(t => {
              const left = (timeToMinutes(t) / TOTAL_MINUTES) * 100;
              return (
                <Text
                  key={t}
                  typography="t7"
                  fontWeight="regular"
                  color={colors.grey400}
                  css={css`
                    position: absolute;
                    left: ${left}%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    letter-spacing: -0.3px;
                  `}
                >
                  {t.slice(0, 2)}
                </Text>
              );
            })}
          </TimeAxis>
        </TimelineHeader>

        {rooms.map((room, index) => {
          const roomReservations = reservationsByRoom.get(room.id) ?? [];
          return (
            <TimelineRow key={room.id} isFirst={index === 0}>
              <RoomLabel>
                <Text
                  typography="t7"
                  fontWeight="medium"
                  color={colors.grey700}
                  ellipsisAfterLines={1}
                  css={css`
                    font-size: 12px;
                  `}
                >
                  {room.name}
                </Text>
              </RoomLabel>
              <TimeBar>
                {roomReservations.map(res => {
                  const left = (timeToMinutes(res.start) / TOTAL_MINUTES) * 100;
                  const width = ((timeToMinutes(res.end) - timeToMinutes(res.start)) / TOTAL_MINUTES) * 100;
                  const isActive = activeReservation === res.id;
                  return (
                    <ReservationBlock key={res.id} style={{ left: `${left}%`, width: `${width}%` }}>
                      <ReservationBar
                        role="button"
                        aria-label={`${room.name} ${res.start}-${res.end} 예약 상세`}
                        onClick={() => setActiveReservation(isActive ? null : res.id)}
                        isActive={isActive}
                      />
                      {isActive && (
                        <Tooltip role="tooltip">
                          <div>
                            {res.start} ~ {res.end}
                          </div>
                          <div>{res.attendees}명</div>
                          {res.equipment.length > 0 && <div>{formatEquipmentLabels(res.equipment)}</div>}
                        </Tooltip>
                      )}
                    </ReservationBlock>
                  );
                })}
              </TimeBar>
            </TimelineRow>
          );
        })}
      </TimelineContainer>
    </Section>
  );
}

const TimelineContainer = styled.div`
  background: ${colors.grey50};
  border-radius: 14px;
  padding: 16px;
`;

const TimelineHeader = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
`;

const RoomLabel = styled.div`
  width: 80px;
  flex-shrink: 0;
  padding-right: 8px;
`;

const TimeAxis = styled.div`
  flex: 1;
  position: relative;
  height: 18px;
`;

const TimelineRow = styled.div<{ isFirst: boolean }>`
  display: flex;
  align-items: center;
  height: 32px;
  ${({ isFirst }) => !isFirst && 'margin-top: 4px;'}
`;

const TimeBar = styled.div`
  flex: 1;
  height: 24px;
  background: ${colors.white};
  border-radius: 6px;
  position: relative;
  overflow: visible;
`;

const ReservationBlock = styled.div`
  position: absolute;
  height: 100%;
`;

const ReservationBar = styled.div<{ isActive: boolean }>`
  width: 100%;
  height: 100%;
  background: ${colors.blue400};
  border-radius: 4px;
  opacity: ${({ isActive }) => (isActive ? 1 : 0.75)};
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 6px;
  background: ${colors.grey900};
  color: ${colors.white};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  line-height: 1.6;
`;
