import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, Trash2, GripHorizontal } from 'lucide-react';

export interface MediaItem {
  id: string;
  url: string;
  isCover: boolean;
  type: 'IMAGE' | 'VIDEO';
  isLocalPreview?: boolean; // True if just uploaded but not saved to DB
}

interface MediaGalleryManagerProps {
  items: MediaItem[];
  onReorder: (newItems: MediaItem[]) => void;
  onSetCover: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortablePhotoItem = ({ item, onSetCover, onDelete }: { item: MediaItem; onSetCover: any; onDelete: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl overflow-hidden shadow-sm group bg-gray-100 aspect-[4/3] border-2 transition-colors ${
        item.isCover ? 'border-accent' : 'border-transparent hover:border-gray-200'
      } ${isDragging ? 'opacity-50 scale-105 shadow-xl' : 'opacity-100'}`}
    >
      {/* The Image */}
      <img src={item.url} alt="Property Media" className="w-full h-full object-cover" />
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
        {/* Top bar */}
        <div className="flex justify-between items-start">
          <button
            onClick={() => onSetCover(item.id)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              item.isCover ? 'bg-accent text-white shadow-lg' : 'bg-white/20 text-white hover:bg-accent/80'
            }`}
            title="Set as Cover Image"
          >
            <Star size={18} className={item.isCover ? 'fill-current' : ''} />
          </button>
          
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 bg-white/20 hover:bg-red-500/90 text-white rounded-full backdrop-blur-sm transition-colors shadow-sm"
            title="Delete Image"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="self-center p-2 text-white/70 hover:text-white cursor-grab active:cursor-grabbing"
        >
          <GripHorizontal size={24} />
        </div>
      </div>
      
      {/* Persistent Cover Badge */}
      {item.isCover && (
        <div className="absolute bottom-3 left-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          Cover Image
        </div>
      )}
    </div>
  );
};

export const MediaGalleryManager: React.FC<MediaGalleryManagerProps> = ({
  items,
  onReorder,
  onSetCover,
  onDelete,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-primary mb-4">Gallery Manager</h3>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(i => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <SortablePhotoItem
                key={item.id}
                item={item}
                onSetCover={onSetCover}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
