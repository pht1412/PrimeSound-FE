// src/pages/NotificationsPage.tsx
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService'; // Lấy thông tin user hiện tại

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const NotificationsPage = () => {
    const [activeTab, setActiveTab] = useState('notifications');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Khởi tạo Socket
    const [socket, setSocket] = useState<Socket | null>(null);

    // Chuẩn hóa đường dẫn Avatar (Giống bên Header.tsx)
    const getAvatarUrl = (url: string) => {
        if (!url) return "https://ui-avatars.com/api/?name=User&background=1ed760&color=fff";
        if (url.startsWith('http')) return url;
        const filename = url.replace(/^.*[\\\/]/, '');
        return `${BACKEND_URL}/uploads/${filename}`;
    };

    // Hàm fomat thời gian (VD: hiển thị ngày/tháng/năm)
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // 1. Fetch dữ liệu User & Danh sách thông báo khi mới vào trang
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                // Lấy thông tin User đang đăng nhập
                const user: any = await userService.getMe();
                setCurrentUser(user);

                // Lấy danh sách thông báo từ API
                const userId = user._id;
                const response: any = await notificationService.getNotifications(userId, 1, 20);
                if (response.success) {
                    setNotifications(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thông báo:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 2. Thiết lập Socket.io để nhận Real-time
    useEffect(() => {
        if (!currentUser) return;

        // Khởi tạo kết nối Socket
        const newSocket = io(BACKEND_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Đã kết nối Socket.io từ Front-end!');
            // Gửi event 'join' kèm ID user để vào đúng room
            newSocket.emit('join', currentUser._id || currentUser.id);
        });

        // Lắng nghe sự kiện có thông báo mới
        newSocket.on('new_notification', (newNoti) => {
            console.log('Có thông báo mới Real-time:', newNoti);
            // Chèn thông báo mới lên đầu danh sách hiện tại
            setNotifications((prevList) => [newNoti, ...prevList]);
        });

        // Cleanup khi rời khỏi trang
        return () => {
            newSocket.disconnect();
        };
    }, [currentUser]);

    // 3. Hàm xử lý khi Click vào thông báo (Đánh dấu đã đọc)
    const handleNotificationClick = async (notiId: string, isRead: boolean) => {
        if (isRead) return; // Đọc rồi thì bỏ qua

        try {
            // Gọi API cập nhật DB
            await notificationService.markAsRead(notiId);

            // Cập nhật lại State để UI gỡ chấm đỏ (nếu có làm)
            setNotifications(prevList =>
                prevList.map(noti => noti._id === notiId ? { ...noti, isRead: true } : noti)
            );
        } catch (error) {
            console.error("Lỗi khi đánh dấu đọc:", error);
        }
    };

    // Render logic cho Text thông báo
    // Render logic cho Text thông báo
    const renderNotificationText = (noti: any) => {
        // Đã lấy được tên thật từ Back-end
        const senderName = noti.senderId?.name || 'Người dùng';

        // Tên bài hát (Nếu có)
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

    if (loading) return <div className="text-white p-10 text-center font-medium">Đang tải thông báo...</div>;

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
                    <div className="text-[#a7a7a7] italic">Bạn chưa có thông báo nào.</div>
                ) : (
                    notifications.map((noti) => (
                        <div
                            className="noti-item px-2"
                            key={noti._id}
                            onClick={() => handleNotificationClick(noti._id, noti.isRead)}
                            style={{ cursor: noti.isRead ? 'default' : 'pointer' }}
                        >
                            <div className="noti-item-left">
                                {/* Ảnh đại diện người gửi */}
                                <img src={getAvatarUrl(noti.senderId?.avatar)} alt="avatar" className="noti-avatar" />
                                <div className="noti-content">
                                    <div className="noti-text">
                                        <strong>{renderNotificationText(noti)}</strong>
                                        {/* Nếu type là thông báo bài hát thì có thể chèn thêm tên bài hát ở đây nếu Back-end có trả về entityName */}
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
                                {/* Chấm tròn báo chưa đọc */}
                                {!noti.isRead && <div className="w-2.5 h-2.5 bg-[#1ed760] rounded-full shadow-[0_0_8px_#1ed760]"></div>}

                                {/* HIỂN THỊ ẢNH BÌA BÀI HÁT THẬT */}
                                {['like_song', 'new_upload', 'comment', 'repost'].includes(noti.type) && noti.entityDetails?.coverUrl && (
                                    <img
                                        src={getAvatarUrl(noti.entityDetails.coverUrl)}
                                        alt="Song Cover"
                                        className="w-[45px] h-[45px] rounded-md object-cover shadow-lg border border-[#333]"
                                    />
                                )}

                                {/* HIỂN THỊ NÚT FOLLOW BACK */}
                                {noti.type === 'follow' && <button className="noti-follow-btn">Follow back</button>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};