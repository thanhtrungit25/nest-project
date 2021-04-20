import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import Post from './post.entity';
import PostSearchBody from './types/postSearchBody.interface';
import PostSearchResult from './types/postSearchResponse.interface';

@Injectable()
export default class PostsSearchService {
  index = 'posts';

  constructor(private elasticSearchService: ElasticsearchService) {}

  async indexPost(post: Post) {
    this.elasticSearchService.index<PostSearchResult, PostSearchBody>({
      index: this.index,
      body: {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.author.id,
      },
    });
  }

  async search(text: string) {
    try {
      const { body } = await this.elasticSearchService.search<PostSearchResult>(
        {
          index: this.index,
          body: {
            query: {
              multi_match: {
                query: text,
                fields: ['title', 'content'],
              },
            },
          },
        },
      );
      const hits = body.hits.hits;
      return hits.map((item) => item._source);
    } catch (error) {
      console.error('error', JSON.stringify(error));
    }
  }

  async remove(postId: number) {
    await this.elasticSearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: postId,
          },
        },
      },
    });
  }

  async update(post: Post) {
    const newBody: PostSearchBody = {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.author.id,
    };

    const script = Object.entries(newBody).reduce((result, [key, value]) => {
      return `${result} ctx._source.${key}='${value}';`;
    }, '');

    return this.elasticSearchService.updateByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: post.id,
          },
        },
        script: {
          inline: script,
        },
      },
    });
  }
}
