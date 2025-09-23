import React from 'react';
import styles from './index.module.css';
import type { ISpecialH2Content } from '../../../../types/storyblok';

interface IProps {
  data: ISpecialH2Content;
}

const SpecialH2 = ({ data }: IProps) => {
  const { text = '' } = data;
  return <h2 className={styles.wrapper}>{text}</h2>;
};

export default SpecialH2;
