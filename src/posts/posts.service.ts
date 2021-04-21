import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UpdatePostDto from './dto/updatePost.dto';
import CreatePostDto from './dto/createPost.dto';
import Post from './post.entity';
import { In, Repository } from 'typeorm';
import PostNotFoundException from './exception/postNotFound.exception';
import User from '../users/user.entity';
import PostsSearchService from './postsSearch.service';
import PostSearchDataResult from './types/postSearchDataResult';

@Injectable()
export default class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private postsSearchService: PostsSearchService,
  ) {}

  async getAllPosts(offset?: number, limit?: number) {
    const [items, count] = await this.postsRepository.findAndCount({
      relations: ['author'],
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
    });
    return {
      items,
      count,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne(id, {
      relations: ['author'],
    });
    if (post) {
      return post;
    }
    throw new PostNotFoundException(id);
  }

  async updatePost(id: number, post: UpdatePostDto) {
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne(id, {
      relations: ['author'],
    });
    if (updatedPost) {
      await this.postsSearchService.update(updatedPost);
      return updatedPost;
    }
    throw new PostNotFoundException(id);
  }

  async createPost(post: CreatePostDto, user: User, index: boolean) {
    const newPost = await this.postsRepository.create({
      ...post,
      author: user,
    });
    await this.postsRepository.save(newPost);
    if (index) {
      this.postsSearchService.indexPost(newPost);
    }
    return newPost;
  }

  async deletePost(id: number) {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    this.postsSearchService.remove(id);
  }

  async searchForPosts(
    text: string,
    offset?: number,
    limit?: number,
  ): Promise<PostSearchDataResult> {
    const { results, count } = await this.postsSearchService.search(
      text,
      offset,
      limit,
    );
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return {
        items: [],
        count,
      };
    }
    const items = await this.postsRepository.find({
      where: { id: In(ids) },
    });
    return {
      items,
      count,
    };
  }
}
