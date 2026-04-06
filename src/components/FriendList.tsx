// 好友列表组件
// src/components/FriendList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFriendStore, Friend } from '@/store/friendStore';
import { 
  X, 
  Search, 
  UserPlus, 
  UserMinus, 
  Check, 
  X as RejectIcon,
  Circle,
  MessageCircle,
} from 'lucide-react';

interface FriendListProps {
  onClose: () => void;
}

// 状态指示器
const StatusIndicator: React.FC<{ status: Friend['status'] }> = ({ status }) => {
  const statusConfig = {
    online: { color: '#00ff88', label: '在线' },
    offline: { color: '#4a4d5e', label: '离线' },
    busy: { color: '#ff2d78', label: '忙碌' },
    away: { color: '#ffb800', label: '离开' },
  };
  
  const config = statusConfig[status];
  
  return (
    <div className="relative group">
      <Circle 
        className="w-2.5 h-2.5 fill-current"
        style={{ color: config.color }}
      />
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: 'rgba(18,20,28,0.95)',
          color: config.color,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {config.label}
      </div>
    </div>
  );
};

export const FriendList: React.FC<FriendListProps> = ({ onClose }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    friends,
    requests,
    searchResults,
    isLoading,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
    clearSearch,
    generateMockFriends,
  } = useFriendStore();

  // 初始化模拟数据
  useEffect(() => {
    if (friends.length === 0) {
      generateMockFriends();
    }
  }, []);

  // 搜索处理
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearSearch();
    }
  }, [searchQuery, searchUsers, clearSearch]);

  // 按状态分组
  const onlineFriends = friends.filter(f => f.status === 'online');
  const offlineFriends = friends.filter(f => f.status !== 'online');

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(10,11,15,0.85)' }}
        onClick={onClose}
      />

      {/* 面板 */}
      <div 
        className="relative w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, #1a1d28 0%, #12141c 100%)',
          border: '1px solid rgba(255,45,120,0.2)',
          boxShadow: '0 0 40px rgba(255,45,120,0.15), 0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* 顶部装饰线 */}
        <div 
          className="h-0.5 w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #ff2d78, transparent)' }}
        />

        {/* 头部 */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-xl font-bold flex items-center gap-2"
              style={{ 
                color: '#ff2d78',
                fontFamily: "'Space Grotesk', sans-serif",
                textShadow: '0 0 20px rgba(255,45,120,0.3)',
              }}
            >
              <MessageCircle className="w-6 h-6" />
              好友
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-125"
                style={{
                  background: showSearch ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)',
                  color: showSearch ? '#ff2d78' : '#8b8fa8',
                }}
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-125"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#8b8fa8',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 搜索框 */}
          {showSearch && (
            <div className="mb-3">
              <div 
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Search className="w-4 h-4" style={{ color: '#8b8fa8' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索玩家..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: '#e8e8f0' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs"
                    style={{ color: '#8b8fa8' }}
                  >
                    清空
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 统计 */}
          <div className="flex items-center gap-4 text-xs" style={{ color: '#8b8fa8' }}>
            <span>好友 {friends.length}</span>
            <span>·</span>
            <span style={{ color: '#00ff88' }}>在线 {onlineFriends.length}</span>
            {requests.length > 0 && (
              <>
                <span>·</span>
                <span style={{ color: '#ffb800' }}>申请 {requests.length}</span>
              </>
            )}
          </div>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 好友申请 */}
          {requests.length > 0 && (
            <div className="space-y-2">
              <h3 
                className="text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: '#ffb800' }}
              >
                好友申请
              </h3>
              {requests.map(request => (
                <div
                  key={request.id}
                  className="p-3 rounded-xl"
                  style={{
                    background: 'rgba(255,184,0,0.08)',
                    border: '1px solid rgba(255,184,0,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {request.from.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#e8e8f0' }}>
                        {request.from.name}
                      </p>
                      <p className="text-xs" style={{ color: '#8b8fa8' }}>
                        Lv.{request.from.level} · 🏆 {request.from.achievements}
                      </p>
                      {request.message && (
                        <p className="text-xs mt-1 italic" style={{ color: '#4a4d5e' }}>
                          "{request.message}"
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => acceptRequest(request.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-125"
                        style={{
                          background: 'rgba(0,255,136,0.15)',
                          color: '#00ff88',
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectRequest(request.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-125"
                        style={{
                          background: 'rgba(255,45,120,0.15)',
                          color: '#ff2d78',
                        }}
                      >
                        <RejectIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 搜索结果 */}
          {showSearch && searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 
                className="text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: '#8b8fa8' }}
              >
                搜索结果
              </h3>
              {searchResults.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:brightness-110"
                  style={{
                    background: 'rgba(18,20,28,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#e8e8f0' }}>
                      {user.name}
                    </p>
                    <p className="text-xs" style={{ color: '#8b8fa8' }}>
                      Lv.{user.level} · 🏆 {user.achievements}
                    </p>
                  </div>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110"
                    style={{
                      background: 'rgba(0,212,255,0.15)',
                      border: '1px solid rgba(0,212,255,0.3)',
                      color: '#00d4ff',
                    }}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    添加
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 在线好友 */}
          {onlineFriends.length > 0 && (
            <div className="space-y-2">
              <h3 
                className="text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: '#00ff88' }}
              >
                在线 · {onlineFriends.length}
              </h3>
              {onlineFriends.map(friend => (
                <FriendItem 
                  key={friend.id} 
                  friend={friend} 
                  onRemove={() => removeFriend(friend.id)}
                />
              ))}
            </div>
          )}

          {/* 离线好友 */}
          {offlineFriends.length > 0 && (
            <div className="space-y-2">
              <h3 
                className="text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: '#8b8fa8' }}
              >
                离线 · {offlineFriends.length}
              </h3>
              {offlineFriends.map(friend => (
                <FriendItem 
                  key={friend.id} 
                  friend={friend} 
                  onRemove={() => removeFriend(friend.id)}
                />
              ))}
            </div>
          )}

          {/* 空状态 */}
          {friends.length === 0 && requests.length === 0 && (
            <div className="text-center py-12" style={{ color: '#8b8fa8' }}>
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="mb-2">还没有好友</p>
              <p className="text-xs">搜索玩家添加好友吧</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 好友项组件
const FriendItem: React.FC<{ friend: Friend; onRemove: () => void }> = ({ friend, onRemove }) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:brightness-110"
      style={{
        background: 'rgba(18,20,28,0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {friend.avatar}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          <StatusIndicator status={friend.status} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#e8e8f0' }}>
          {friend.name}
        </p>
        <p className="text-xs" style={{ color: '#8b8fa8' }}>
          Lv.{friend.level} · 🏆 {friend.achievements} · {friend.score.toLocaleString()}分
        </p>
      </div>
      {showActions && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-125"
          style={{
            background: 'rgba(255,45,120,0.15)',
            color: '#ff2d78',
          }}
          title="删除好友"
        >
          <UserMinus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
