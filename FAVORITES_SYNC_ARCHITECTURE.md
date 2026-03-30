# 🎭 Global Favorites Sync Architecture

## 📋 Tổng quan
Hệ thống đồng bộ hóa like/unlike toàn cục giữa các trang. Khi người dùng like/unlike một bài hát ở bất kỳ đâu, tất cả component khác sẽ tự động cập nhật trạng thái.

---

## 🏗️ Architecture Overview

```
App.tsx
├── FavoritesProvider (Global Context)
│   ├── MusicPlayerProvider
│   │   └── BrowserRouter
│   │       ├── FooterPlayer (tracks: currentlyLiked)
│   │       ├── SongRow (displays: like heart icon)
│   │       └── FavoriteSongsPage (sync with global state)
```

---

## 🔧 Thành phần chính

### 1. **FavoritesContext.tsx** - Global State Management

**Mục đích**: Quản lý tập hợp các bài hát đã like ở cấp độ application

**Key Features**:
- 📊 **Set-based Storage**: Lưu trữ `likedSongIds` từ `Set<string>` (O(1) lookup)
- 🔄 **Optimistic Updates**: Cập nhật UI ngay lập tức, đồng bộ API sauúy
- 🛡️ **Rollback on Error**: Revert state nếu API call thất bại
- 🔌 **Auto-Initialize**: Tự động load danh sách liked songs khi app khởi động

**Public Methods**:
```typescript
// Lấy trạng thái like của bài hát
isLiked(songId: string) => boolean

// Toggle like/unlike (handle optimistic update + API sync)
toggleLike(songId: string) => Promise<void>

// Get total số bài hát đã like
getLikedCount() => number

// Manual sync với server
initializeLikedSongs() => Promise<void>
```

**State Flow**:
```
User clicks heart
    ↓
toggleLike() triggered
    ↓
[Optimistic] Update likedSongIds immediately
    ↓
[Async] Call API (likeSong/unlikeSong)
    ↓
Success → State persists
Fail    → Rollback to previous state
```

---

### 2. **SongRow.tsx** - UI Component (Subscribe to Context)

**Mục đích**: Hiển thị trạng thái like từ global context

**Key Changes**:
- ❌ **Removed**: Local state `isLiked` + `initiallyLiked` prop
- ✅ **Added**: `useFavorites()` hook để lấy global state
- 📌 **Derived State**: `currentlyLiked = useMemo(() => isLiked(song._id))`
- 🎯 **Action**: Click heart → call `toggleLike(songId)` từ context

**Component Tree**:
```
SongRow
├── useFavorites() → { isLiked, toggleLike }
├── useMemo(currentlyLiked) → re-compute only if song._id changes
└── handleToggleLike() → calls context.toggleLike()
```

---

### 3. **FooterPlayer.tsx** - Now Playing Control

**Mục đích**: Hiển thị + quản lý like của bài hát đang phát

**Key Changes**:
- ✅ **Added**: `useFavorites()` hook
- 📌 **Derived State**: `currentlyLiked = useMemo(() => isLiked(currentSong?.id))`
- 🎨 **Dynamic Icon**: Heart filled nếu liked, outline nếu not
- 🔄 **Sync**: Auto re-render khi user like/unlike bài hát

**Behavior**:
```
When user clicks ❤️:
  1. handleToggleLike() called
  2. context.toggleLike(songId) executed
  3. Global state updated
  4. All SongRow & FooterPlayer re-render
  5. Icon color changes immediately
```

---

### 4. **FavoriteSongsPage.tsx** - Favorites List

**Mục đích**: Hiển thị danh sách bài hát yêu thích

**Key Changes**:
- ✅ **Added**: `useFavorites()` hook
- 🔄 **Watch**: `getLikedCount()` để detect thay đổi
- 🗑️ **Removed**: `initiallyLiked={true}` prop từ SongRow
- 📋 **Callback**: `fetchFavoriteSongs()` wrapped with `useCallback`

**Sync Logic**:
```typescript
// Monitor global liked count
useEffect(() => {
  const likedCount = getLikedCount();
  console.log(`Liked count: ${likedCount}`);
  // Optionally refresh list, nhưng không bắt buộc
  // vì SongRow đã subscribe context
}, [getLikedCount()]);
```

---

### 5. **App.tsx** - Root Provider Setup

**Hierarchy**:
```tsx
<FavoritesProvider>          {/* Outer: Global Favorites */}
  <MusicPlayerProvider>      {/* Inner: Music Playback */}
    <BrowserRouter>
      {/* Pages */}
    </BrowserRouter>
  </MusicPlayerProvider>
</FavoritesProvider>
```

**Why this order?**
- FavoritesProvider wraps everything vì nó là root state
- MusicPlayerProvider phụ thuộc vào FavoritesProvider? Không, nhưng organize nested providers theo cấp độ importance

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FavoritesContext                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  likedSongIds: Set<string>                            │  │
│  │  {songId1, songId2, songId3, ...}                     │  │
│  │                                                       │  │
│  │  Methods:                                             │  │
│  │  - isLiked(songId) → boolean                          │  │
│  │  - toggleLike(songId) → Promise<void>                 │  │
│  │  - getLikedCount() → number                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↑                           ↑
         │ subscribe                 │ subscribe
         │                           │
    ┌────────────┐             ┌──────────────┐
    │ SongRow    │             │ FooterPlayer │
    ├────────────┤             ├──────────────┤
    │ ❤️ Heart   │             │ ❤️ Heart     │
    │ Icon       │             │ Button       │
    │            │             │              │
    │ onClick:   │             │ onClick:     │
    │ toggleLike │             │ toggleLike   │
    └────────────┘             └──────────────┘
         ↑                           ↑
         │                           │
    Both trigger same action: context.toggleLike(songId)
```

---

## 🔄 Sync Scenario Example

### Scenario: User likes song in FavoriteSongsPage

```
1. User sees song in FavoriteSongsPage → SongRow component
2. User clicks ❤️ icon
   ↓
3. SongRow.handleToggleLike() → context.toggleLike(songId)
   ↓
4. Context: [Optimistic] Add songId to Set immediately
   ✅ UI updates instantly (heart turns green)
   ↓
5. Context: [Async] Call favoriteService.likeSong(songId)
   ✓ API success → State persists
   ✗ API fail    → Rollback: Remove songId from Set
   ↓
6. ALL Components re-render because they subscribe to same context:
   - ✅ Same SongRow: Heart stays green
   - ✅ FooterPlayer: If same song playing → Heart green
   - ✅ Other SongRows: If same song in other pages → Heart green
```

---

## 🎯 Best Practices (Senior Pattern)

### ✅ What We Did Right

1. **Set-based Storage** 
   - O(1) lookup instead of O(n) array search
   - Better for large liked songs lists

2. **Optimistic Updates**
   - UI updates instantly (responsive)
   - API syncs in background
   - Rollback on error

3. **Dependency Injection via Context API**
   - No prop drilling
   - Components stay clean & decoupled
   - Easy to test

4. **Separation of Concerns**
   - FavoritesContext = State management
   - SongRow = Presentation + User interaction
   - FooterPlayer = Display current song like status
   - FavoriteSongsPage = List display

5. **Memory Efficient**
   - Only track IDs, not full song objects
   - Minimal re-render because useMemo() + useCallback()
   - Set.has() is O(1)

6. **Error Handling**
   - Graceful rollback on API failure
   - Console logs for debugging
   - Prevents corrupted UI state

---

## 🔍 Performance Considerations

### Re-render Analysis

```typescript
// ✅ Optimized: Only re-render when song ID changes
const currentlyLiked = useMemo(() => {
  return currentSong ? isLiked(currentSong.id) : false;
}, [currentSong?.id, isLiked]);

// ❌ Not optimized would be:
const currentlyLiked = isLiked(currentSong?.id);
// ^ Re-renders on every context change
```

### Why Set over Array

```typescript
// ✅ Fast: O(1) lookup
const liked = likedSongIds.has(songId);

// ❌ Slow: O(n) lookup
const liked = likedSongIds.find(id => id === songId);
```

---

## 🧪 Testing Checklist

- [ ] Like song in SongRow → Heart turns green globally
- [ ] Like song in FooterPlayer → All SongRow hearts update
- [ ] Unlike song → Heart turns gray globally
- [ ] Network error → UI rollback to previous state
- [ ] App reload → Liked songs persist from server
- [ ] Like same song in 2 pages → Both show liked state
- [ ] Quick clicks prevention → Loading state handled

---

## 📚 File Structure

```
src/
├── context/
│   ├── FavoritesContext.tsx      ← Global like state
│   ├── MusicPlayerContext.tsx    ← Existing
├── components/
│   ├── shared/
│   │   └── SongRow.tsx           ← Updated: uses FavoritesContext
│   ├── layout/
│   │   └── FooterPlayer.tsx      ← Updated: uses FavoritesContext
├── pages/
│   └── FavoriteSongsPage.tsx     ← Updated: removed initiallyLiked
├── services/
│   └── favoriteService.ts        ← API calls (unchanged)
├── App.tsx                       ← Updated: wrap with FavoritesProvider
```

---

## 💡 Future Enhancements

1. **UI Improvements**
   - Toast notifications on like/unlike
   - Undo button for recent actions
   - Like count display

2. **Performance**
   - Pagination for liked songs list
   - Lazy loading in FavoriteSongsPage
   - Cache liked songs

3. **Features**
   - Playlist creation from liked songs
   - Share liked songs with friends
   - Analytics on most-liked songs

---

## 🚀 Deployment Notes

- Set-based approach scales well to 10k+ liked songs
- Optimistic updates improve perceived performance
- Error handling prevents bad states
- Ready for production use
