import { useState, useCallback, DragEvent } from 'react';

interface DragAndDropOptions {
  onReorder: (items: any[], fromIndex: number, toIndex: number) => void;
  onDragEnd?: () => void;
}

export const useDragAndDrop = (items: any[], options: DragAndDropOptions) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const handleDragStart = useCallback((e: DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a visual effect
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  }, []);
  
  const handleDragEnd = useCallback((e: DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
    options.onDragEnd?.();
  }, [options]);
  
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDragEnter = useCallback((e: DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);
  
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    // Only clear if we're leaving the container
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('[data-draggable]')) {
      setDragOverIndex(null);
    }
  }, []);
  
  const handleDrop = useCallback((e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }
    
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    
    // Remove the dragged item
    newItems.splice(draggedIndex, 1);
    
    // Insert at new position
    const actualDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newItems.splice(actualDropIndex, 0, draggedItem);
    
    options.onReorder(newItems, draggedIndex, actualDropIndex);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, items, options]);
  
  const getDragHandleProps = useCallback((index: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => handleDragStart(e, index),
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDragEnter: (e: DragEvent) => handleDragEnter(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e: DragEvent) => handleDrop(e, index),
    'data-draggable': true,
    style: {
      cursor: 'move',
      ...(dragOverIndex === index ? { 
        borderTop: '2px solid #FFC107',
        paddingTop: '8px' 
      } : {}),
    }
  }), [handleDragStart, handleDragEnd, handleDragOver, handleDragEnter, handleDragLeave, handleDrop, dragOverIndex]);
  
  return {
    draggedIndex,
    dragOverIndex,
    getDragHandleProps,
  };
};