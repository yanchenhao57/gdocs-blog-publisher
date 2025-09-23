import React from 'react';
import styles from './index.module.css';
import type { ISpecialH3Content } from '../../../../types/storyblok';
import OrderIcon from './OrderIcon';

interface IProps {
  data: ISpecialH3Content;
}

const SpecialH3 = ({ data }: IProps) => {
  const { order = '', text = '' } = data;
  return (
    <div className={styles.wrapper}>
      <div className={styles.orderWrapper}>
        <OrderIcon className={styles.orderIcon} />
        <span className={styles.orderText}>{order}</span>
      </div>
      <h3 className={styles.headingText}>{text}</h3>
    </div>
  );
};

export default SpecialH3;
