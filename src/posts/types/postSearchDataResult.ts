import Post from '../post.entity';

interface PostSearchDataResult {
  items: Array<Post>;
  count: number;
}

export default PostSearchDataResult;
