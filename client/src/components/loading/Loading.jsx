import React from "react";
import { ThreeDots } from "react-loader-spinner";
import styles from "./Loading.module.css";

const Loading = props => {
  return (
    <div>
      <ThreeDots className={styles.loadingSpinner} heigth="100" width="100" color="#f37423" ariaLabel="loading" />;
    </div>
  );
};
export default Loading;
