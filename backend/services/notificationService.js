// Notification Service for real-time updates
// This service integrates with Socket.IO for real-time notifications

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Initialize Socket.IO connection
  initializeSocket(io) {
    this.io = io;
    
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Join user-specific room
      socket.on("join", (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  }

  // Notify about new skill request
  notifyNewRequest(ownerId, requestData) {
    this.sendToUser(ownerId, "new_request", {
      type: "skill_request",
      data: requestData,
      message: `New request for your skill: ${requestData.skillName}`,
      timestamp: new Date(),
    });
  }

  // Notify about request status change
  notifyRequestStatus(requesterId, statusData) {
    this.sendToUser(requesterId, "request_update", {
      type: "request_status",
      data: statusData,
      message: `Your request has been ${statusData.status}`,
      timestamp: new Date(),
    });
  }

  // Notify about session reminder
  notifySessionReminder(userId, sessionData) {
    this.sendToUser(userId, "session_reminder", {
      type: "session_reminder",
      data: sessionData,
      message: `Upcoming session: ${sessionData.skillName}`,
      timestamp: new Date(),
    });
  }

  // Notify about session update
  notifySessionUpdate(userId, sessionData) {
    this.sendToUser(userId, "session_update", {
      type: "session_update",
      data: sessionData,
      message: `Session status updated: ${sessionData.status}`,
      timestamp: new Date(),
    });
  }

  // Notify about new badge/achievement
  notifyBadgeEarned(userId, badgeData) {
    this.sendToUser(userId, "badge_earned", {
      type: "badge",
      data: badgeData,
      message: `You earned a new badge: ${badgeData.badgeName}!`,
      timestamp: new Date(),
    });
  }

  // Notify about points update
  notifyPointsUpdate(userId, pointsData) {
    this.sendToUser(userId, "points_update", {
      type: "points",
      data: pointsData,
      message: `You earned ${pointsData.points} points!`,
      timestamp: new Date(),
    });
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

module.exports = NotificationService;
