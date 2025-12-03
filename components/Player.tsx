import styles from "./Player.module.css";

export default function Player() {
  return (
    <div className={styles.player}>
      <div className={styles.player__controls}>
        <div className={styles.player__btnPrev} aria-label="Предыдущий трек">
          <svg className={styles.player__btnPrevSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-prev"></use>
          </svg>
        </div>
        <div className={styles.player__btnPlay} aria-label="Воспроизвести">
          <svg className={styles.player__btnPlaySvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-play"></use>
          </svg>
        </div>
        <div className={styles.player__btnNext} aria-label="Следующий трек">
          <svg className={styles.player__btnNextSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-next"></use>
          </svg>
        </div>
        <div className={styles.player__btnRepeat} aria-label="Повтор">
          <svg className={styles.player__btnRepeatSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-repeat"></use>
          </svg>
        </div>
        <div className={styles.player__btnShuffle} aria-label="Перемешать">
          <svg className={styles.player__btnShuffleSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-shuffle"></use>
          </svg>
        </div>
      </div>
    </div>
  );
}