import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Player from "../components/Player";
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
            <div className={styles.centerblock__content}>
              <div className={styles.content__title}>
                <div className={`${styles.playlistTitle__col} ${styles.col01}`}>Трек</div>
                <div className={`${styles.playlistTitle__col} ${styles.col02}`}>Исполнитель</div>
                <div className={`${styles.playlistTitle__col} ${styles.col03}`}>Альбом</div>
                <div className={`${styles.playlistTitle__col} ${styles.col04}`}>
                  <svg className={styles.playlistTitle__svg}>
                    <use xlinkHref="/img/icon/sprite.svg#icon-watch"></use>
                  </svg>
                </div>
              </div>
              <div className={styles.content__playlist}>
                <div className={styles.playlist__item}>
                  <div className={styles.playlist__track}>
                    <div className={styles.track__title}>
                      <div className={styles.track__titleImage}>
                        <svg className={styles.track__titleSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                        </svg>
                      </div>
                      <div>
                        <a className={styles.track__titleLink} href="">
                          Guilt <span className={styles.track__titleSpan}></span>
                        </a>
                      </div>
                    </div>
                    <div className={styles.track__author}>
                      <a className={styles.track__authorLink} href="">
                        Nero
                      </a>
                    </div>
                    <div className={styles.track__album}>
                      <a className={styles.track__albumLink} href="">
                        Welcome Reality
                      </a>
                    </div>
                    <div className={styles.track__time}>
                      <svg className={styles.track__timeSvg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
                      </svg>
                      <span className={styles.track__timeText}>4:44</span>
                    </div>
                  </div>
                </div>

                <div className={styles.playlist__item}>
                  <div className={styles.playlist__track}>
                    <div className={styles.track__title}>
                      <div className={styles.track__titleImage}>
                        <svg className={styles.track__titleSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                        </svg>
                      </div>
                      <div>
                        <a className={styles.track__titleLink} href="">
                          Elektro <span className={styles.track__titleSpan}></span>
                        </a>
                      </div>
                    </div>
                    <div className={styles.track__author}>
                      <a className={styles.track__authorLink} href="">
                        Dynoro, Outwork, Mr. Gee
                      </a>
                    </div>
                    <div className={styles.track__album}>
                      <a className={styles.track__albumLink} href="">
                        Elektro
                      </a>
                    </div>
                    <div className={styles.track__time}>
                      <svg className={styles.track__timeSvg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
                      </svg>
                      <span className={styles.track__timeText}>2:22</span>
                    </div>
                  </div>
                </div>

                <div className={styles.playlist__item}>
                  <div className={styles.playlist__track}>
                    <div className={styles.track__title}>
                      <div className={styles.track__titleImage}>
                        <svg className={styles.track__titleSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                        </svg>
                      </div>
                      <div>
                        <a className={styles.track__titleLink} href="">
                          I'm Fire <span className={styles.track__titleSpan}></span>
                        </a>
                      </div>
                    </div>
                    <div className={styles.track__author}>
                      <a className={styles.track__authorLink} href="">
                        Ali Bakgor
                      </a>
                    </div>
                    <div className={styles.track__album}>
                      <a className={styles.track__albumLink} href="">
                        I'm Fire
                      </a>
                    </div>
                    <div className={styles.track__time}>
                      <svg className={styles.track__timeSvg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
                      </svg>
                      <span className={styles.track__timeText}>2:22</span>
                    </div>
                  </div>
                </div>

                <div className={styles.playlist__item}>
                  <div className={styles.playlist__track}>
                    <div className={styles.track__title}>
                      <div className={styles.track__titleImage}>
                        <svg className={styles.track__titleSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                        </svg>
                      </div>
                      <div>
                        <a className={styles.track__titleLink} href="">
                          Non Stop
                          <span className={styles.track__titleSpan}>(Remix)</span>
                        </a>
                      </div>
                    </div>
                    <div className={styles.track__author}>
                      <a className={styles.track__authorLink} href="">
                        Стоункат, Psychopath
                      </a>
                    </div>
                    <div className={styles.track__album}>
                      <a className={styles.track__albumLink} href="">
                        Non Stop
                      </a>
                    </div>
                    <div className={styles.track__time}>
                      <svg className={styles.track__timeSvg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
                      </svg>
                      <span className={styles.track__timeText}>4:12</span>
                    </div>
                  </div>
                </div>

                <div className={styles.playlist__item}>
                  <div className={styles.playlist__track}>
                    <div className={styles.track__title}>
                      <div className={styles.track__titleImage}>
                        <svg className={styles.track__titleSvg}>
                          <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                        </svg>
                      </div>
                      <div>
                        <a className={styles.track__titleLink} href="">
                          Run Run
                          <span className={styles.track__titleSpan}>
                            (feat. AR/CO)
                          </span>
                        </a>
                      </div>
                    </div>
                    <div className={styles.track__author}>
                      <a className={styles.track__authorLink} href="">
                        Jaded, Will Clarke, AR/CO
                      </a>
                    </div>
                    <div className={styles.track__album}>
                      <a className={styles.track__albumLink} href="">
                        Run Run
                      </a>
                    </div>
                    <div className={styles.track__time}>
                      <svg className={styles.track__timeSvg}>
                        <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
                      </svg>
                      <span className={styles.track__timeText}>2:54</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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