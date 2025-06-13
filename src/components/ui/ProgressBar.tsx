interface ProgressBarProps {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
    </div>
  );
}