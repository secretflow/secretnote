// A simple wrapper for Smoothie, a time-series charting library.

import { useEffect, useRef } from 'react';
import { SmoothieChart, TimeSeries } from 'smoothie';

export default function Smoothie(props: {
  data: { time: number; value: number }; // data point for current time
  width?: number;
  height?: number;
  min?: number;
  max?: number;
}) {
  const { data, width, height, min, max } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seriesRef = useRef<TimeSeries>();

  useEffect(() => {
    if (canvasRef.current && !seriesRef.current) {
      // the chart
      const chart = new SmoothieChart({
        millisPerPixel: 75,
        grid: {
          fillStyle: '#ffffff',
          strokeStyle: '#d3d3d3',
          lineWidth: 1,
          millisPerLine: 5000,
        },
        labels: {
          disabled: false,
          precision: 1,
          fillStyle: '#000000',
        },
        tooltip: false,
        minValue: min,
        maxValue: max,
        interpolation: 'bezier',
      });
      // bind the time series
      const series = new TimeSeries();
      chart.addTimeSeries(series, {
        lineWidth: 1,
        strokeStyle: 'rgba(24,144,255,1)',
        fillStyle: 'rgba(24,144,255,0.2)',
      });
      chart.streamTo(canvasRef.current, 2000);
      seriesRef.current = series;
    }
  }, []);

  useEffect(() => {
    // append the data point every time `data` ticks
    seriesRef.current && seriesRef.current.append(data.time, data.value);
  }, [data]);

  return (
    <canvas ref={canvasRef} width={width ?? 120} height={height ?? 30}></canvas>
  );
}
