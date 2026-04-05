// 通知服务 - 浏览器通知

class NotificationService {
  private permission: NotificationPermission = 'default';

  // 请求通知权限
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('浏览器不支持通知');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  // 发送通知
  send(title: string, options?: NotificationOptions): void {
    if (this.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return; // 用户在看页面，不需要通知

    try {
      const notification = new Notification(title, {
        icon: '🎬',
        badge: '🎬',
        tag: 'chumen-notification',
        ...options,
      });

      // 5秒后自动关闭
      setTimeout(() => notification.close(), 5000);

      // 点击通知聚焦页面
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn('通知发送失败:', e);
    }
  }

  // 便捷方法
  notifyNewDialogue = (agentName: string) => {
    this.send(`${agentName} 说了新的话`, {
      body: '点击查看对话内容',
      tag: 'dialogue',
    });
  };

  notifyEvent = (title: string) => {
    this.send(`🎭 ${title}`, {
      body: '有新的剧情事件发生',
      tag: 'event',
    });
  };

  notifyAchievement = (title: string) => {
    this.send(`🏆 成就解锁: ${title}`, {
      body: '恭喜获得新成就！',
      tag: 'achievement',
    });
  };

  notifyDailyComplete = () => {
    this.send('🎯 每日挑战完成！', {
      body: '快来领取奖励吧',
      tag: 'daily',
    });
  };

  notifyNPCAlert = (npcName: string) => {
    this.send(`🗣️ ${npcName} 有话说`, {
      body: '点击查看',
      tag: 'npc',
    });
  };
}

export const notificationService = new NotificationService();
