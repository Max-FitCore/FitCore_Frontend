import React from 'react';
import { motion } from 'framer-motion';
import styles from './PageLoader.module.css';

const PageLoader = () => {
  return (
    <motion.div
      className={styles.loader}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.loaderContent}>
        <div className={styles.spinner}>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
        </div>
        <p className={styles.loaderText}>Loading...</p>
      </div>
    </motion.div>
  );
};

export default PageLoader;