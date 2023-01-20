import React from "react";
//import classNames from "classnames";
//import styles from "./Column.scss";

export const Test = () => {
  return <div>ph</div>;
};

export const Column = () => {
  return <div>ph</div>;
};

/*export const Column = forwardRef(
  ({ as: Component, lastChildMargin, className, gap, padding, center, centerMd, grow, overflow, children, ...rest }: any, ref) => {
    const gapClass = gap === true ? styles.mdGap : styles[`${gap}Gap`];
    const paddingClass = padding === true ? styles.lgPadding : styles[`${padding}Padding`];

    return (
      <Component
        {...rest}
        ref={ref}
        className={classNames(
          styles.column,
          gapClass,
          paddingClass,
          {
            [styles.center]: center === true || center === "horizontal" || center === "both",
            [styles.centerVertical]: center === "vertical" || center === "both",
            [styles.centerMd]: centerMd === true || centerMd === "horizontal" || centerMd === "both",
            [styles.centerVerticalMd]: centerMd === "vertical" || centerMd === "both",
            [styles.grow]: grow,
            [styles.overflow]: overflow,
            [styles.margin0LastChild]: lastChildMargin
          },
          className
        )}
      >
        {children}
      </Component>
    );
  }
);*/
