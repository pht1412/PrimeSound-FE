// src/pages/NotificationsPage.tsx
import { useState, useEffect, useCallback, type MouseEvent } from 'react';
import { io } from 'socket.io-client';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';
import { followService } from '../services/followService';
import { toast } from 'react-toastify'; // Nếu em muốn hiện thông báo popup

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const NotificationsPage = () => {
    const [activeTab, setActiveTab] = useState('notifications');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [followedBackIds, setFollowedBackIds] = useState<Set<string>>(new Set());

    const getAvatarUrl = (url: string) => {
        if (!url) return "https://ui-avatars.com/api/?name=User&background=1ed760&color=fff";
        if (url.startsWith('http')) return url;
        const filename = url.replace(/^.*[\\\/]/, '');
        return `${BACKEND_URL}/uploads/${filename}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // 1. LẤY THÔNG TIN USER 1 LẦN DUY NHẤT KHI VÀO TRANG
    useEffect(() => {
        const initUser = async () => {
            try {
                const user: any = await userService.getMe();
                setCurrentUser(user);
                if (user && user.following && Array.isArray(user.following)) {
                    setFollowedBackIds(new Set(user.following));
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin user:", error);
            }
        };
        initUser();
    }, []);

    // 2. HÀM TẢI DANH SÁCH THÔNG BÁO (Hỗ trợ chế độ Tải Ngầm)
    const fetchNotificationsList = useCallback(async (userId: string, isSilent = false) => {
        // Nếu không phải tải ngầm thì mới hiện xoay xoay Loading
        if (!isSilent) setLoading(true);
        try {
            const response: any = await notificationService.getNotifications(userId, 1, 20);
            if (response.success) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách thông báo:", error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, []);

    // 3. THEO DÕI SOCKET VÀ DỮ LIỆU
    useEffect(() => {
        if (!currentUser) return;

        // Khi có user, lập tức tải danh sách thông báo lần đầu
        fetchNotificationsList(currentUser._id, false);

        // Khởi tạo kết nối Socket
        const newSocket = io(BACKEND_URL);

        newSocket.on('connect', () => {
            console.log('Đã kết nối Socket.io từ Front-end!');
            newSocket.emit('join', currentUser._id || currentUser.id);
        });

        // 🔔 LẮNG NGHE SỰ KIỆN TỪ BACK-END
        newSocket.on('new_notification', () => {
            console.log('🔔 Có thông báo mới! Đang tải ngầm dữ liệu chuẩn...');

            // THAY VÌ PUSH DỮ LIỆU THÔ, TA GỌI LẠI API BẰNG CHẾ ĐỘ SILENT (True)
            // Giao diện sẽ tự cập nhật thông tin chuẩn xác (Tên, Ảnh) mà không bị giật lag
            fetchNotificationsList(currentUser._id, true);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [currentUser, fetchNotificationsList]);

    const handleNotificationClick = async (notiId: string, isRead: boolean) => {
        if (isRead) return;

        try {
            await notificationService.markAsRead(notiId);
            setNotifications(prevList =>
                prevList.map(noti => noti._id === notiId ? { ...noti, isRead: true } : noti)
            );
        } catch (error) {
            console.error("Lỗi khi đánh dấu đọc:", error);
        }
    };

    const renderNotificationText = (noti: any) => {
        const senderName = noti.senderId?.name || 'Người dùng';
        const songTitle = noti.entityDetails?.title ? (
            <span className="text-white italic"> "{noti.entityDetails.title}"</span>
        ) : null;

        switch (noti.type) {
            case 'like_song':
                return <>{senderName} liked your track{songTitle}</>;
            case 'comment':
                return <>{senderName} commented on your track{songTitle}</>;
            case 'new_upload':
                return <>{senderName} just uploaded a new track{songTitle}</>;
            case 'follow':
                return <>{senderName} started following you</>;
            case 'repost':
                return <>{senderName} reposted your track{songTitle}</>;
            default:
                return <>{senderName} interacted with your profile</>;
        }
    };

    // HÀM XỬ LÝ KHI BẤM NÚT FOLLOW BACK
    const handleFollowBack = async (e: MouseEvent, targetUserId: string) => {
        // e.stopPropagation() cực kỳ quan trọng ở đây! 
        // Nó ngăn không cho sự kiện click lan ra thẻ <div> cha (gây ra việc đánh dấu đã đọc thông báo)
        e.stopPropagation();

        if (!targetUserId) return;

        try {
            await followService.followUser(targetUserId);

            // Cập nhật state để UI đổi sang trạng thái "Đã follow"
            setFollowedBackIds(prev => {
                const newSet = new Set(prev);
                newSet.add(targetUserId);
                return newSet;
            });

            toast.success("Đã theo dõi lại thành công!");
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "";
            // Tự chữa lành: Nếu API báo đã follow rồi thì cứ cập nhật UI luôn
            if (errorMsg.includes("already following") || errorMsg.includes("Đã theo dõi")) {
                setFollowedBackIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(targetUserId);
                    return newSet;
                });
            } else {
                toast.error("Có lỗi xảy ra, không thể theo dõi!");
                console.error("Lỗi Follow Back:", error);
            }
        }
    };

    if (loading) return <div className="text-[#1ed760] flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="noti-container">
            <div className="noti-tabs">
                <div className={`noti-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                    Notifications
                </div>
                <div className={`noti-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                    Messages
                </div>
            </div>

            <div className="noti-section-title">Recent</div>

            <div className="noti-list">
                {notifications.length === 0 ? (
                    <div className="text-[#a7a7a7] italic py-10 px-2">Bạn chưa có thông báo nào.</div>
                ) : (
                    notifications.map((noti) => (
                        <div
                            className="noti-item px-2"
                            key={noti._id}
                            onClick={() => handleNotificationClick(noti._id, noti.isRead)}
                            style={{ cursor: noti.isRead ? 'default' : 'pointer' }}
                        >
                            <div className="noti-item-left">
                                <img src={getAvatarUrl(noti.senderId?.avatar)} alt="avatar" className="noti-avatar" />
                                <div className="noti-content">
                                    <div className="noti-text">
                                        <strong>{renderNotificationText(noti)}</strong>
                                    </div>
                                    <div className="noti-time">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        {formatDate(noti.createdAt)}
                                    </div>
                                </div>
                            </div>

                            <div className="noti-item-right flex items-center gap-3">
                                {!noti.isRead && <div className="w-2.5 h-2.5 bg-[#1ed760] rounded-full shadow-[0_0_8px_#1ed760]"></div>}

                                {['like_song', 'new_upload', 'comment', 'repost'].includes(noti.type) && noti.entityDetails?.coverUrl && (
                                    <img
                                        src={getAvatarUrl(noti.entityDetails.coverUrl)}
                                        alt="Song Cover"
                                        className="w-[45px] h-[45px] rounded-md object-cover shadow-lg border border-[#333]"
                                    />
                                )}

                                {noti.type === 'follow' && noti.senderId?._id && (
                                    <button
                                        onClick={(e) => handleFollowBack(e, noti.senderId._id)}
                                        disabled={followedBackIds.has(noti.senderId._id)}
                                        className={`noti-follow-btn ${followedBackIds.has(noti.senderId._id) ? 'bg-transparent border border-[#1ed760] text-[#1ed760] cursor-default' : 'bg-[#1ed760] text-black hover:scale-105 transition-transform'}`}
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {followedBackIds.has(noti.senderId._id) ? 'Following' : 'Follow back'}
                                    </button>
                                )}                            
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};