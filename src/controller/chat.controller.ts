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
        status: 'error',
        message: 'Invalid roomId'
      });
    }

    const data = await chatService.getAllMessages(roomId);
    
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    logger.error('Error in getRoomMessages', { error });
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch room messages'
    });
  }
};

export const sendMessageREST = async (req: Request, res: Response) => {
  try {
    const { roomId, message, image } = req.body;
    const userId = (req as any).user?.userId;

    if (!roomId || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'roomId and message are required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    const result = await chatService.sendMessage({
      roomId,
      userId,
      message,
      image
    });

    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Error in sendMessageREST', { error });
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message'
    });
  }
};

export const getRoomUsers = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    // Validate roomId
    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid roomId'
      });
    }

    const data = await chatService.getAllMessages(roomId);
    
    res.status(200).json({
      status: 'success',
      roomId,
      userCount: data.userIds.length,
      userIds: data.userIds
    });
  } catch (error) {
    logger.error('Error in getRoomUsers', { error });
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch room users'
    });
  }
};

export const getUserRooms = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
  
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized'
        });
      }
  
      const rooms = await chatService.getUserRooms(userId);
      
      res.status(200).json({
        status: 'success',
        data: rooms
      });
    } catch (error) {
      logger.error('Error in getUserRooms', { error });
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user rooms'
      });
    }
  };