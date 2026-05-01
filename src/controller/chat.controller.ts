import type { Request, Response } from 'express';
import { ChatService } from '../service/chat.service.js';
import logger from '../utils/logger.utils.js';

const chatService = new ChatService();

export const getRoomMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    
    // Validate roomId
    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Invalid roomId',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const data = await chatService.getAllMessages(roomId);
    
    res.status(200).json({
      status: 200,
      success: true,
      message: "Room messages retrieved successfully",
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getRoomMessages', { error });
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch room messages',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

export const sendMessageREST = async (req: Request, res: Response) => {
  try {
    const { roomId, message, image } = req.body;
    const userId = (req as any).user?.userId;

    if (!roomId || !message) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'roomId and message are required',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (!userId) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: 'Unauthorized',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const result = await chatService.sendMessage({
      roomId,
      userId,
      message,
      image
    });

    res.status(201).json({
      status: 201,
      success: true,
      message: "Message sent successfully",
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in sendMessageREST', { error });
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to send message',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

export const getRoomUsers = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    // Validate roomId
    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({
        status: 400,
        success: false,
        message: 'Invalid roomId',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const data = await chatService.getAllMessages(roomId);
    
    res.status(200).json({
      status: 200,
      success: true,
      message: "Room users retrieved successfully",
      data: {
        roomId,
        userCount: data.userIds.length,
        userIds: data.userIds
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getRoomUsers', { error });
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch room users',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

export const getUserRooms = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
  
      if (!userId) {
        return res.status(401).json({
          status: 401,
          success: false,
          message: 'Unauthorized',
          data: null,
          timestamp: new Date().toISOString()
        });
      }
  
      const rooms = await chatService.getUserRooms(userId);
      
      res.status(200).json({
        status: 200,
        success: true,
        message: "User rooms retrieved successfully",
        data: rooms,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getUserRooms', { error });
      res.status(500).json({
        status: 500,
        success: false,
        message: 'Failed to fetch user rooms',
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  };

export const initiateChat = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { targetUserId } = req.body;

        if (!userId) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Unauthorized',
                data: null,
                timestamp: new Date().toISOString()
            });
        }

        if (!targetUserId) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'targetUserId is required',
                data: null,
                timestamp: new Date().toISOString()
            });
        }

        const room = await chatService.getOrCreateRoom({ userId, targetUserId });

        res.status(200).json({
            status: 200,
            success: true,
            message: "Chat initiated successfully",
            data: room,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        logger.error('Error in initiateChat', { error });
        res.status(error.status || 500).json({
            status: error.status || 500,
            success: false,
            message: error.message || 'Failed to initiate chat',
            data: null,
            timestamp: new Date().toISOString()
        });
    }
};