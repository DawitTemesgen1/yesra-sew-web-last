import { apiService } from '../api';

// Data service for handling data transformations and business logic
export const dataService = {
  // Transform listing data for frontend
  transformListing: (listing) => {
    return {
      id: listing.uuid,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      type: listing.type,
      location: listing.location,
      category: listing.category_name,
      categoryId: listing.category_id,
      images: listing.images ? JSON.parse(listing.images) : [],
      contactName: listing.contact_name,
      contactEmail: listing.contact_email,
      contactPhone: listing.contact_phone,
      status: listing.status,
      isFeatured: listing.is_featured,
      isUrgent: listing.is_urgent,
      views: listing.views,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      expiresAt: listing.expires_at,
      specs: listing.specs || {},
      userId: listing.user_id,
      isFavorited: listing.is_favorited || false,
      user: {
        id: listing.user_id,
        firstName: listing.first_name,
        lastName: listing.last_name,
        avatar: listing.avatar_url,
      },
    };
  },

  // Transform user data for frontend
  transformUser: (user) => {
    return {
      id: user.uuid,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar_url,
      bio: user.bio,
      location: user.location,
      isVerified: user.is_verified,
      isPremium: user.is_premium,
      isActive: user.is_active,
      emailVerifiedAt: user.email_verified_at,
      phoneVerifiedAt: user.phone_verified_at,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      premiumExpiresAt: user.premium_expires_at,
    };
  },

  // Transform category data for frontend
  transformCategory: (category) => {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      imageUrl: category.image_url,
      parentId: category.parent_id,
      sortOrder: category.sort_order,
      isActive: category.is_active,
      listingsCount: category.listings_count || 0,
      subcategoriesCount: category.subcategories_count || 0,
      subcategories: category.subcategories || [],
    };
  },

  // Transform notification data for frontend
  transformNotification: (notification) => {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data ? JSON.parse(notification.data) : {},
      isRead: notification.is_read,
      readAt: notification.read_at,
      createdAt: notification.created_at,
    };
  },

  // Transform chat room data for frontend
  transformChatRoom: (chatRoom) => {
    return {
      id: chatRoom.id,
      uuid: chatRoom.uuid,
      participant1Id: chatRoom.participant1_id,
      participant2Id: chatRoom.participant2_id,
      listingId: chatRoom.listing_id,
      lastMessageAt: chatRoom.last_message_at,
      lastMessagePreview: chatRoom.last_message_preview,
      createdAt: chatRoom.created_at,
      otherUser: {
        id: chatRoom.other_user_id,
        firstName: chatRoom.other_user_first_name,
        lastName: chatRoom.other_user_last_name,
        avatar: chatRoom.other_user_avatar_url,
      },
      listing: chatRoom.listing_id ? {
        id: chatRoom.listing_id,
        title: chatRoom.listing_title,
        uuid: chatRoom.listing_uuid,
      } : null,
      unreadCount: chatRoom.unread_count || 0,
    };
  },

  // Transform chat message data for frontend
  transformChatMessage: (message) => {
    return {
      id: message.id,
      roomId: message.room_id,
      senderId: message.sender_id,
      message: message.message,
      messageType: message.message_type,
      isRead: message.is_read,
      readAt: message.read_at,
      createdAt: message.created_at,
      sender: {
        id: message.sender_id,
        firstName: message.first_name,
        lastName: message.last_name,
        avatar: message.avatar_url,
      },
    };
  },

  // Transform payment transaction data for frontend
  transformPaymentTransaction: (transaction) => {
    return {
      id: transaction.uuid,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      method: transaction.method,
      status: transaction.status,
      gatewayTransactionId: transaction.gateway_transaction_id,
      userId: transaction.user_id,
      listingId: transaction.listing_id,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
      completedAt: transaction.completed_at,
      listing: transaction.listing_title ? {
        id: transaction.listing_id,
        title: transaction.listing_title,
        uuid: transaction.listing_uuid,
      } : null,
      user: {
        id: transaction.user_id,
        firstName: transaction.first_name,
        lastName: transaction.last_name,
        email: transaction.email,
      },
    };
  },

  // Transform report data for frontend
  transformReport: (report) => {
    return {
      id: report.id,
      listingId: report.listing_id,
      reporterId: report.reporter_id,
      reason: report.reason,
      description: report.description,
      status: report.status,
      adminNotes: report.admin_notes,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
      listing: {
        id: report.listing_id,
        title: report.listing_title,
        uuid: report.listing_uuid,
      },
      reporter: {
        id: report.reporter_id,
        firstName: report.reporter_first_name,
        email: report.reporter_email,
      },
      owner: {
        id: report.owner_id,
        firstName: report.owner_first_name,
        email: report.owner_email,
      },
    };
  },

  // Get listings with transformation
  getListings: async (params = {}) => {
    const response = await apiService.listings.getAll(params);
    const listings = response.data.data.listings.map(dataService.transformListing);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        listings,
      },
    };
  },

  // Get single listing with transformation
  getListing: async (id) => {
    const response = await apiService.listings.getById(id);
    const listing = dataService.transformListing(response.data.data.listing);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        listing,
      },
    };
  },

  // Get categories with transformation
  getCategories: async (params = {}) => {
    const response = await apiService.categories.getAll(params);
    const categories = response.data.data.categories.map(dataService.transformCategory);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        categories,
      },
    };
  },

  // Get user profile with transformation
  getUserProfile: async () => {
    const response = await apiService.users.getProfile();
    const user = dataService.transformUser(response.data.data.user);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        user,
      },
    };
  },

  // Get notifications with transformation
  getNotifications: async (params = {}) => {
    const response = await apiService.users.getNotifications(params);
    const notifications = response.data.data.notifications.map(dataService.transformNotification);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        notifications,
      },
    };
  },

  // Get chat rooms with transformation
  getChatRooms: async (params = {}) => {
    const response = await apiService.chat.getRooms(params);
    const rooms = response.data.data.rooms.map(dataService.transformChatRoom);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        rooms,
      },
    };
  },

  // Get chat messages with transformation
  getChatMessages: async (roomId, params = {}) => {
    const response = await apiService.chat.getRoom(roomId, params);
    const messages = response.data.data.messages.map(dataService.transformChatMessage);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        messages,
      },
    };
  },

  // Get payment history with transformation
  getPaymentHistory: async (params = {}) => {
    const response = await apiService.payments.getHistory(params);
    const transactions = response.data.data.transactions.map(dataService.transformPaymentTransaction);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        transactions,
      },
    };
  },

  // Create listing with proper data formatting
  createListing: async (formData) => {
    const response = await apiService.listings.create(formData);
    const listing = dataService.transformListing(response.data.data.listing);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        listing,
      },
    };
  },

  // Update listing with proper data formatting
  updateListing: async (id, formData) => {
    const response = await apiService.listings.update(id, formData);
    const listing = dataService.transformListing(response.data.data.listing);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        listing,
      },
    };
  },

  // Toggle favorite with proper response handling
  toggleFavorite: async (id) => {
    const response = await apiService.listings.toggleFavorite(id);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        isFavorited: response.data.data.is_favorited,
      },
    };
  },

  // Send message with proper data formatting
  sendMessage: async (roomId, messageData) => {
    const response = await apiService.chat.sendMessage(roomId, messageData);
    const message = dataService.transformChatMessage(response.data.data.message);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        message,
      },
    };
  },

  // Create chat room with proper data formatting
  createChatRoom: async (roomData) => {
    const response = await apiService.chat.createRoom(roomData);
    const room = dataService.transformChatRoom(response.data.data.room);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        room,
      },
    };
  },
};

export default dataService;

