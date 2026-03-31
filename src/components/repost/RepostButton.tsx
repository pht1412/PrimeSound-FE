// src/components/repost/RepostButton.tsx
import React, { useState, useEffect } from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { repostService } from '../../services/repostService';
import { toast } from 'react-toastify';

interface RepostButtonProps {
  itemId: string;
  itemType: 'Song' | 'Playlist';
  initialIsReposted: boolean;
  onToggle?: (isReposted: boolean) => void;
}

const RepostButton: React.FC<RepostButtonProps> = ({ itemId, itemType, initialIsReposted, onToggle }) => {
  const [isReposted, setIsReposted] = useState(initialIsReposted);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsReposted(initialIsReposted);
  }, [initialIsReposted]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    const newState = !isReposted;

    try {
      if (newState) {
        await repostService.createRepost({ itemId, itemType });
        toast.success("Đã đăng lại!");
      } else {
        await repostService.deleteRepost(itemId);
        toast.success("Đã bỏ đăng lại!");
      }
      setIsReposted(newState);
      if (onToggle) {
        onToggle(newState);
      }
    } catch (error: any) {
      console.error(`Failed to ${newState ? 'repost' : 'un-repost'}:`, error);
      toast.error("Có lỗi xảy ra! Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="p-2 hover:bg-white/10 rounded-full transition group disabled:opacity-50"
      title={isReposted ? `Bỏ đăng lại ${itemType === "Song" ? "bài hát" : "danh sách phát"}` : `Đăng lại ${itemType === "Song" ? "bài hát" : "danh sách phát"}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <RefreshCcw
          className={`w-5 h-5 transition-colors ${
            isReposted
              ? 'text-[#1ed760]'
              : 'text-gray-400 group-hover:text-[#3be477]'
          }`}
        />
      )}
    </button>
  );
};

export default RepostButton;
