import React, { useState } from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { repostService } from '../../services/repostService';
import { toast } from 'react-toastify';

interface RepostButtonProps {
  itemId: string;
  itemType: 'Song' | 'Playlist';
}

const RepostButton: React.FC<RepostButtonProps> = ({ itemId, itemType }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      await repostService.createRepost({ itemId, itemType });
      
      toast.success("Đã đăng lại!");
      
    } catch (error: any) {
      console.error('Failed to repost:', error);
      
      if (error?.status === 409 || error?.message?.includes('đã đăng lại')) {
        toast.info("Bạn đã đăng lại rồi!");
      } else {
        toast.error("Có lỗi xảy ra! Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRepost}
      disabled={isLoading}
      className="p-2 hover:bg-white/10 rounded-full transition group disabled:opacity-50"
      title={`Đăng lại ${itemType == "Song" ? "bài hát" : "danh sách phát"}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      ) : (
        <RefreshCcw className="w-5 h-5 text-gray-400 group-hover:text-[#3be477] transition-colors" />
      )}
    </button>
  );
};

export default RepostButton;