import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  RefreshCcw, 
  Heart, 
  MoreHorizontal, 
  Loader2
} from 'lucide-react';
import { repostService } from '../services/repostService';
import { userService } from '../services/userService'; 
import RepostButton from '../components/repost/RepostButton';

const formatTime = (totalSeconds: number) => {
  if (!totalSeconds) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`; 
};

const RepostPage: React.FC = () => {
  const [reposts, setReposts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [heroCover, setHeroCover] = useState<string>("https://placehold.co/240x240/1f1f1f/white?text=Reposts");

  useEffect(() => {
    const fetchUserAndReposts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userResponse: any = await userService.getMe();
        console.log('User Response:', userResponse)

        const currentUserId = userResponse._id; 

        if (!currentUserId) {
          throw new Error('Could not find user ID.');
        }

        const repostsResponse: any = await repostService.getUserReposts(currentUserId);
        
        const repostsArray = repostsResponse.data?.reposts || [];
        setReposts(repostsArray);

        if (repostsArray.length > 0) {
          const validCovers = repostsArray
            .map((r: any) => r.repostedItem?.coverUrl)
            .filter((url: string) => url && url.trim() !== "");

          if (validCovers.length > 0) {
            const randomIndex = Math.floor(Math.random() * validCovers.length);
            setHeroCover(validCovers[randomIndex]);
          }
        }

      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('Could not load your reposts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndReposts();
  }, []);

  const handleUnrepost = async (itemId: string) => {
    try {
      await repostService.deleteRepost(itemId);
      setReposts(prevReposts => 
        prevReposts.filter(repost => repost.repostedItem._id !== itemId)
      );
    } catch (err) {
      console.error('Failed to un-repost:', err);
      alert('Failed to remove repost. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#121212] min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#3be477]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-[#121212] min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#121212] min-h-screen text-white overflow-y-auto">
      <div className="bg-gradient-to-b from-[#2a593e] to-[#121212] px-8 py-6 h-full pb-20">
        <div className="flex justify-between items-center mb-8">
          <button className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {/* <div className="flex items-center gap-6 text-sm font-semibold">
            <button className="hover:text-gray-300">Share</button>
            <button className="hover:text-gray-300">About</button>
            <button className="hover:text-gray-300">Premium</button>
            <UserCircle2 className="w-8 h-8 cursor-pointer" />
          </div> */}
        </div>

        <div className="flex items-end gap-6 mb-8">
          <div className="w-60 h-60 shadow-2xl shadow-black/50 shrink-0">
            <img 
              src={heroCover}
              alt="Mix Cover" 
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          
          <div className="flex flex-col justify-end w-full pb-2">
            <h1 className="text-6xl font-bold mb-4 tracking-tight">
              Repost songs <span className="text-[#3be477] font-medium opacity-80">mix</span>
            </h1>
            <p className="text-gray-300 text-sm mb-6 max-w-xl leading-relaxed">
              Your personal collection of shared tracks and playlists.
            </p>
            
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3 text-sm font-medium">
                <span>{reposts.length} items</span>
              </div>
              
              <div className="flex items-center gap-4 cursor-pointer hover:scale-105 transition">
                <span className="font-semibold text-lg">Play All</span>
                <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center bg-white/5">
                  <Play className="w-6 h-6 fill-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-[40px_minmax(250px,2fr)_minmax(120px,1fr)_minmax(200px,2fr)_minmax(150px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
            <div>#</div>
            <div>Title</div>
            <div>Release Date</div>
            <div>Album</div>
            <div className="text-right pr-8">Time</div>
          </div>

          <div className="flex flex-col">
            {reposts.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                You haven't reposted any songs yet.
                {/* <RepostButton itemId={'69c8f74d0914bbd97a249d6c'} itemType="Song" /> */}
              </div>
            ) : (
              reposts.map((repost, index) => {
                const item = repost.repostedItem; 
                if (!item) return null;

                return (
                  <div 
                    key={repost._id} 
                    className="grid grid-cols-[40px_minmax(250px,2fr)_minmax(120px,1fr)_minmax(200px,2fr)_minmax(150px,1fr)] gap-4 px-4 py-3 items-center hover:bg-white/10 rounded-md transition group cursor-pointer"
                  >
                    <div className="text-gray-400 font-medium text-lg">
                      {index + 1}
                    </div>
                    
                    <div className="flex items-center gap-4 pr-4">
                      <img 
                        src={item.coverUrl || `https://placehold.co/40x40/2a2a2a/white?text=${index + 1}`} 
                        alt={item.title} 
                        className="w-10 h-10 rounded shadow"
                      />
                      <div className="flex flex-col truncate">
                        <span className="font-semibold text-base text-white truncate">
                          {item.title || 'Unknown Title'}
                        </span>
                        <span className="text-sm text-gray-400 truncate">
                          {item.artist?.name || item.artist?.stageName || 'Unknown Artist'}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 truncate pr-4">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </div>

                    <div className="text-sm text-gray-400 truncate pr-4">
                      {repost.repostedItemType === 'Playlist' ? 'Playlist' : (item.album || 'Single')}
                    </div>

                    <div className="flex items-center justify-end gap-5 text-gray-400">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleUnrepost(item._id);
                        }}
                        className="hover:scale-110 transition"
                        title="Remove Repost"
                      >
                        <RefreshCcw className="w-5 h-5 text-[#3be477]" />
                      </button>
                      <Heart className="w-5 h-5 hover:text-white transition" />
                      <span className="text-sm w-8 text-right">
                        {formatTime(item.duration)}
                      </span>
                      <MoreHorizontal className="w-5 h-5 hover:text-white transition opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RepostPage;