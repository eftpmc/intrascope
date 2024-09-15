"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Container } from '@/primitives/Container';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/primitives/Table';
import { Button } from '@/primitives/Button';
import { Input } from '@/primitives/Input';
import { Logo } from '@/components/Logo';
import { IoTrashBinOutline, IoSaveOutline } from "react-icons/io5";
import styles from './page.module.css';
import Link from 'next/link';

const supabase = createClient();

export default function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [editingData, setEditingData] = useState<any>({});
  const [newSourceUrl, setNewSourceUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase.from('data').select('*');
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setData(data || []);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>, id: string, field: string) {
    const updatedData = { ...editingData, [id]: { ...editingData[id], [field]: e.target.value } };
    setEditingData(updatedData);
  }

  async function saveChanges(id: string) {
    const updatedItem = editingData[id];
    if (updatedItem) {
      const { data, error } = await supabase
        .from('data')
        .update(updatedItem)
        .eq('id', id);

      if (error) {
        console.error('Error updating data:', error);
      } else {
        fetchData();
        setEditingData((prevState) => {
          const newState = { ...prevState };
          delete newState[id];
          return newState;
        });
      }
    }
  }

  async function deleteItem(id: string) {
    const { error } = await supabase
      .from('data')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
    } else {
      fetchData();
    }
  }

  async function handleAddSource(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/addSource', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: newSourceUrl }),
      });
      
      if (response.ok) {
        setNewSourceUrl(''); // Reset form
        fetchData(); // Refresh the data
      } else {
        console.error('Failed to add new source');
      }
    } catch (error) {
      console.error('Error adding new source:', error);
    }
  }

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.header}>
        <Container>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.logoLink}>
              <Logo />
            </Link>
          </div>
        </Container>
      </header>
      <main className={styles.main}>
        <Container size="large">
          <div className={styles.tableContainer}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Updated At</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        type="text"
                        value={editingData[item.id]?.title || item.title}
                        onChange={(e) => handleInputChange(e, item.id, 'title')}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={editingData[item.id]?.type || item.type}
                        onChange={(e) => handleInputChange(e, item.id, 'type')}
                      />
                    </TableCell>
                    <TableCell>{new Date(item.updated_at).toLocaleString()}</TableCell>
                    <TableCell>
                    <div className={styles.actionButtons}>
                      <Button
                        onClick={() => saveChanges(item.id)}
                        variant="subtle"
                        title="Save"
                      >
                        <IoSaveOutline className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => deleteItem(item.id)}
                        variant="subtle"
                        title="Delete"
                      >
                        <IoTrashBinOutline className="w-5 h-5" />
                      </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <form onSubmit={handleAddSource} className={styles.addForm}>
            <Input
              type="url"
              placeholder="Enter URL"
              value={newSourceUrl}
              onChange={(e) => setNewSourceUrl(e.target.value)}
              required
            />
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </form>
        </Container>
      </main>
    </div>
  );
}