import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Player from "../components/Player";
import TrackList from "../components/TrackList";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          <div className={styles.centerblock}>
            <SearchBar />
            <h2 className={styles.centerblock__h2}>Треки</h2>
            <div className={styles.centerblock__filter}>
              <div className={styles.filter__title}>Искать по:</div>
              <div className={styles.filter__button}>исполнителю</div>
              <div className={styles.filter__button}>году выпуска</div>
              <div className={styles.filter__button}>жанру</div>
            </div>
            <TrackList />
          </div>
          <Sidebar />
        </main>
        <div className={styles.bar}>
          <div className={styles.bar__content}>
            <div className={styles.bar__playerProgress}></div>
            <div className={styles.bar__playerBlock}>
              <div className={styles.bar__player}>
                <Player />
                <div className={styles.trackPlay}>
                  <div className={styles.trackPlay__contain}>
                    <div className={styles.trackPlay__image}>
                      <svg className={styles.trackPlay__svg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                      </svg>
                    </div>
                    <div className={styles.trackPlay__author}>
                      <a className={styles.trackPlay__authorLink} href="">
                        Ты та...
                      </a>
                    </div>
                    <div className={styles.trackPlay__album}>
                      <a className={styles.trackPlay__albumLink} href="">
                        Баста
                      </a>
                    </div>
                  </div>
                  <div className={styles.trackPlay__likeDis}>
                    <div className={styles.trackPlay__like}>
                      <svg className={styles.trackPlay__likeSvg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
                      </svg>
                    </div>
                    <div className={styles.trackPlay__dislike}>
                      <svg className={styles.trackPlay__dislikeSvg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-dislike"></use>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.bar__volumeBlock}>
                <div className={styles.volume__content}>
                  <div className={styles.volume__image}>
                    <svg className={styles.volume__svg}>
                      <use xlinkHref="/img/icon/sprite.svg#icon-volume"></use>
                    </svg>
                  </div>
                  <div className={styles.volume__progress}>
                    <input
                      className={styles.volume__progressLine}
                      type="range"
                      name="range"
                      placeholder="Кнопка увеличения громкости"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}