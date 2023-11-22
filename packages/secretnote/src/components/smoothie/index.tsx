import { useEffect, useRef } from 'react';
import { SmoothieChart, TimeSeries } from 'smoothie';

interface SmoothieData {
  time: number;
  data: number;
}

const Smoothie = (props: { data: SmoothieData }) => {
  const { data } = props;
  const ref = useRef<HTMLCanvasElement>(null);
  const seriesRef = useRef<TimeSeries>();

  useEffect(() => {
    if (ref.current) {
      const chart = new SmoothieChart({
        millisPerPixel: 50,
        grid: {
          fillStyle: '#ffffff',
          strokeStyle: 'rgba(119,119,119,0.22)',
          lineWidth: 1,
        },
        labels: { disabled: true },
        tooltip: false,
      });
      const series = new TimeSeries();
      chart.addTimeSeries(series, {
        lineWidth: 1,
        strokeStyle: 'rgba(24,144,255,1)',
        fillStyle: 'rgba(24,144,255,0.2)',
        interpolation: 'bezier',
      });
      chart.streamTo(ref.current, 2000);
      seriesRef.current = series;
    }
  }, []);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.append(data.time, data.data);
    }
  }, [data]);

  return <canvas ref={ref} width="270" height="60" />;
};

export { Smoothie };
