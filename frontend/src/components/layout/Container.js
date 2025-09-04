import styles from "./Container.module.css";

function Container({children}) {
  return <main className={styles.container}>
      {children} {/* Usado para o react  */}
  </main>
}

export default Container
