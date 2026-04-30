import { prisma } from "../../database/index.js";
import type { 
  IPostManagementRepository,
  createPostRequest,
  UpdatePostRequest,
  PostResponse,
} from "../../interface/admin/post.management.interface.js";

class PostManagementRepository implements IPostManagementRepository {
  async findAll(search: string, skip: number, take: number): Promise<[any[], number]> {
    const where: any = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } }
      ]
    } : {};

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            }
          },
          images: true,
          _count: {
            select: { comments: true }
          }
        }
      }),
      prisma.communityPost.count({ where })
    ]);

    return [posts, total];
  }

  async findById(id: string) {
    return await prisma.communityPost.findUnique({ 
      where: { id },
      include: {
        author: {
          select: { id: true, name: true }
        },
        images: true,
        comments: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });
  }

  async create(request: createPostRequest): Promise<PostResponse> {
    const { images, ...postData } = request;
    const post = await prisma.communityPost.create({
      data: {
        ...postData,
        ...(images ? {
          images: {
            create: images.map((url: string) => ({ url }))
          }
        } : {})
      },
      include: {
        author: { select: { id: true, name: true } },
        images: true
      }
    });
    return post as unknown as PostResponse;
  }

  async update(request: UpdatePostRequest): Promise<PostResponse> {
    const { id, images, ...postData } = request;
    
    if (images) {
      await prisma.postImage.deleteMany({ where: { postId: id } });
    }

    const post = await prisma.communityPost.update({
      where: { id },
      data: {
        ...postData,
        ...(images ? {
          images: {
            create: images.map((url: string) => ({ url }))
          }
        } : {})
      },
      include: {
        author: { select: { id: true, name: true } },
        images: true
      }
    });
    return post as unknown as PostResponse;
  }

  async delete(id: string) {
    return await prisma.communityPost.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<any> {
    return await prisma.communityPost.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async createComment(postId: string, userId: string, content: string): Promise<any> {
    return await prisma.comment.create({
      data: {
        content,
        postId,
        userId
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });
  }

  async deleteComment(commentId: string): Promise<any> {
    return await prisma.comment.delete({
      where: { id: commentId }
    });
  }
}

export { PostManagementRepository };