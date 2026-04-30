import { prisma } from '../database/index.js';
import type{ CreatePostRequest, ICommunityRepository } from '../interface/community.interface.js';

export class CommunityRepository implements ICommunityRepository {
    async findAll(type?: string) {
        return await prisma.communityPost.findMany({
            where: type ? { type: type as any } : {},
            include: {
                images: true,
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findById(id: string) {
        return await prisma.communityPost.findUnique({
            where: { id },
            include: {
                images: true,
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });
    }

    async create(data: CreatePostRequest) {
        return await prisma.communityPost.create({
            data: {
                title: data.title,
                content: data.content,
                type: data.type,
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
                authorId: data.authorId,
                address: data.address ?? null,
                images: {
                    create: data.images?.map(url => ({ url })) || []
                }
            },
            include: {
                images: true,
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    async addComment(postId: string, userId: string, content: string) {
        return await prisma.comment.create({
            data: {
                postId,
                userId,
                content
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }
}
