import { DateTime, IANAZone } from "luxon";
import React, { useMemo } from "react";

interface Props {
  project: Aha.Project;
  zones: IANAZone[];
}

const endHour = (startHour: number) =>
  startHour + 8 > 23 ? startHour - 24 + 8 : startHour + 8;

const ts = DateTime.utc().set({
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
});

export const Project: React.FC<Props> = ({ project, zones }) => {
  const [hours, togetherHours] = useMemo(() => {
    const minuteOffsets = zones.map((zone) => zone.offset(ts.toMillis()));

    const startHours = zones.map(
      (zone) => ts.setZone(zone).set({ hour: 9 }).toUTC().hour
    );
    const ranges = startHours.map((from) => {
      const upTo = endHour(from);
      return [from, upTo < from ? upTo + 24 : upTo] as [number, number];
    });

    const hours = [
      ...ranges.reduce((acc, [from, upTo]) => {
        for (let i = from; i <= upTo; i++) {
          acc.add(i > 23 ? i - 24 : i);
        }

        return acc;
      }, new Set<number>()),
    ].sort((a, b) => a - b);

    const togetherHours = [
      ...ranges.reduce((acc, [from, upTo]) => {
        acc.forEach((hour) => {
          if (upTo > 23 && hour < from) {
            if (hour + 23 >= upTo) {
              acc.delete(hour);
            }
          } else if (hour < from || hour > upTo) {
            acc.delete(hour);
          }
        });

        return acc;
      }, new Set<number>(hours)),
    ];

    return [hours, togetherHours];
  }, [zones]);

  return (
    <div className="project">
      <div className="project--title">{project.name}</div>
      <div className="project--details">
        <dl>
          <dt>Team members</dt>
          <dd>{project.users.length}</dd>
          <dt>Time zones</dt>
          <dd>{zones.length}</dd>
          <dt>Total hours</dt>
          <dd>{hours.length}</dd>
          <dt>Together hours</dt>
          <dd>{togetherHours.length}</dd>
        </dl>

        {togetherHours.length > 0 && (
          <table className="table">
            {zones.map((zone) => (
              <tr>
                <td>
                  {zone.offsetName(new Date().valueOf(), { format: "short" })}
                </td>
                <td>
                  {togetherHours
                    .map((hour) => ts.set({ hour }).setZone(zone))
                    .reduce((acc, t) => (t.hour < acc.hour ? t : acc))
                    .toLocaleString(DateTime.TIME_SIMPLE)}
                  &nbsp;to&nbsp;
                  {togetherHours
                    .map((hour) => ts.set({ hour }).setZone(zone))
                    .reduce((acc, t) => (t.hour > acc.hour ? t : acc))
                    .toLocaleString(DateTime.TIME_SIMPLE)}
                </td>
              </tr>
            ))}
          </table>
        )}
      </div>
    </div>
  );
};
