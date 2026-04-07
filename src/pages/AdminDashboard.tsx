import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../api/api';

interface Song {
  _id: string;
  id?: string;
  title: string;
  artist: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  albumId?: string | null;
  genre: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
  playCount?: number;
}

export const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  // Fetch danh sách bài hát cần duyệt
  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('songs/admin/list');
      console.log('📋 AdminDashboard: Response from API:', response);
      
      // Handle different response formats
      let songList = Array.isArray(response) ? response : (response?.data || (response as any)?.songs || []);
      
      if (!Array.isArray(songList)) {
        console.error('❌ Songs is not an array:', songList);
        songList = [];
      }
      
      // Log first song structure to debug
      if (songList.length > 0) {
        console.log('🎵 AdminDashboard: First song structure:', songList[0]);
        console.log('📊 AdminDashboard: UploadedBy object:', songList[0].uploadedBy);
        console.log('📊 AdminDashboard: Artist object:', songList[0].artist);
      }
      
      setSongs(songList as Song[]);
    } catch (error: any) {
      console.error('❌ Lỗi khi tải danh sách bài hát:', error);
      toast.error('Không thể tải danh sách bài hát');
    } finally {
      setIsLoading(false);
    }
  };

  // Update trạng thái bài hát
  const updateSongStatus = async (songId: string, status: 'approved' | 'rejected') => {
    try {
      setUpdateLoading(songId);
      await api.patch(`/songs/admin/${songId}/status`, { status });
      
      // Update local state
      setSongs(songs.map(song => 
        song._id === songId || song.id === songId 
          ? { ...song, status } 
          : song
      ));
      
      toast.success(`Bài hát đã được ${status === 'approved' ? 'phê duyệt' : 'từ chối'}`);
    } catch (error: any) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      toast.error('Cập nhật trạng thái thất bại');
    } finally {
      setUpdateLoading(null);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Nếu không phải admin, redirect
  if (!isAdmin) {
    navigate('/home');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-[#282828] pb-6">
        <div>
          <h1 className="text-4xl font-bold">
            Admin <span className="text-[#1ed760]">Dashboard</span>
          </h1>
          <p className="text-[#b3b3b3] mt-2">Xin chào, {user?.name || user?.email}</p>
        </div>
        
        <button
          onClick={logout}
          className="px-6 py-2 bg-[#1ed760] text-black hover:bg-[#1ed760]/80 font-bold rounded-full transition-all"
        >
          Đăng xuất
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Danh sách bài hát cần duyệt</h2>
          <button
            onClick={fetchSongs}
            disabled={isLoading}
            className="px-4 py-2 bg-[#282828] hover:bg-[#333333] rounded-full transition-all disabled:opacity-50"
          >
            {isLoading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        {/* Songs Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-[#1ed760] border-t-transparent rounded-full"></div>
            </div>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12 bg-[#282828] rounded-lg">
            <p className="text-[#b3b3b3] text-lg">Không có bài hát nào cần duyệt</p>
          </div>
        ) : (
          <div className="bg-[#282828] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#404040] bg-[#1db954]/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1ed760]">Tên bài hát</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1ed760]">Nghệ sĩ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1ed760]">Người tải</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1ed760]">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1ed760]">Ngày tải</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#1ed760]">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#404040]">
                  {songs.map((song) => {
                    try {
                      return (
                        <tr key={song._id || song.id} className="hover:bg-[#333333] transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-white truncate">{song.title}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[#b3b3b3]">{song.artist?.name || 'Unknown'}</p>
                          </td>
                          <td className="px-6 py-4">
                            {song.uploadedBy ? (
                              <p className="text-[#b3b3b3] font-medium">
                                {song.uploadedBy?.name || 'Unknown'}
                              </p>
                            ) : (
                              <p className="text-[#b3b3b3]">N/A</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                song.status === 'approved'
                                  ? 'bg-[#1ed760]/20 text-[#1ed760]'
                                  : song.status === 'rejected'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {song.status === 'approved'
                                ? 'Đã phê duyệt'
                                : song.status === 'rejected'
                                ? 'Bị từ chối'
                                : 'Đang chờ'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[#b3b3b3] text-sm">
                              {new Date(song.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => updateSongStatus((song._id || song.id) as string, 'approved')}
                                disabled={updateLoading === (song._id || song.id) || song.status === 'approved'}
                                className="px-3 py-2 bg-[#1ed760] text-black hover:bg-[#1ed760]/80 disabled:opacity-50 rounded font-semibold transition-all text-sm"
                              >
                                {updateLoading === (song._id || song.id) ? 'Đang...' : 'Phê duyệt'}
                              </button>
                              <button
                                onClick={() => updateSongStatus((song._id || song.id) as string, 'rejected')}
                                disabled={updateLoading === (song._id || song.id) || song.status === 'rejected'}
                                className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded font-semibold transition-all text-sm"
                              >
                                {updateLoading === (song._id || song.id) ? 'Đang...' : 'Từ chối'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    } catch (error) {
                      console.error('❌ Error rendering song row:', song, error);
                      return null;
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-[#666666] text-sm">
        <p>✓ Admin Dashboard - Chỉ admin được phép truy cập</p>
      </div>
    </div>
  );
};
