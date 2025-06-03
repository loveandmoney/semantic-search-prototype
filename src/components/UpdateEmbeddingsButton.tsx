'use client';

import { apiService } from '@/lib/apiService';
import { Button } from './ui/button';
import { useState } from 'react';

export const UpdateEmbeddingsButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmbeddings = async () => {
    setIsLoading(true);

    try {
      const data = await apiService.updateEmbeddings();
      console.log(data);
    } catch (error) {
      console.error('Error creating index and embeddings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button disabled={isLoading} onClick={handleUpdateEmbeddings}>
      Update embeddings
    </Button>
  );
};
