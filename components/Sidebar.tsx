"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Sidebar.module.css";
import { RootState } from "@/store/store";

interface Selection {
  id: number;
  name: string;
  image: string;
}

export default function Sidebar() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [selections, setSelections] = useState<Selection[]>([
    { id: 1, name: "Плейлист дня", image: "/img/playlist01.png" },
    { id: 2, name: "100 танцевальных хитов", image: "/img/playlist02.png" },
    { id: 3, name: "Инди-заряд", image: "/img/playlist03.png" },
  ]);

  const handleLogoutClick = () => {
    router.push('/signin');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar__personal}>
        <p className={styles.sidebar__personalName}>
          {isAuthenticated ? user?.username || "Пользователь" : "Гость"}
        </p>
        <div className={styles.sidebar__icon} onClick={handleLogoutClick}>
          <svg>
            <use xlinkHref="/img/icon/sprite.svg#logout"></use>
          </svg>
        </div>
      </div>
      <div className={styles.sidebar__block}>
        <div className={styles.sidebar__list}>
          {selections.map((selection) => (
            <div key={selection.id} className={styles.sidebar__item}>
              <Link className={styles.sidebar__link} href={`/playlist/${selection.id}`}>
                <Image
                  className={styles.sidebar__img}
                  src={selection.image}
                  alt={selection.name}
                  width={250}
                  height={150}
                  priority={selection.id === 1}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}