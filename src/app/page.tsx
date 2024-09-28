import Image from "next/image";
import Link from "next/link";
import TicTacToeImage from "/public/tic-tac-toe.svg";
import styles from "./page.module.css";

export default function Home() {

    return (
        <header className={styles.headerContainer}>
            <div id={styles.bgGrid}>
                <div id={styles.blurGrid}></div>
            </div>

            <div className={styles.heroSection}>
                <div className={styles.tictactoeImageConatiner}>
                    <Image src={TicTacToeImage} alt={"tic-tac-toe.svg"} width={"100"} height={"88"} loading={"eager"} priority={true} />
                </div>
                <h1>Unlock Your Mind&apos;s Potential</h1>
                <p>Train Smarter, Not Harder!</p>

                <div className={styles.urlConatiner}>
                    <div className={styles.tictactoeUrlConatiner}>
                        <Link href="/game">Start Game</Link>
                    </div>
                    <div className={styles.githubUrlConatiner}>
                        <Link href="https://github.com/ajaynegi45/Time-Pass">See Github</Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
