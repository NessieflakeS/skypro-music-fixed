"use client";

import { useRef, useEffect } from "react";
import { formatTime } from "@/utils/formatTime";
import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current && duration > 0) {
      const percent = (currentTime / duration) * 100;
      progressRef.current.style.setProperty("--progress", `${percent}%`);
    }
  }, [currentTime, duration]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const newTime = percent * duration;
    onSeek(newTime);
  };

  return (
    <div className={styles.progressContainer}>
      <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
      <div
        className={styles.progressBar}
        ref={progressRef}
        onClick={handleClick}
      />
      <span className={styles.timeDisplay}>{formatTime(duration)}</span>
    </div>
  );
}