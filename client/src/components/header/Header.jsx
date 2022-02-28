import React from 'react';
import styles from './Header.module.css';
const Header = (props) => (
  <header className={styles.header}>
    <a href="/" className={styles.title}>
      MOBA
    </a>
  </header>
);

export default Header;
