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
        paragraphs: post.paragraphs,
        authorId: post.author.id,
      },
    });
  }

  async search(text: string, offset?: number, limit?: number) {
    try {
      const { body } = await this.elasticSearchService.search<PostSearchResult>(
        {
          index: this.index,
          from: offset,
          size: limit,
          body: {
            query: {
              multi_match: {
                query: text,
                fields: ['title', 'paragraphs'],
              },
            },
            sort: {
              id: {
                order: 'asc',
              },
            },
          },
        },
      );
      const count = body.hits.total.value;
      const hits = body.hits.hits;
      const results = hits.map((item) => item._source);
      return {
        count,
        results,
      };
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
      paragraphs: post.paragraphs,
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
