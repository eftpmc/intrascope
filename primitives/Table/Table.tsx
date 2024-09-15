import React from 'react';
import styles from './Table.module.css';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={`${styles.table} ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps extends React.TableHTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, ...props }) => {
  return <thead {...props}>{children}</thead>;
};

interface TableBodyProps extends React.TableHTMLAttributes<HTMLTableSectionElement> {}

export const TableBody: React.FC<TableBodyProps> = ({ children, ...props }) => {
  return <tbody {...props}>{children}</tbody>;
};

interface TableRowProps extends React.TableHTMLAttributes<HTMLTableRowElement> {}

export const TableRow: React.FC<TableRowProps> = ({ children, ...props }) => {
  return <tr {...props}>{children}</tr>;
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell: React.FC<TableCellProps> = ({ children, ...props }) => {
  return <td className={styles.tableCell} {...props}>{children}</td>;
};

interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, ...props }) => {
  return <th className={styles.tableHeaderCell} {...props}>{children}</th>;
};