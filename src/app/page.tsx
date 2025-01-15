import Image from "next/image";
import styles from "./page.module.css";
import { AudioFile } from "@/components/AudioFile";

export default function Home() {
  return (
    <div className={styles.page}>
      <AudioFile/>
    </div>
  );
}
